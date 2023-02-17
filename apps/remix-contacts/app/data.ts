import { matchSorter } from "match-sorter";
import sortBy from "sort-by";
import invariant from "tiny-invariant";

invariant(process.env.API_URL, "API_URL must be set");

const API_URL = process.env.API_URL;

export interface ContactMutation {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  twitterHandle?: string;
  notes?: string;
  favorite?: boolean;
}

export interface ContactRecord extends ContactMutation {
  id: number;
  createdAt: string;
  favorite: boolean;
}

const contacts = {
  async getAll(): Promise<ContactRecord[]> {
    let resp = await fetch(`${API_URL}/contacts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!resp.ok) {
      throw resp;
    }
    let contacts = await resp.json();
    if (!Array.isArray(contacts)) {
      throw new Error("Invalid response from API");
    }
    return contacts.map(modelContact);
  },

  async get(id: number | string): Promise<ContactRecord | null> {
    let resp = await fetch(`${API_URL}/contacts/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (resp.status === 404) {
      return null;
    }
    if (!resp.ok) {
      throw resp;
    }
    return modelContact(await resp.json());
  },

  async create(
    values: ContactMutation,
    { token }: { token: string }
  ): Promise<ContactRecord> {
    let resp = await fetch(`${API_URL}/contacts`, {
      method: "POST",
      body: JSON.stringify({
        avatar: values.avatar,
        favorite: !!values.favorite,
        name_first: values.firstName,
        name_last: values.lastName,
        notes: values.notes,
        twitter_handle: values.twitterHandle,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!resp.ok) {
      throw resp;
    }
    return modelContact(await resp.json());
  },

  async set(
    id: number | string,
    values: ContactMutation,
    { token }: { token: string }
  ): Promise<ContactRecord> {
    let resp = await fetch(`${API_URL}/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        avatar: values.avatar,
        favorite: !!values.favorite,
        name_first: values.firstName,
        name_last: values.lastName,
        notes: values.notes,
        twitter_handle: values.twitterHandle,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!resp.ok) {
      throw resp;
    }
    return modelContact(await resp.json());
  },

  async destroy(
    id: string | number,
    { token }: { token: string }
  ): Promise<null> {
    let resp = await fetch(`${API_URL}/contacts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!resp.ok) {
      throw resp;
    }
    return null;
  },
};

export async function getContacts(query?: string) {
  let records = await contacts.getAll();
  if (query) {
    records = matchSorter(records, query, {
      keys: ["firstName", "lastName"],
    });
  }
  return records.sort(sortBy("last", "createdAt"));
}

export async function getContact(id: string) {
  return contacts.get(id);
}

export async function updateContact(
  id: string,
  updates: ContactMutation,
  { token }: { token: string }
) {
  let contact = await contacts.get(id);
  if (!contact) {
    throw new Error(`No contact found for ${id}`);
  }
  await contacts.set(id, { ...contact, ...updates }, { token });
  return contact;
}

export async function deleteContact(id: string, { token }: { token: string }) {
  await contacts.destroy(id, { token });
}

export async function createContact(
  updates: ContactMutation,
  { token }: { token: string }
) {
  return await contacts.create(updates, { token });
}

function modelContact(contact: unknown): ContactRecord {
  if (
    !contact ||
    typeof contact !== "object" ||
    !("id" in contact) ||
    typeof contact.id !== "number" ||
    !("created_at" in contact) ||
    typeof contact.created_at !== "string"
  ) {
    throw new Error("Invalid contact input");
  }
  return {
    id: contact.id,
    createdAt: contact.created_at,
    avatar:
      "avatar" in contact && typeof contact.avatar === "string"
        ? contact.avatar
        : undefined,
    favorite: "avatar" in contact && contact.avatar === true,
    firstName:
      "name_first" in contact && typeof contact.name_first === "string"
        ? contact.name_first
        : undefined,
    lastName:
      "name_last" in contact && typeof contact.name_last === "string"
        ? contact.name_last
        : undefined,
    notes:
      "notes" in contact && typeof contact.notes === "string"
        ? contact.notes
        : undefined,
    twitterHandle:
      "twitter_handle" in contact && typeof contact.twitter_handle === "string"
        ? contact.twitter_handle
        : undefined,
  };
}
