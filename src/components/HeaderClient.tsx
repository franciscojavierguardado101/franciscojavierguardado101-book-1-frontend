"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { NavItem } from "@/lib/drupal-menu";
import SearchModal from "@/components/search/SearchModal";

interface HeaderClientProps {
  navItems: NavItem[];
}

export default function HeaderClient({ navItems }: HeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd/Ctrl+K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{ background: "#111111", borderColor: "var(--color-border)" }}
    >
      <div className="page-width flex items-center justify-between py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-white font-mono text-xl tracking-widest uppercase"
          style={{ fontFamily: "var(--font-header)" }}
        >
          Francisco Guardado
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm uppercase tracking-widest text-white hover:opacity-60 transition-opacity"
              style={{ fontFamily: "var(--font-body)", letterSpacing: "0.2em" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4">
          {/* Desktop: search pill */}
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 transition-colors focus:outline-none group"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          >
            <svg width="14" height="14" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--color-muted)", flexShrink: 0 }}>
              <circle cx="28.58" cy="28.58" r="18.58" />
              <line x1="41.94" y1="42" x2="54" y2="54" />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                letterSpacing: "0.05em",
                color: "var(--color-muted)",
                whiteSpace: "nowrap",
              }}
            >
              Search…
            </span>
            <kbd
              style={{
                fontFamily: "var(--font-header)",
                fontSize: 10,
                letterSpacing: "0.04em",
                color: "var(--color-muted)",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid var(--color-border)",
                borderRadius: 3,
                padding: "1px 5px",
                marginLeft: 6,
                opacity: 0.7,
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Mobile: icon only */}
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="md:hidden text-white hover:opacity-60 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="28.58" cy="28.58" r="18.58" />
              <line x1="41.94" y1="42" x2="54" y2="54" />
            </svg>
          </button>

          <button
            className="md:hidden text-white hover:opacity-60 transition-opacity"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <>
                  <line x1="12" y1="12" x2="52" y2="52" />
                  <line x1="52" y1="12" x2="12" y2="52" />
                </>
              ) : (
                <>
                  <line x1="7" y1="15" x2="57" y2="15" />
                  <line x1="7" y1="32" x2="50" y2="32" />
                  <line x1="7" y1="49" x2="57" y2="49" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-5 py-4 flex flex-col gap-4"
          style={{ background: "#111111", borderColor: "var(--color-border)" }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-base uppercase tracking-widest text-white hover:opacity-60 transition-opacity"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>

      {searchOpen && (
        <SearchModal onClose={() => setSearchOpen(false)} />
      )}
    </>
  );
}
