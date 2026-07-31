export type ActionLogAction =
  | "login"
  | "logout"
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "restore"
  | "import"
  | "export"
  | "bulk_operation";

export type ActionLogCategory =
  | "auth"
  | "fees"
  | "payout"
  | "courses"
  | "users"
  | "roles"
  | "students"
  | "attendance"
  | "messages"
  | "library"
  | "performance"
  | "settings"
  | "exams"
  | "moderation"
  | "ai"
  | "homework"
  | "certificates"
  | "placement"
  | "crm"
  | "leave"
  | "communication"
  | "complaints"
  | "feedback"
  | "enquiries"
  | "payroll"
  | "expenses"
  | "other";

export type ActionLogEntry = {
  id: string;
  action: ActionLogAction;
  category: ActionLogCategory;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userRole: string | null;
  details: string;
  metadata: Record<string, unknown> | null;
  ip: string;
  userAgent: string;
  platform: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  referer: string | null;
  acceptLanguage: string | null;
  cfCountry: string | null;
  geo: { city?: string; region?: string; country?: string } | null;
  path: string;
  method: string;
  duration: number | null;
  statusCode: number | null;
  timestamp: string;
};

export type AuditLogFilter = {
  page?: number;
  limit?: number;
  action?: string;
  category?: string;
  search?: string;
  ip?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type AuditLogStats = {
  totalLogs: number;
  todayLogs: number;
  uniqueUsers: number;
  uniqueIps: number;
  topAction: string | null;
  topCategory: string | null;
  byAction: Record<string, number>;
  byCategory: Record<string, number>;
};

export type LogActionOptions = {
  action: ActionLogAction;
  category: ActionLogCategory;
  details: string;
  metadata?: Record<string, unknown> | null;
  request?: Request;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  userRole?: string | null;
  statusCode?: number | null;
};
