/** Shared domain types — keep in sync with future backend contracts */

export type UserRole = "platform_admin" | "admin" | "finance_manager" | "viewer" | "member";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "inactive";

export type PlanId = "starter" | "professional" | "business";

export type InvoiceStatus =
  | "draft"
  | "scheduled"
  | "sent"
  | "viewed"
  | "due"
  | "overdue"
  | "payment_promised"
  | "payment_claimed"
  | "disputed"
  | "partially_paid"
  | "paid"
  | "paused"
  | "void"
  | "written_off";

export type ConversationFilter =
  | "all"
  | "unread"
  | "needs_approval"
  | "disputed"
  | "payment_claimed"
  | "failed"
  | "promise_missed"
  | "low_confidence";

export type ReminderTone = "friendly" | "professional" | "firm";

export type ReplyCategory =
  | "payment_promise"
  | "claims_already_paid"
  | "requests_extension"
  | "invoice_dispute"
  | "needs_invoice_copy"
  | "wrong_contact"
  | "out_of_office"
  | "unsubscribe"
  | "abusive_sensitive"
  | "unclear";

export interface User {
  id: string;
  email: string;
  name: string;
  jobRole?: string;
  avatarUrl?: string;
  timezone: string;
  locale: string;
  role: UserRole;
  workspaceId?: string;
  notificationPreferences: NotificationPreferences;
  onboardingCompleted: boolean;
}

export interface NotificationPreferences {
  disputes: boolean;
  paymentClaims: boolean;
  extensionRequests: boolean;
  lowConfidence: boolean;
  messageFailures: boolean;
  missedPromises: boolean;
  upcomingPromises: boolean;
  subscriptionIssues: boolean;
  digest: "off" | "daily" | "weekly";
}

export interface Workspace {
  id: string;
  companyName: string;
  legalName?: string;
  country: string;
  timezone: string;
  currency: string;
  supportEmail: string;
  logoUrl?: string;
  address?: string;
  taxId?: string;
  planId: PlanId;
  subscriptionStatus: SubscriptionStatus;
  periodEnd: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  aiCollectorActive: boolean;
  senderName: string;
  signature: string;
  replyTo: string;
  escalationEmail: string;
  reminderTone: ReminderTone;
  autoSend: boolean;
  approvalMode: "none" | "first" | "all" | "firm";
  quietHoursStart: string;
  quietHoursEnd: string;
  maxReminders: number;
  permittedDays: number[];
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "pending" | "removed";
  invitedAt: string;
}

export interface CustomerContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isBillingContact: boolean;
}

export interface Customer {
  id: string;
  workspaceId: string;
  name: string;
  primaryContact: string;
  email: string;
  phone?: string;
  billingAddress?: string;
  country: string;
  currency: string;
  taxReference?: string;
  notes?: string;
  tags: string[];
  language: string;
  status: "active" | "archived";
  outstandingBalance: number;
  overdueBalance: number;
  lastContactDate?: string;
  contacts: CustomerContact[];
  collectorPaused?: boolean;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
  discount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
  reference?: string;
  notes?: string;
  recordedBy: string;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  customerId: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency: string;
  lineItems: InvoiceLineItem[];
  notes?: string;
  terms?: string;
  poReference?: string;
  paymentLink?: string;
  collectorPaused: boolean;
  promisedDate?: string;
  assignedTo?: string;
  tags: string[];
  amount: number;
  amountPaid: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  invoiceId: string;
  type:
    | "created"
    | "edited"
    | "sent"
    | "opened"
    | "reminder"
    | "reply"
    | "promise"
    | "note"
    | "status_change"
    | "payment"
    | "paused"
    | "resumed";
  title: string;
  description?: string;
  actor?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: "outbound" | "inbound" | "internal";
  channel: "email";
  subject?: string;
  body: string;
  status: "draft" | "queued" | "sent" | "delivered" | "bounced" | "failed" | "received";
  createdAt: string;
  requiresApproval?: boolean;
  aiGenerated?: boolean;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  customerId: string;
  invoiceId: string;
  subject: string;
  unread: boolean;
  needsApproval: boolean;
  disputed: boolean;
  paymentClaimed: boolean;
  failed: boolean;
  promiseMissed: boolean;
  lowConfidence: boolean;
  assignedTo?: string;
  lastMessageAt: string;
  pauseReason?: string;
  nextAction?: string;
  aiCategory?: ReplyCategory;
  aiConfidence?: number;
  messages: Message[];
  internalNotes: { id: string; body: string; author: string; createdAt: string }[];
}

export interface ApprovalItem {
  id: string;
  conversationId: string;
  invoiceId: string;
  customerName: string;
  draftBody: string;
  stage: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

export interface DashboardSummary {
  totalOutstanding: number;
  overdueAmount: number;
  overdueCount: number;
  collectedThisMonth: number;
  promisedAmount: number;
  disputedAmount: number;
  automationStatus: "active" | "paused" | "limited";
  aging: { label: string; amount: number }[];
  attentionRequired: { id: string; label: string; severity: "high" | "medium" | "low"; href: string }[];
  upcomingActions: { id: string; label: string; date: string; href: string }[];
  recentActivity: { id: string; label: string; time: string }[];
}

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  invoiceAllowance: number;
  features: string[];
  highlighted?: boolean;
}

export interface ReportSummary {
  outstandingByCustomer: { name: string; amount: number; overdue: number }[];
  agingBands: { label: string; amount: number }[];
  collectionActivity: {
    remindersSent: number;
    repliesReceived: number;
    promisesCaptured: number;
    promisesKept: number;
    promisesMissed: number;
    disputes: number;
    failures: number;
    paymentsRecorded: number;
  };
  collectedAmount: number;
  avgDaysToPayment: number;
}

export interface PlatformOverview {
  totalBusinesses: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  pastDue: number;
  cancelled: number;
  activeInvoices: number;
  reminderVolume: number;
  emailFailures: number;
  aiUsage: number;
  workflowHealth: "healthy" | "degraded" | "critical";
}

export interface PlatformBusiness {
  id: string;
  companyName: string;
  ownerEmail: string;
  planId: PlanId;
  status: SubscriptionStatus;
  users: number;
  activeInvoices: number;
  usage: number;
  createdAt: string;
  lastActiveAt: string;
}

export interface AuditLogEntry {
  id: string;
  workspaceId?: string;
  user: string;
  action: string;
  entity: string;
  date: string;
  ip?: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  company?: string;
  message: string;
}
