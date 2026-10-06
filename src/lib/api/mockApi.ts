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
let auditLogs = [...MOCK_AUDIT_LOGS];
let platformBusinesses = [...MOCK_PLATFORM_BUSINESSES];
let timeline = [...MOCK_TIMELINE];
let workspace: Workspace = { ...MOCK_WORKSPACE };
let team = [...MOCK_TEAM];
let sessionUser: User | null = null;

function customerWithBalances(customer: Customer): Customer {
  const relevant = invoices.filter((i) => i.customerId === customer.id && i.currency === customer.currency && !["draft", "paid", "void", "written_off"].includes(i.status));
  const today = new Date().toISOString().slice(0, 10);
  return { ...customer, outstandingBalance: relevant.reduce((n, i) => n + i.balance, 0), overdueBalance: relevant.filter((i) => i.dueDate < today).reduce((n, i) => n + i.balance, 0) };
}

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
    void _token;
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    return { ok: true };
  },

  async verifyEmail(_token: string) {
    await delay();
    void _token;
    return { ok: true };
  },

  async getWorkspace() {
    await delay();
    if (typeof window !== "undefined" && !workspace.gmailEmail) {
      const saved = window.localStorage.getItem("receivly_gmail");
      if (saved) {
        try {
          const email = JSON.parse(saved).email;
          if (typeof email === "string" && email.includes("@")) workspace = { ...workspace, gmailEmail: email };
        } catch { /* ignore a bad saved account */ }
      }
    }
    return workspace;
  },

  async connectGmail(email: string) {
    await delay();
    const gmailEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmailEmail)) throw new Error("Enter a valid Gmail address.");
    workspace = { ...workspace, gmailEmail };
    if (typeof window !== "undefined") window.localStorage.setItem("receivly_gmail", JSON.stringify({ email: gmailEmail }));
    return workspace;
  },

  async disconnectGmail() {
    await delay();
    workspace = { ...workspace, gmailEmail: undefined };
    if (typeof window !== "undefined") window.localStorage.removeItem("receivly_gmail");
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

  async updateTeamMember(id: string, patch: Partial<(typeof team)[number]>) {
    await delay();
    team = team.map((m) => m.id === id ? { ...m, ...patch } : m);
    const member = team.find((m) => m.id === id);
    if (!member) throw new Error("Team member not found.");
    return member;
  },

  async getCustomers(query?: string) {
    await delay();
    if (!query) return customers.map(customerWithBalances);
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.primaryContact.toLowerCase().includes(q),
    ).map(customerWithBalances);
  },

  async getCustomer(id: string) {
    await delay();
    const customer = customers.find((c) => c.id === id);
    if (!customer) throw new Error("Customer not found");
    return customerWithBalances(customer);
  },

  async saveCustomer(input: Partial<Customer> & { name: string; email: string }) {
    await delay();
    const duplicate = customers.find((c) => c.email.toLowerCase() === input.email.trim().toLowerCase() && c.id !== input.id);
    if (duplicate) throw new Error(`A customer with ${input.email} already exists. Review that record before adding another.`);
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
    if (input.number && invoices.some((i) => i.number.toLowerCase() === input.number!.toLowerCase() && i.id !== input.id)) {
      throw new Error(`Invoice ${input.number} already exists in this workspace.`);
    }
    if (input.id) {
      if (!invoices.some((i) => i.id === input.id)) throw new Error("Invoice not found.");
      invoices = invoices.map((i) =>
        i.id === input.id ? { ...i, ...input, updatedAt: new Date().toISOString() } : i,
      );
      timeline = [{ id: `tl_${Date.now()}`, invoiceId: input.id, type: input.collectorPaused === undefined ? "edited" as const : input.collectorPaused ? "paused" as const : "resumed" as const, title: input.collectorPaused === undefined ? "Invoice updated" : input.collectorPaused ? "Collector paused" : "Collector resumed", actor: "Demo user", createdAt: new Date().toISOString() }, ...timeline];
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
      number: input.number || `${workspace.invoicePrefix}${workspace.nextInvoiceNumber}`,
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
    timeline = [{ id: `tl_${Date.now()}`, invoiceId: created.id, type: "created" as const, title: "Invoice created", actor: "Demo user", createdAt: new Date().toISOString() }, ...timeline];
    return created;
  },

  async sendInvoice(id: string) {
    await delay();
    const invoice = invoices.find((i) => i.id === id);
    if (!invoice || invoice.status !== "draft") throw new Error("Only draft invoices can be sent from this demo.");
    if (!workspace.gmailEmail) throw new Error("Connect the Gmail account you want to send invoices from.");
    const customer = customers.find((item) => item.id === invoice.customerId);
    const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(invoice.balance);
    const subject = `Invoice ${invoice.number} from ${workspace.companyName}`;
    const body = `Hi ${customer?.primaryContact || "there"},\n\nInvoice ${invoice.number} for ${amount} is ready. It is due ${invoice.dueDate}.${invoice.paymentLink ? ` Pay here: ${invoice.paymentLink}` : ""}\n\n${workspace.signature}`;
    this.recordOutboundEmail({ invoice, subject, body, stage: "invoice", aiGenerated: false });
    const updated: Invoice = { ...invoice, status: "sent", updatedAt: new Date().toISOString() };
    invoices = invoices.map((i) => i.id === id ? updated : i);
    timeline = [{ id: `tl_${Date.now()}`, invoiceId: id, type: "sent", title: "Invoice sent with Gmail", description: `From ${workspace.gmailEmail} to ${customer?.email || "the customer"}. No email left this demo.`, actor: "Demo user", createdAt: new Date().toISOString() }, ...timeline];
    return updated;
  },

  async sendCollectorReminder(invoiceId: string, input: { subject: string; body: string; stage: "upcoming" | "due" | "overdue" }) {
    await delay();
    if (!workspace.aiCollectorActive) throw new Error("The AI Collector is paused.");
    if (!workspace.gmailEmail) throw new Error("Connect the Gmail account these reminders send from.");
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice || invoice.balance <= 0 || ["draft", "paid", "void", "written_off"].includes(invoice.status)) throw new Error("This invoice is not open for collection.");
    if (invoice.collectorPaused) throw new Error("The collector is paused on this invoice.");
    this.recordOutboundEmail({ invoice, subject: input.subject, body: input.body, stage: input.stage, aiGenerated: true });
    timeline = [{ id: `tl_${Date.now()}`, invoiceId, type: "reminder", title: "AI reminder queued", description: `Sent with Gmail from ${workspace.gmailEmail}. No email left this demo.`, actor: "AI Collector", createdAt: new Date().toISOString() }, ...timeline];
    return conversations.find((item) => item.invoiceId === invoiceId)!;
  },

  recordOutboundEmail({ invoice, subject, body, stage, aiGenerated }: { invoice: Invoice; subject: string; body: string; stage: "invoice" | "upcoming" | "due" | "overdue"; aiGenerated: boolean }) {
    const now = new Date().toISOString();
    const existing = conversations.find((item) => item.invoiceId === invoice.id);
    const conversationId = existing?.id || `conv_${Date.now()}`;
    const message = { id: `msg_${Date.now()}`, conversationId, direction: "outbound" as const, channel: "email" as const, subject, body, status: "sent" as const, createdAt: now, aiGenerated, viaGmail: true, stage };
    if (existing) {
      conversations = conversations.map((item) => item.id === existing.id ? { ...item, subject, lastMessageAt: now, messages: [...item.messages, message] } : item);
      return;
    }
    conversations = [{ id: conversationId, workspaceId: workspace.id, customerId: invoice.customerId, invoiceId: invoice.id, subject, unread: false, needsApproval: false, disputed: false, paymentClaimed: false, failed: false, promiseMissed: false, lowConfidence: false, lastMessageAt: now, messages: [message], internalNotes: [] }, ...conversations];
  },

  async voidInvoice(id: string) {
    await delay();
    const invoice = invoices.find((i) => i.id === id);
    if (!invoice || invoice.status === "paid") throw new Error("A paid invoice cannot be voided.");
    const updated: Invoice = { ...invoice, status: "void", collectorPaused: true, updatedAt: new Date().toISOString() };
    invoices = invoices.map((i) => i.id === id ? updated : i);
    timeline = [{ id: `tl_${Date.now()}`, invoiceId: id, type: "status_change", title: "Invoice voided", actor: "Demo user", createdAt: new Date().toISOString() }, ...timeline];
    return updated;
  },

  async deleteDraft(id: string) {
    await delay();
    const invoice = invoices.find((i) => i.id === id);
    if (!invoice || invoice.status !== "draft") throw new Error("Only drafts can be deleted.");
    invoices = invoices.filter((i) => i.id !== id);
    timeline = timeline.filter((t) => t.invoiceId !== id);
    return { ok: true };
  },

  async addInvoiceAttachment(id: string, file: { name: string; size: number; type: string }) {
    await delay();
    const invoice = invoices.find((i) => i.id === id);
    if (!invoice) throw new Error("Invoice not found.");
    if (file.size > 10_000_000 || !["application/pdf", "image/png", "image/jpeg"].includes(file.type)) throw new Error("Use PDF, PNG, or JPEG files under 10 MB.");
    const updated = { ...invoice, attachments: [...(invoice.attachments || []), { ...file, id: `att_${Date.now()}` }] };
    invoices = invoices.map((i) => i.id === id ? updated : i);
    timeline = [{ id: `tl_${Date.now()}`, invoiceId: id, type: "edited", title: `Attachment added: ${file.name}`, description: "Demo metadata only; file storage connects with the backend.", actor: "Demo user", createdAt: new Date().toISOString() }, ...timeline];
    return updated;
  },

  async getTimeline(invoiceId: string) {
    await delay();
    return timeline.filter((t) => t.invoiceId === invoiceId);
  },

  async getDashboard(currency = "USD") {
    await delay();
    const today = new Date().toISOString().slice(0, 10);
    const active = invoices.filter((i) => i.currency === currency && !["draft", "paid", "void", "written_off"].includes(i.status));
    const overdue = active.filter((i) => i.dueDate < today);
    const age = (i: Invoice) => Math.ceil((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${i.dueDate}T00:00:00Z`)) / 86400000);
    const sum = (items: Invoice[]) => items.reduce((total, i) => total + i.balance, 0);
    const aging = [
      { label: "Current", amount: sum(active.filter((i) => age(i) <= 0)) },
      { label: "1–30 days", amount: sum(active.filter((i) => age(i) > 0 && age(i) <= 30)) },
      { label: "31–60 days", amount: sum(active.filter((i) => age(i) > 30 && age(i) <= 60)) },
      { label: "61–90 days", amount: sum(active.filter((i) => age(i) > 60 && age(i) <= 90)) },
      { label: "90+ days", amount: sum(active.filter((i) => age(i) > 90)) },
    ];
    return { ...MOCK_DASHBOARD, currency, totalOutstanding: sum(active), overdueAmount: sum(overdue), overdueCount: overdue.length, promisedAmount: sum(active.filter((i) => i.status === "payment_promised")), disputedAmount: sum(active.filter((i) => i.status === "disputed")), collectedThisMonth: invoices.filter((i) => i.currency === currency && i.updatedAt.slice(0, 7) === today.slice(0, 7)).reduce((n, i) => n + i.amountPaid, 0), automationStatus: workspace.aiCollectorActive ? "active" as const : "paused" as const, aging };
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
    const approval = approvals.find((a) => a.id === id);
    if (!approval) throw new Error("Approval item not found.");
    conversations = conversations.map((c) => c.id === approval.conversationId ? { ...c, needsApproval: false, messages: c.messages.some((m) => m.status === "draft") ? c.messages.map((m) => m.status === "draft" ? { ...m, body: body || m.body, status: action === "reject" ? "draft" as const : "sent" as const, viaGmail: action !== "reject", requiresApproval: false } : m) : action === "reject" ? c.messages : [...c.messages, { id: `msg_${Date.now()}`, conversationId: c.id, direction: "outbound" as const, channel: "email" as const, body: body || approval.draftBody, status: "sent" as const, viaGmail: true, createdAt: new Date().toISOString() }] } : c);
    approvals = approvals.filter((a) => a.id !== id);
    auditLogs = [{ id: `audit_${Date.now()}`, workspaceId: workspace.id, user: "Demo user", action: `approval.${action}`, entity: approval.invoiceId, date: new Date().toISOString() }, ...auditLogs];
    return { ok: true };
  },

  async saveConversationDraft(id: string, body: string) {
    await delay();
    conversations = conversations.map((c) => c.id === id ? { ...c, messages: c.messages.some((m) => m.status === "draft") ? c.messages.map((m) => m.status === "draft" ? { ...m, body } : m) : [...c.messages, { id: `msg_${Date.now()}`, conversationId: id, direction: "outbound" as const, channel: "email" as const, body, status: "draft" as const, createdAt: new Date().toISOString() }] } : c);
    return this.getConversation(id);
  },

  async sendConversationDraft(id: string, body: string) {
    await delay();
    conversations = conversations.map((c) => c.id === id ? { ...c, needsApproval: false, messages: c.messages.some((m) => m.status === "draft") ? c.messages.map((m) => m.status === "draft" ? { ...m, body, status: "sent" as const, viaGmail: true } : m) : [...c.messages, { id: `msg_${Date.now()}`, conversationId: id, direction: "outbound" as const, channel: "email" as const, body, status: "sent" as const, viaGmail: true, createdAt: new Date().toISOString() }] } : c);
    return this.getConversation(id);
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

  async getReports(currency = "USD") {
    await delay();
    const today = new Date().toISOString().slice(0, 10);
    const active = invoices.filter((i) => i.currency === currency && !["draft", "paid", "void", "written_off"].includes(i.status));
    const overdue = (i: Invoice) => i.dueDate < today;
    const outstandingByCustomer = customers.map((c) => ({ name: c.name, amount: active.filter((i) => i.customerId === c.id).reduce((n, i) => n + i.balance, 0), overdue: active.filter((i) => i.customerId === c.id && overdue(i)).reduce((n, i) => n + i.balance, 0) })).filter((row) => row.amount > 0);
    const dashboard = await this.getDashboard(currency);
    return { ...MOCK_REPORTS, currency, outstandingByCustomer, agingBands: dashboard.aging, collectedAmount: invoices.filter((i) => i.currency === currency).reduce((n, i) => n + i.amountPaid, 0) };
  },

  async getPlatformOverview() {
    await delay();
    return MOCK_PLATFORM_OVERVIEW;
  },

  async getPlatformBusinesses() {
    await delay();
    return platformBusinesses;
  },

  async updatePlatformBusiness(id: string, patch: Partial<(typeof platformBusinesses)[number]>) {
    await delay();
    if (!platformBusinesses.some((b) => b.id === id)) throw new Error("Business not found.");
    platformBusinesses = platformBusinesses.map((b) => b.id === id ? { ...b, ...patch } : b);
    auditLogs = [{ id: `audit_${Date.now()}`, workspaceId: id, user: "Platform Owner", action: "business.settings_updated", entity: id, date: new Date().toISOString() }, ...auditLogs];
    return platformBusinesses.find((b) => b.id === id)!;
  },

  async getAuditLogs() {
    await delay();
    return auditLogs;
  },

  async submitContact(payload: ContactSubmission) {
    await delay();
    if (!payload.name || !payload.email || !payload.message) {
      throw new Error("Name, email, and message are required.");
    }
    return { ok: true };
  },

  async importCsvPreview(type: "customers" | "invoices", rows: Record<string, string>[]) {
    await delay(180);
    const details = rows.map((row, index) => {
      const issues: string[] = [];
      const email = (row.email || "").trim().toLowerCase();
      const name = (row.customer_name || "").trim();
      if (!name) issues.push("customer_name is required");
      if (!/^\S+@\S+\.\S+$/.test(email)) issues.push("valid email is required");
      const duplicate = customers.some((c) => c.email.toLowerCase() === email);
      if (type === "invoices") {
        const amount = Number(row.amount);
        if (!row.invoice_number?.trim()) issues.push("invoice_number is required");
        if (!Number.isFinite(amount) || amount <= 0) issues.push("amount must be positive");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(row.due_date || "") || Number.isNaN(Date.parse(row.due_date))) issues.push("due_date must be YYYY-MM-DD");
        if (!/^[A-Z]{3}$/.test((row.currency || "").toUpperCase())) issues.push("currency must be a three-letter code");
      }
      const invoiceDuplicate = type === "invoices" && invoices.some((i) => i.number.toLowerCase() === row.invoice_number?.toLowerCase());
      if (invoiceDuplicate) issues.push("invoice number already exists");
      return { row: index + 2, values: row, issues, duplicate: type === "customers" && duplicate };
    });
    return { type, valid: details.filter((d) => d.issues.length === 0 && !d.duplicate).length, errors: details.filter((d) => d.issues.length > 0).length, duplicates: details.filter((d) => d.duplicate).length, details };
  },

  async importCsv(type: "customers" | "invoices", rows: Record<string, string>[]) {
    const preview = await this.importCsvPreview(type, rows);
    if (preview.errors || preview.duplicates) throw new Error("Resolve invalid and duplicate rows before importing.");
    let imported = 0;
    for (const row of rows) {
      if (type === "customers") {
        await this.saveCustomer({ name: row.customer_name, email: row.email, phone: row.phone, country: row.country || workspace.country, tags: (row.tags || "").split("|").filter(Boolean) });
      } else {
        let customer = customers.find((c) => c.email.toLowerCase() === row.email.toLowerCase());
        if (!customer) customer = await this.saveCustomer({ name: row.customer_name, email: row.email });
        await this.saveInvoice({ customerId: customer.id, number: row.invoice_number, dueDate: row.due_date, currency: row.currency.toUpperCase(), amount: Number(row.amount), poReference: row.po_reference, status: "draft" });
      }
      imported++;
    }
    return { imported };
  },

  async recordPayment(
    invoiceId: string,
    payment: { amount: number; date: string; method: string; reference?: string; notes?: string },
  ) {
    await delay();
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    if (!Number.isFinite(payment.amount) || payment.amount <= 0 || payment.amount > invoice.balance) throw new Error("Enter a payment greater than zero and no more than the remaining balance.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payment.date)) throw new Error("Enter a valid payment date.");
    const amountPaid = invoice.amountPaid + payment.amount;
    const balance = Math.max(invoice.amount - amountPaid, 0);
    const status = balance <= 0 ? "paid" : amountPaid > 0 ? "partially_paid" : invoice.status;
    const updated = {
      ...invoice,
      amountPaid,
      balance,
      status: status as Invoice["status"],
      collectorPaused: balance <= 0 ? true : invoice.collectorPaused,
      updatedAt: new Date().toISOString(),
    };
    invoices = invoices.map((i) => (i.id === invoiceId ? updated : i));
    timeline = [{ id: `tl_${Date.now()}`, invoiceId, type: "payment", title: `Payment recorded: ${payment.amount} ${invoice.currency}`, description: `${payment.method}${payment.reference ? ` · ${payment.reference}` : ""}`, actor: "Demo user", createdAt: new Date().toISOString() }, ...timeline];
    return updated;
  },

  async updateConversation(
    id: string,
    patch: Partial<(typeof conversations)[0]>,
  ) {
    await delay();
    if (patch.classificationOverride || patch.promisedDateOverride) auditLogs = [{ id: `audit_${Date.now()}`, workspaceId: workspace.id, user: "Demo user", action: "conversation.classification_override", entity: id, date: new Date().toISOString() }, ...auditLogs];
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
