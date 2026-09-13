const STAGES = [
  {
    num: "01",
    title: "Scope",
    body: "One of the three offers, written down. Who owns the domain. What “done” means. What is out. If it does not fit, we say no here.",
  },
  {
    num: "02",
    title: "Build",
    body: "Design and engineering on our stack. You see the work. You do not get a page-builder login and a wave.",
  },
  {
    num: "03",
    title: "Host",
    body: "Domain in your name. DNS, mail, TLS, backups. We keep the keys. Transfer-out is a documented process, not a hostage situation.",
  },
  {
    num: "04",
    title: "Keep",
    body: "The monthly retainer is operations: uptime, restores, mail that actually arrives, a small change allowance, a person to call.",
  },
];

export function Process() {
  return (
    <article className="page">
      <header className="page-hero">
        <p className="eyebrow">Process</p>
        <h1>Design it. Then operate it.</h1>
        <p className="lede">
          The interesting part is usually not the first deploy. It is the year
          after — renewals, spam folders, a restore at 11pm. We price for that.
        </p>
      </header>

      <ol className="stages">
        {STAGES.map((stage) => (
          <li key={stage.num}>
            <span className="stage-num">{stage.num}</span>
            <div>
              <h2>{stage.title}</h2>
              <p>{stage.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
