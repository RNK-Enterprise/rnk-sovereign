import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const execFileP = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const inboxPath = join(root, "data", "inbox.json");

type ChatRow = {
  at: string;
  name: string;
  email: string;
  text: string;
  delivered: boolean;
  queued: boolean;
};

function clip(s: string, n: number) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
}

async function loadInbox(): Promise<ChatRow[]> {
  try {
    return JSON.parse(await readFile(inboxPath, "utf8")) as ChatRow[];
  } catch {
    return [];
  }
}

async function saveInbox(rows: ChatRow[]) {
  await mkdir(dirname(inboxPath), { recursive: true });
  await writeFile(inboxPath, JSON.stringify(rows, null, 2));
}

async function deviceId() {
  if (process.env.KDECONNECT_DEVICE_ID) return process.env.KDECONNECT_DEVICE_ID;
  const { stdout } = await execFileP(
    "kdeconnect-cli",
    ["--list-devices", "--id-only"],
    { timeout: 4000 }
  );
  return stdout
    .split("\n")
    .map((s) => s.trim())
    .find(Boolean);
}

async function reachable(id: string) {
  try {
    const { stdout } = await execFileP(
      "kdeconnect-cli",
      ["--list-available", "--id-only"],
      { timeout: 4000 }
    );
    return stdout
      .split("\n")
      .map((s) => s.trim())
      .includes(id);
  } catch {
    return false;
  }
}

export async function deliverChat(input: {
  name: string;
  email: string;
  text: string;
}) {
  const row: ChatRow = {
    at: new Date().toISOString(),
    name: clip(input.name || "Visitor", 80),
    email: clip(input.email || "", 120),
    text: clip(input.text, 1000),
    delivered: false,
    queued: false,
  };

  const body = ["RNK chat", row.name, row.email, row.text]
    .filter(Boolean)
    .join(" · ");

  let id = "";
  try {
    id = (await deviceId()) || "";
  } catch {
    id = "";
  }

  const to = (process.env.RNK_SMS_TO || "").replace(/\s+/g, "");
  const online = id ? await reachable(id) : false;

  if (id && online) {
    try {
      await execFileP(
        "kdeconnect-cli",
        ["--device", id, "--ping-msg", clip(body, 180)],
        { timeout: 6000 }
      );
      if (to) {
        await execFileP(
          "kdeconnect-cli",
          [
            "--device",
            id,
            "--send-sms",
            clip(`RNK chat from ${row.name}: ${row.text}`, 280),
            "--destination",
            to,
          ],
          { timeout: 8000 }
        );
      }
      row.delivered = true;
    } catch {
      row.queued = true;
    }
  } else {
    row.queued = true;
  }

  const inbox = await loadInbox();
  inbox.push(row);
  await saveInbox(inbox);
  return { ok: true, queued: row.queued };
}

const ordersPath = join(root, "data", "orders.json");

export async function deliverOrder(input: {
  name: string;
  email: string;
  foundry: string;
  notes: string;
  lines: unknown;
  total: number;
}) {
  const summary = clip(
    `RNK shop $${Number(input.total) || 0} · ${input.name} · ${input.email} · ${JSON.stringify(input.lines)}`,
    280
  );
  const result = await deliverChat({
    name: input.name,
    email: input.email,
    text: summary,
  });
  try {
    await mkdir(dirname(ordersPath), { recursive: true });
    let rows: unknown[] = [];
    try {
      rows = JSON.parse(await readFile(ordersPath, "utf8")) as unknown[];
    } catch {
      rows = [];
    }
    rows.push({ at: new Date().toISOString(), ...input });
    await writeFile(ordersPath, JSON.stringify(rows, null, 2));
  } catch {
    /* inbox ping already attempted */
  }
  return result;
}
