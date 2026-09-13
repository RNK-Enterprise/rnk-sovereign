export type Product = {
  slug: string;
  name: string;
  kicker: string;
  version: string;
  price: number;
  foundry: string;
  blurb: string;
  body: string;
  features: string[];
};

export const products: Product[] = [
  {
    slug: "vellum",
    name: "RNK Vellum",
    kicker: "Character sheet",
    version: "1.2.13",
    price: 6,
    foundry: "v13–v14",
    blurb:
      "A system-agnostic sheet with a parchment face — shield AC, blessings, containers, notepad, token glow, GM hub.",
    body: "Built for tables that want the sheet to feel like an object, not a form. Shadowdark / Cairn bones, per-actor GM controls, container sub-inventories.",
    features: [
      "System-agnostic character sheet",
      "Parchment styling, shield AC",
      "Blessing tokens per player",
      "Container sub-inventories and Notepad item",
      "Token glow and GM Hub",
    ],
  },
  {
    slug: "cyphur",
    name: "RNK Cyphur",
    kicker: "Communications",
    version: "1.2.0",
    price: 7,
    foundry: "v11–v13",
    blurb:
      "Private messages, group channels, image drop, GM stealth monitor. Cyberpunk face. System agnostic.",
    body: "A second radio for the table. Players talk in-character without dumping it in public chat. The GM can watch without being in the room.",
    features: [
      "Private and group channels",
      "Image sharing",
      "GM stealth monitoring",
      "System agnostic",
    ],
  },
  {
    slug: "illumination",
    name: "RNK Illumination",
    kicker: "Tokens",
    version: "2.5.15",
    price: 4,
    foundry: "v13–v14",
    blurb:
      "Underglow, admin hub, targeting lines. Light that belongs to the token, not a leftover template.",
    body: "For tables that run in the dark. Per-token underglow, a hub so you are not clicking every token by hand, targeting lines that read at a glance.",
    features: [
      "Custom underglow",
      "Administrator hub",
      "Targeting line visuals",
    ],
  },
  {
    slug: "roster",
    name: "RNK Roster",
    kicker: "HUD",
    version: "0.1.0",
    price: 3,
    foundry: "v11–v13",
    blurb:
      "Stat plates for the party, in combat and out. Early, useful, still moving.",
    body: "A display module for player characters with customisable stat plates. Early release — priced as such.",
    features: [
      "Party character display",
      "Combat and out-of-combat plates",
    ],
  },
  {
    slug: "item-transfer",
    name: "RNK Item Transfer",
    kicker: "Custom System Builder",
    version: "1.0.0",
    price: 3,
    foundry: "v11–v13",
    blurb:
      "Drag an item to another actor and the original is gone. A real move, not a clone.",
    body: "Intercepts CSB inventory drag-and-drop and deletes the source after create. For GMs tired of duplicate swords.",
    features: [
      "True item move for CSB inventories",
      "No leftover duplicate on the source",
    ],
  },
];

export const bundle: Product = {
  slug: "table-bundle",
  name: "Table bundle",
  kicker: "All five modules",
  version: "mix",
  price: 15,
  foundry: "see each module",
  blurb: "Vellum, Cyphur, Illumination, Roster, Item Transfer. One ticket, under the sum of the parts.",
  body: "The five RNK modules as a single order. Manifests follow once payment is live.",
  features: products.map((p) => p.name),
};

export function getProduct(slug: string | undefined) {
  if (slug === bundle.slug) return bundle;
  return products.find((p) => p.slug === slug);
}

export function formatGbp(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}
