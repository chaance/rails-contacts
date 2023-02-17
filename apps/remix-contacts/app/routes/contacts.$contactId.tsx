import type { DataFunctionArgs } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { updateContact, getContact, type ContactRecord } from "~/data";

export async function loader({ params }: DataFunctionArgs) {
  // `invariant` is a little library that throws an error if the first argument
  // is falsy. It's useful in a TypeScript environment especially with Remix
  // because of `ErrorBoundary`. When errors are thrown from loaders (by
  // invariant or for any other reason) and actions, all code execution stops
  // and the closest `ErrorBoundary` will be rendered instead of the component.
  invariant(params.contactId, "missing contactId param");

  const contact = await getContact(params.contactId);

  if (!contact) {
    // Throwing a Response is special (instead of errors). It will also stop
    // code execution and send Remix down the "catch boundary" path. The closes
    // `CatchBoundary` will be rendered.
    throw new Response("Contact not found", { status: 404 });
  }

  return contact;
}

export async function action({ params, request }: DataFunctionArgs) {
  // TODO: Submit request to API /auth/login to get a token. See Rails "seed"
  // script for the auth values. Establish a session with the token on the Remix
  // side of things.
  invariant(params.contactId, "missing contactId param");
  const formData = await request.formData();
  const favorite = formData.get("favorite") === "true";
  return await updateContact(params.contactId, { favorite }, { token: "123" });
}

export default function Contact() {
  const contact = useLoaderData<typeof loader>();
  const friendlyName = [contact.firstName, contact.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <div id="contact">
      <div>
        <img
          key={contact.avatar}
          src={contact.avatar}
          alt={`${friendlyName} avatar`.trim()}
        />
      </div>

      <div>
        <h1>
          {friendlyName ? <>{friendlyName}</> : <i>No Name</i>}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitterHandle ? (
          <p>
            <a
              target="_blank"
              href={`https://twitter.com/${contact.twitterHandle}`}
              rel="noreferrer"
            >
              @{contact.twitterHandle}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form
            method="post"
            action="destroy"
            onSubmit={(event) => {
              if (!confirm("Please confirm you want to delete this record.")) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({ contact }: { contact: ContactRecord }) {
  const fetcher = useFetcher<typeof action>();
  let favorite = contact.favorite;
  // @ts-expect-error
  if (fetcher.formData) {
    // @ts-expect-error
    favorite = fetcher.formData.get("favorite") === "true";
  }
  return (
    <fetcher.Form method="post">
      <button
        type="submit"
        name="favorite"
        value={favorite ? "false" : "true"}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}
