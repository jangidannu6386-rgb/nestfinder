import type { UserSignupEvent } from "@netlify/functions";

// Assigns the server-controlled LANDLORD role to accounts created from the
// landlord sign-up page. Roles live in app_metadata, which users cannot edit
// themselves, so the role is only ever granted here at signup time.
export default {
  userSignup(event: UserSignupEvent) {
    const accountType = event.user.userMetadata?.account_type;
    if (accountType !== "LANDLORD") return;

    const existing = (event.user.appMetadata?.roles as string[] | undefined) ?? [];
    return {
      user: {
        ...event.user,
        appMetadata: {
          ...event.user.appMetadata,
          roles: Array.from(new Set([...existing, "LANDLORD"])),
        },
      },
    };
  },
};
