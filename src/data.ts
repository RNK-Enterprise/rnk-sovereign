export type OfferSlug = "site" | "room" | "operator";

export type Offer = {
  slug: OfferSlug;
  num: string;
  name: string;
  kicker: string;
  oneLiner: string;
  pay: string;
  image: string;
  imageAlt: string;
  intro: string;
  included: string[];
  excluded: string[];
};

export const offers: Offer[] = [
  {
    slug: "site",
    num: "01",
    name: "Studio Site",
    kicker: "Presence",
    oneLiner: "One property. Your domain. Our stack.",
    pay: "Project fee + monthly retainer",
    image: "/images/desk.jpg",
    imageAlt: "A studio desk with paper website sketches, a lamp, and a closed laptop.",
    intro:
      "A site, a domain, mailboxes, hosting, backups, and someone who answers when DNS or deliverability goes wrong. You own the domain. We keep the keys and run the property.",
    included: [
      "Design and build of one website or web app",
      "Domain registered in your name",
      "DNS, hosting, TLS, and backups",
      "Mailbox on your domain",
      "A small monthly change allowance",
      "Restore-tested backups, not a checkbox",
    ],
    excluded: [
      "Template shops and page-builder lock-in",
      "You touching DNS",
      "Domains registered in our name",
      "Unlimited redesign on a retainer",
    ],
  },
  {
    slug: "room",
    num: "02",
    name: "Studio Room",
    kicker: "Communications",
    oneLiner: "Private rooms for tables, shows, and communities that already exist.",
    pay: "Setup + monthly operations",
    image: "/images/room.jpg",
    imageAlt: "A quiet live-audio room with a microphone, mixer, and headphones.",
    intro:
      "A private room on your domain — for a table, a podcast, an event, or a community that already has people in it. Voice, video, recording if you want it. Priced as operations, not a one-off install.",
    included: [
      "Scoped room design (who is in it, what it is for)",
      "LiveKit or Foundry hosting, or both",
      "Your domain, not a generic meeting link",
      "Recording and retention rules if needed",
      "Ongoing upkeep and a person to call",
    ],
    excluded: [
      "A Zoom replacement for office stand-ups",
      "Unattended infrastructure with no retainer",
      "Building the community itself",
    ],
  },
  {
    slug: "operator",
    num: "03",
    name: "Studio Operator",
    kicker: "Intelligence",
    oneLiner: "One written job, on a corpus we build and keep fresh.",
    pay: "Scoped project + monthly refresh",
    image: "/images/mail.jpg",
    imageAlt: "Letterhead, envelope, wax seal, and a business card on a walnut desk.",
    intro:
      "An operator for a single job: answers from your manual, triage of inbound mail, notes from a session log. The work is the corpus — sources, cleaning, evaluation, access, refresh. The agent is just the interface.",
    included: [
      "A written job description before anything is built",
      "Corpus design: sources, chunking, access, refresh",
      "An operator interface for that job only",
      "Evaluation you can read, not a chat screenshot",
      "A data processing agreement for anything with personal data",
    ],
    excluded: [
      "A general chatbot",
      "Training on mail without a DPA",
      "“AI” as decoration on an otherwise ordinary site",
    ],
  },
];

export function getOffer(slug: string | undefined): Offer | undefined {
  return offers.find((o) => o.slug === slug);
}
