import type { DataFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useNavigate, useNavigation } from "@remix-run/react";
import { createContact } from "~/data";

export async function action({ request }: DataFunctionArgs) {
  // TODO: Submit request to API /auth/login to get a token. See Rails "seed"
  // script for the auth values. Establish a session with the token on the Remix
  // side of things.
  const formData = await request.formData();
  let contact = await createContact(
    {
      avatar: String(formData.get("avatar")),
      firstName: String(formData.get("firstName")),
      lastName: String(formData.get("lastName")),
      notes: String(formData.get("notes")),
      twitterHandle: String(formData.get("twitter")),
    },
    { token: "123" }
  );
  return redirect(`/contacts/${contact.id}`);
}

export default function EditContact() {
  let navigate = useNavigate();
  let navigation = useNavigation();
  let isSaving = navigation.formData?.get("intent") === "create";

  return (
    <Form method="post" id="contact-form">
      <p>
        <span>Name</span>
        <input
          autoFocus
          placeholder="First"
          aria-label="First name"
          type="text"
          name="firstName"
        />
        <input
          placeholder="Last"
          aria-label="Last name"
          type="text"
          name="lastName"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input type="text" name="twitter" placeholder="@jack" />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          placeholder="https://example.com/avatar.jpg"
          aria-label="Avatar URL"
          type="text"
          name="avatar"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea name="notes" rows={6} />
      </label>
      <p>
        <button type="submit" name="intent" value="create">
          {isSaving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            navigate(-1);
          }}
        >
          Cancel
        </button>
      </p>
    </Form>
  );
}
