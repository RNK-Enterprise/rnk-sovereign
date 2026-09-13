import { useEffect, useRef, useState, type FormEvent } from "react";

type Msg = {
  id: string;
  from: "you" | "studio";
  text: string;
  at: number;
};

const STORE = "rnk-studio-chat";

function load(): Msg[] {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Msg[]) : [];
  } catch {
    return [];
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ChatDock() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  // lazy init: reads localStorage once, on the first render — no mount
  // effect, no cascading re-render (set-state-in-effect)
  const [msgs, setMsgs] = useState<Msg[]>(() => load());
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(msgs));
    bottom.current?.scrollIntoView({ block: "end" });
  }, [msgs]);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    const yours: Msg = { id: uid(), from: "you", text, at: Date.now() };
    setMsgs((m) => [...m, yours]);
    setDraft("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, text }),
      });
      const data = (await res.json()) as { ok?: boolean; queued?: boolean };
      const reply = data.ok
        ? data.queued
          ? "Got it. It’s queued for the studio phone — you’ll get a human when we’re on the line."
          : "Got it. That’s on the studio phone now. If we need more, we’ll reply."
        : "Couldn’t send just then. Try again, or use the contact form.";
      setMsgs((m) => [
        ...m,
        { id: uid(), from: "studio", text: reply, at: Date.now() },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          id: uid(),
          from: "studio",
          text: "Couldn’t reach the studio line. Leave it on the contact page if you prefer.",
          at: Date.now(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`chat-dock${open ? " is-open" : ""}`}>
      {open && (
        <section className="chat-panel" aria-label="Studio chat">
          <header className="chat-head">
            <div>
              <p className="chat-kicker">Studio line</p>
              <h2>Message RNK</h2>
            </div>
            <button
              type="button"
              className="chat-x"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>
          <p className="chat-note">
            Direct to the studio handset. The number is not published.
          </p>
          <div className="chat-log" role="log">
            {msgs.length === 0 && (
              <p className="chat-empty">
                Say what you need — a site, a room, a slot, or a problem.
              </p>
            )}
            {msgs.map((m) => (
              <p key={m.id} className={`chat-bubble is-${m.from}`}>
                {m.text}
              </p>
            ))}
            <div ref={bottom} />
          </div>
          <form
            className="chat-form"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              void send();
            }}
          >
            <div className="chat-meta">
              <input
                placeholder="Name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                placeholder="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="chat-compose">
              <textarea
                required
                rows={2}
                placeholder="Write to the studio…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <button className="btn" type="submit" disabled={busy}>
                {busy ? "…" : "Send"}
              </button>
            </div>
          </form>
        </section>
      )}
      <button
        type="button"
        className="chat-fab"
        aria-expanded={open}
        aria-label={open ? "Close studio chat" : "Open studio chat"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Chat"}
      </button>
    </div>
  );
}
