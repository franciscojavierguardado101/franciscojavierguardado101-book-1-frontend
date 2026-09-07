import Link from "next/link";
import { getFooterMenu } from "@/lib/drupal-menu";

export default async function Footer() {
  const sections = await getFooterMenu();

  return (
    <footer
      className="border-t mt-auto"
      style={{ background: "#111111", borderColor: "var(--color-border)" }}
    >
      <div className="page-width py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Newsletter */}
          <div>
            <h3
              className="text-sm uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--font-header)" }}
            >
              Never Miss a Release
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
              Subscribe for special offers and new book announcements.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm bg-transparent border text-white placeholder-gray-500 focus:outline-none"
                style={{ borderColor: "var(--color-border)" }}
              />
              <button type="submit" className="btn btn--primary btn--sm">
                Subscribe
              </button>
            </form>
          </div>

          {/* Dynamic sections from Drupal footer menu */}
          {sections.map((section) => (
            <div key={section.id}>
              {section.label && (
                <h3
                  className="text-sm uppercase tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-header)" }}
                >
                  {section.label}
                </h3>
              )}
              <ul className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="text-sm hover:opacity-60 transition-opacity"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 pt-6 border-t text-xs"
          style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
        >
          © {new Date().getFullYear()} Francisco Guardado. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
