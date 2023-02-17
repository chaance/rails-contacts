import { redirect } from "@remix-run/node";
import type { DataFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

import { deleteContact } from "../data";

// This route is interesting because it doesn't export a component but redirects
// once the action is complete. Routes don't have to have components!
export async function action({ params }: DataFunctionArgs) {
  // TODO: Submit request to API /auth/login to get a token. See Rails "seed"
  // script for the auth values. Establish a session with the token on the Remix
  // side of things.
  invariant(params.contactId, "Missing contactId param");
  await deleteContact(params.contactId, { token: "123" });
  return redirect("/");
}
