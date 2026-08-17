import { Link } from "react-router-dom";

const footerLinks = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Community", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div>
            <Link
              to="/"
              className="mb-4 inline-block text-2xl tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              WordStreak
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              Build lasting vocabulary with intelligent spaced repetition and
              streak-powered daily learning.
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <h4
                className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-[var(--color-muted-foreground)] sm:flex-row">
          <p>© {new Date().getFullYear()} WordStreak. All rights reserved.</p>
          <p>
            Crafted with <span className="text-[var(--color-primary)]">♥</span>{" "}
            for language learners.
          </p>
        </div>
      </div>
    </footer>
  );
}
