/**
 * Mock API implementation.
 * Swap this out in `src/lib/api/index.ts` when backend endpoints exist.
 */
import { DEMO_CREDENTIALS } from "@/lib/constants";
import { delay } from "@/lib/utils";
import {
  MOCK_APPROVALS,
  MOCK_AUDIT_LOGS,
  MOCK_CONVERSATIONS,
  MOCK_CUSTOMERS,
  MOCK_DASHBOARD,
  MOCK_INVOICES,
  MOCK_NOTIFICATIONS,
  MOCK_PLATFORM_BUSINESSES,
  MOCK_PLATFORM_OVERVIEW,
  MOCK_REPORTS,
  MOCK_TEAM,
  MOCK_TIMELINE,
  MOCK_USERS,
  MOCK_WORKSPACE,
} from "@/lib/mock/data";
import type {
  ContactSubmission,
  ConversationFilter,
  Customer,
  Invoice,
  User,
  Workspace,
} from "@/types";

let customers = [...MOCK_CUSTOMERS];
let invoices = [...MOCK_INVOICES];
let conversations = [...MOCK_CONVERSATIONS];
let notifications = [...MOCK_NOTIFICATIONS];
let approvals = [...MOCK_APPROVALS];
let workspace: Workspace = { ...MOCK_WORKSPACE };
let team = [...MOCK_TEAM];
let sessionUser: User | null = null;

