import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-helpers";
import { getActionLogs, getActionLogStats } from "@/lib/data-store";
import type { AuditLogFilter } from "@/lib/audit-log-types";

export async function GET(request: Request) {
  const session = getSessionUser(request);
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get("stats") === "true";

    const filter: AuditLogFilter = {
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 50,
      action: searchParams.get("action") || undefined,
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      ip: searchParams.get("ip") || undefined,
      userId: searchParams.get("userId") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
    };

    if (stats) {
      const aggregate = await getActionLogStats();
      return NextResponse.json(aggregate);
    }

    const result = await getActionLogs(filter);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { logs: [], pagination: { page: 1, limit: 50, total: 0 }, error: error.message },
      { status: 500 },
    );
  }
}
