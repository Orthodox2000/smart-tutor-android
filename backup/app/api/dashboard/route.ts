import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { getDashboardBundle, getStudentDirectory, getTestSubmissionsForRole, getUsersForAdmin } from "@/lib/data-store";

export async function GET() {
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json(
      { error: "Login is required to access the dashboard." },
      { status: 401 },
    );
  }

  const data = await getDashboardBundle(session.role, session.id);

  return NextResponse.json({
    user: session,
    dashboard: data,
    users: session?.role === "admin" ? await getUsersForAdmin() : [],
    students: session?.role && ["educator", "admin"].includes(session.role) ? await getStudentDirectory() : [],
    submissions: await getTestSubmissionsForRole(session.role, session.id),
  });
}
