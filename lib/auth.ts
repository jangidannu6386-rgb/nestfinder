import { getUser, type User } from "@netlify/identity";

export const LANDLORD_ROLE = "LANDLORD";

export function isLandlord(user: User | null | undefined): boolean {
  if (!user) return false;
  const roles = user.roles ?? (user.appMetadata?.roles as string[] | undefined) ?? [];
  return roles.includes(LANDLORD_ROLE);
}

/**
 * Server-side guard for landlord-only API routes.
 * Returns the user when they are logged in with the LANDLORD role,
 * otherwise a ready-to-return error Response.
 */
export async function requireLandlord(): Promise<{ user: User } | { error: Response }> {
  const user = await getUser();
  if (!user) {
    return { error: Response.json({ error: "Please log in first." }, { status: 401 }) };
  }
  if (!isLandlord(user)) {
    return { error: Response.json({ error: "Only landlords can access this." }, { status: 403 }) };
  }
  return { user };
}
