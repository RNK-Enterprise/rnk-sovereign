export type FamilySite = {
  name: string;
  kicker: string;
  img: string;
  alt: string;
  blurb: string;
  /** Internal hub path for dormant projects that have a public plan page. */
  path?: string;
};

export type LiveSite = FamilySite & {
  url: string;
  host: string;
};

export const FAMILY_LIVE: LiveSite[] = [
  {
    name: "The Curator",
    kicker: "Systems · Minecraft",
    img: "/images/curator.jpg",
    alt: "The Curator avatar — the face of the RNK Minecraft ecosystem.",
    url: "https://adapt.rnkstudios.uk",
    host: "adapt.rnkstudios.uk",
    blurb:
      "Mod adaptation for Minecraft: the Curator sources, the Tync rewrites a Fabric mod into a Paper artifact, the Bridge delivers it. Open core, hosted service.",
  },
  {
    name: "Nueron",
    kicker: "Systems · Neural observatory",
    img: "/images/nueron.jpg",
    alt: "The Neural Globe — a navigable 3D planet of model parameters.",
    url: "https://nueron.rnkstudios.uk",
    host: "nueron.rnkstudios.uk",
    blurb:
      "A 3D observatory for neural networks. Shards of any format become a navigable planet — click a node to read its code, trace how a query lights the network.",
  },
  {
    name: "The Gift",
    kicker: "Open · Library",
    img: "/images/gift.svg",
    alt: "An open book with light rising from its pages.",
    url: "https://gift.rnkstudios.uk",
    host: "gift.rnkstudios.uk",
    blurb:
      "A free library of public-domain Bible translations and classic commentaries — 140 translations across ~50 languages. Nothing paywalled, DRM'd, or gated.",
  },
];

export const FAMILY_DORMANT: FamilySite[] = [
  {
    name: "Bridge with Jenn",
    kicker: "Presence · Coaching",
    img: "/images/jenn.jpg",
    alt: "Portrait used on the Bridge with Jenn site.",
    blurb:
      "A calm public site for co-parent coaching: share your side, book a session, her Common Ground podcast, resources, donate.",
  },
  {
    name: "Resilience Never Kneels",
    kicker: "Presence · Podcast",
    img: "/images/podcast-card.svg",
    alt: "A broadcast mast rising from an open book, signal rings spreading from its tip.",
    blurb:
      "The studio podcast: building infrastructure, security, and privacy systems that stay up — and writing novels that survive the rejections. Fridays, 9 AM.",
    path: "/podcast",
  },
];