export const mockApi = {
  async login(email: string, password: string) {
    await delay();
    const normalized = email.trim().toLowerCase();
    if (
      normalized === DEMO_CREDENTIALS.business.email &&
      password === DEMO_CREDENTIALS.business.password
    ) {
      sessionUser = { ...MOCK_USERS[0] };
      return { user: sessionUser };
    }
    if (
      normalized === DEMO_CREDENTIALS.admin.email &&
      password === DEMO_CREDENTIALS.admin.password
    ) {
      sessionUser = { ...MOCK_USERS[1] };
      return { user: sessionUser };
    }
    throw new Error("Invalid email or password. Use the demo credentials shown on the form.");
  },

  async signup(payload: { name: string; email: string; password: string }) {
    await delay();
    if (!payload.email || !payload.password || payload.password.length < 8) {
      throw new Error("Please provide a valid email and a password with at least 8 characters.");
    }
    sessionUser = {
      ...MOCK_USERS[0],
      id: "user_new",
      name: payload.name || "New User",
      email: payload.email,
      onboardingCompleted: false,
    };
    return { user: sessionUser, needsVerification: true };
  },

  async logout() {
    await delay(100);
    sessionUser = null;
    return { ok: true };
  },

  async getSession() {
    await delay(80);
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("receivly_session");
      if (raw) {
        sessionUser = JSON.parse(raw) as User;
      }
    }
    return { user: sessionUser };
  },

  async persistSession(user: User | null) {
    if (typeof window === "undefined") return;
    if (user) window.localStorage.setItem("receivly_session", JSON.stringify(user));
    else window.localStorage.removeItem("receivly_session");
  },

  async requestPasswordReset(email: string) {
    await delay();
    if (!email) throw new Error("Email is required.");
    return { ok: true, message: "If an account exists, a reset link has been sent (demo)." };
  },

  async resetPassword(_token: string, password: string) {
    await delay();
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    return { ok: true };
  },

  async verifyEmail(_token: string) {
    await delay();
    return { ok: true };
  },

  async getWorkspace() {
    await delay();
    return workspace;
  },

  async updateWorkspace(patch: Partial<Workspace>) {
    await delay();
    workspace = { ...workspace, ...patch };
    return workspace;
  },

  async getTeam() {
    await delay();
    return team;
  },

  async inviteTeamMember(email: string, role: User["role"]) {
    await delay();
    const member = {
      id: `tm_${Date.now()}`,
      userId: `user_${Date.now()}`,
      name: email.split("@")[0],
      email,
      role,
      status: "pending" as const,
      invitedAt: new Date().toISOString(),
    };
    team = [member, ...team];
    return member;
  },

  async getCustomers(query?: string) {
    await delay();
    if (!query) return customers;
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.primaryContact.toLowerCase().includes(q),
    );
  },

  async getCustomer(id: string) {
    await delay();
    const customer = customers.find((c) => c.id === id);
    if (!customer) throw new Error("Customer not found");
    return customer;
  },

  async saveCustomer(input: Partial<Customer> & { name: string; email: string }) {
    await delay();
    if (input.id) {
      customers = customers.map((c) => (c.id === input.id ? { ...c, ...input } : c));
      return customers.find((c) => c.id === input.id)!;
    }
    const created: Customer = {
      id: `cus_${Date.now()}`,
      workspaceId: workspace.id,
      name: input.name,
      primaryContact: input.primaryContact || input.name,
      email: input.email,
      phone: input.phone,
      billingAddress: input.billingAddress,
      country: input.country || "United States",
      currency: input.currency || workspace.currency,
      taxReference: input.taxReference,
      notes: input.notes,
      tags: input.tags || [],
      language: input.language || "en",
      status: "active",
      outstandingBalance: 0,
      overdueBalance: 0,
      contacts: [
        {
          id: `cc_${Date.now()}`,
          name: input.primaryContact || input.name,
          email: input.email,
          isBillingContact: true,
        },
      ],
      createdAt: new Date().toISOString(),
    };
    customers = [created, ...customers];
    return created;
  },

  async getInvoices(filters?: { status?: string; q?: string }) {
    await delay();
    let list = [...invoices];
    if (filters?.status && filters.status !== "all") {
      list = list.filter((i) => i.status === filters.status);
    }
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      list = list.filter((i) => {
        const customer = customers.find((c) => c.id === i.customerId);
        return (
          i.number.toLowerCase().includes(q) ||
          customer?.name.toLowerCase().includes(q) ||
          customer?.email.toLowerCase().includes(q) ||
          i.poReference?.toLowerCase().includes(q)
        );
      });
    }
    return list;
  },

  async getInvoice(id: string) {
    await delay();
    const invoice = invoices.find((i) => i.id === id);
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  },

  async getPublicInvoice(token: string) {
    await delay();
    const invoice = invoices.find((i) => i.id === token || i.number === token);
    if (!invoice) throw new Error("Invoice not found");
    const customer = customers.find((c) => c.id === invoice.customerId)!;
    return { invoice, customer, workspace };
  },

  async saveInvoice(input: Partial<Invoice> & { customerId: string }) {
    await delay();
    if (input.id) {
      invoices = invoices.map((i) =>
        i.id === input.id ? { ...i, ...input, updatedAt: new Date().toISOString() } : i,
      );
      return invoices.find((i) => i.id === input.id)!;
    }
    const amount =
      input.lineItems?.reduce(
        (sum, li) => sum + li.quantity * li.rate * (1 + li.taxRate / 100) - li.discount,
        0,
      ) ||
      input.amount ||
      0;
    const created: Invoice = {
      id: `inv_${Date.now()}`,
      workspaceId: workspace.id,
      customerId: input.customerId,
      number: `${workspace.invoicePrefix}${workspace.nextInvoiceNumber}`,
      status: input.status || "draft",
      issueDate: input.issueDate || new Date().toISOString().slice(0, 10),
      dueDate: input.dueDate || new Date().toISOString().slice(0, 10),
      currency: input.currency || workspace.currency,
      lineItems: input.lineItems || [],
      notes: input.notes,
      terms: input.terms,
      poReference: input.poReference,
      paymentLink: input.paymentLink,
      collectorPaused: false,
      tags: input.tags || [],
      amount,
      amountPaid: 0,
      balance: amount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    workspace = { ...workspace, nextInvoiceNumber: workspace.nextInvoiceNumber + 1 };
    invoices = [created, ...invoices];
    return created;
  },

  async getTimeline(invoiceId: string) {
    await delay();
    return MOCK_TIMELINE.filter((t) => t.invoiceId === invoiceId);
  },

  async getDashboard() {
    await delay();
    return MOCK_DASHBOARD;
  },

  async getConversations(filter: ConversationFilter = "all") {
    await delay();
    if (filter === "all") return conversations;
    const map: Record<string, keyof (typeof conversations)[0]> = {
      unread: "unread",
      needs_approval: "needsApproval",
      disputed: "disputed",
      payment_claimed: "paymentClaimed",
      failed: "failed",
      promise_missed: "promiseMissed",
      low_confidence: "lowConfidence",
    };
    const key = map[filter];
    return conversations.filter((c) => Boolean(c[key]));
  },

  async getConversation(id: string) {
    await delay();
    const conversation = conversations.find((c) => c.id === id);
    if (!conversation) throw new Error("Conversation not found");
    return conversation;
  },

  async getApprovals() {
    await delay();
    return approvals;
  },

  async resolveApproval(id: string, action: "approve" | "reject" | "edit", body?: string) {
    await delay();
    approvals = approvals.filter((a) => a.id !== id);
    if (action === "edit" && body) {
      // demo: keep rejected from queue after edit+approve simulation
    }
    return { ok: true };
  },

  async getNotifications() {
    await delay();
    return notifications;
  },

  async markNotificationRead(id: string) {
    await delay();
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    return notifications;
  },

  async getReports() {
    await delay();
    return MOCK_REPORTS;
  },

  async getPlatformOverview() {
    await delay();
    return MOCK_PLATFORM_OVERVIEW;
  },

  async getPlatformBusinesses() {
    await delay();
    return MOCK_PLATFORM_BUSINESSES;
  },

  async getAuditLogs() {
    await delay();
    return MOCK_AUDIT_LOGS;
  },

  async submitContact(payload: ContactSubmission) {
    await delay();
    if (!payload.name || !payload.email || !payload.message) {
      throw new Error("Name, email, and message are required.");
    }
    return { ok: true };
  },

  async importCsvPreview(type: "customers" | "invoices", rows: number) {
    await delay(400);
    return {
      type,
      valid: Math.max(rows - 1, 0),
      errors: rows > 0 ? 1 : 0,
      duplicates: 0,
      sample: ["Row 2 looks valid", "Row 3 missing email (demo error)"],
    };
  },

  async recordPayment(
    invoiceId: string,
    payment: { amount: number; date: string; method: string; reference?: string; notes?: string },
  ) {
    await delay();
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    const amountPaid = invoice.amountPaid + payment.amount;
    const balance = Math.max(invoice.amount - amountPaid, 0);
    const status = balance <= 0 ? "paid" : amountPaid > 0 ? "partially_paid" : invoice.status;
    const updated = {
      ...invoice,
      amountPaid,
      balance,
      status: status as Invoice["status"],
      updatedAt: new Date().toISOString(),
    };
    invoices = invoices.map((i) => (i.id === invoiceId ? updated : i));
    return updated;
  },

  async updateConversation(
    id: string,
    patch: Partial<(typeof conversations)[0]>,
  ) {
    await delay();
    conversations = conversations.map((c) => (c.id === id ? { ...c, ...patch } : c));
    const conversation = conversations.find((c) => c.id === id);
    if (!conversation) throw new Error("Conversation not found");
    return conversation;
  },

  async markAllNotificationsRead() {
    await delay();
    notifications = notifications.map((n) => ({ ...n, read: true }));
    return notifications;
  },
};

export type ApiClient = typeof mockApi;
