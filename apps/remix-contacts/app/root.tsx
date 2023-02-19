import * as React from "react";
import {
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useFetchers,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { getContacts, type ContactRecord } from "~/data";
import resetsStylesHref from "~/resets.css";
import appStylesHref from "~/app.css";

export function links() {
  return [
    { rel: "stylesheet", href: resetsStylesHref },
    { rel: "stylesheet", href: appStylesHref },
  ];
}

export async function loader({ request }: LoaderArgs) {
  let url = new URL(request.url);
  let q = url.searchParams.get("q") || undefined;
  let contacts = await getContacts(q);
  return { contacts, q };
}

export default function Root() {
  let { contacts, q } = useLoaderData<typeof loader>();
  let navigation = useNavigation();
  let submit = useSubmit();

  let userIsSearching =
    // if navigation.location exists, then we're in the middle of a navigation
    // and data is being fetched for the next page
    navigation.location &&
    // if we also have a search query, then we're searching
    new URLSearchParams(navigation.location.search).has("q");

  // The rules around React "controlled inputs" don't really make sense when the
  // URL and the user are driving the UI and not React state. We could wire up
  // some React state to the the input, but we'd still need this useEffect to
  // synchronize the URL to the state. If we have to do manual synchronization
  // anyway, it's more straightforward and less code to just synchronize the URL
  // to the input manually. It's okay, Andrew won't arrest you. He's not even a
  // cop.
  React.useEffect(() => {
    let input = document.getElementById("q");
    if (input && input instanceof HTMLInputElement) {
      input.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">
          <header id="masthead">
            <Link to="/">Remix Contacts</Link>
            <div>
              <Form
                method="get"
                id="search-form"
                role="search"
                onSubmit={(event) => {
                  // this form is submitted as the user types with JS, if they
                  // hit "enter" we want to prevent submitting a useless search.
                  // If JS hasn't loaded in the browser yet, hitting enter will
                  // work.
                  event.preventDefault();
                }}
              >
                <input
                  id="q"
                  className={userIsSearching ? "loading" : undefined}
                  aria-label="Search contacts"
                  placeholder="Search"
                  type="search"
                  name="q"
                  defaultValue={q}
                  onChange={(event) => {
                    const isSubsequentSearch = q != null;
                    submit(event.currentTarget.form, {
                      // If this is the first search, push a new entry into the
                      // history stack so the user can click back to no search.
                      // If it's a subsequent search, replace the current
                      // location so the user doesn't have click "back" for
                      // every daggum character they've typed
                      replace: isSubsequentSearch,
                    });
                  }}
                />
                <div
                  id="search-spinner"
                  aria-hidden
                  hidden={!userIsSearching}
                />
                <button type="submit">Go</button>
              </Form>
            </div>
            <nav aria-label="Contacts">
              {contacts.length ? (
                <ul>
                  {contacts.map((contact) => (
                    <li key={contact.id}>
                      <NavLink
                        prefetch="intent"
                        to={`contacts/${contact.id}`}
                        className={({ isActive, isPending }) =>
                          isActive
                            ? "active"
                            : isPending
                            ? "pending"
                            : undefined
                        }
                      >
                        {[contact.firstName, contact.lastName]
                          .filter(Boolean)
                          .join(" ")}
                        <FavoriteIndicator contact={contact} />
                      </NavLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  <i>No contacts</i>
                </p>
              )}
            </nav>
          </header>
          <main>
            <Outlet />
          </main>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function ErrorPage({ error }: { error: Error }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">
          <div id="error-page">
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
              <i>
                {isRouteErrorResponse(error) ? error.statusText : error.message}
              </i>
            </p>
            <Link to="/">Go Home</Link>
          </div>
        </div>
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorPage error={error} />;
}

export function CatchBoundary() {
  let caught = useCatch();
  let error = new Error(caught.statusText);
  return <ErrorPage error={error} />;
}

function FavoriteIndicator({ contact }: { contact: ContactRecord }) {
  let fetchers = useFetchers();

  // start with the default case, read the actual data.
  let isFavorite = contact.favorite;

  // Now check if there are any pending fetchers that are changing this contact
  for (let fetcher of fetchers) {
    // @ts-expect-error https://github.com/remix-run/remix/pull/5476
    if (fetcher.formAction === `/contacts/${contact.id}`) {
      // Ask for the optimistic version of the data
      // @ts-expect-error https://github.com/remix-run/remix/pull/5476
      isFavorite = fetcher.formData.get("favorite") === "true";
    }
  }

  // Now the star in the sidebar will immediately update as the user clicks
  // instead of waiting for the network to respond
  return isFavorite ? (
    <span className="favorite-indicator">
      <span aria-hidden>★</span>
      <span className="sr-only">(favorite)</span>
    </span>
  ) : null;
}
