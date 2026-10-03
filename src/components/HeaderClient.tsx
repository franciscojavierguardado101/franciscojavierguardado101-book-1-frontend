"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { NavItem } from "@/lib/drupal-menu";
import SearchModal from "@/components/search/SearchModal";

interface HeaderClientProps {
  navItems: NavItem[];
}

function DropdownPanel({ items, visible }: { items: NavItem[]; visible: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 1px)",
        left: "50%",
        minWidth: 200,
        background: "#111111",
        border: "1px solid var(--color-border)",
        borderTop: "2px solid var(--color-accent-purple)",
        borderRadius: "0 0 4px 4px",
        padding: "8px 0",
        zIndex: 100,
        pointerEvents: visible ? "auto" : "none",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-6px)",
        transition: "opacity 0.15s ease, transform 0.15s ease",
      }}
    >
      {items.map((child) => (
        <Link
          key={child.id}
          href={child.href}
          style={{
            display: "block",
            padding: "9px 20px",
            fontFamily: "var(--font-body)",
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            textDecoration: "none",
            whiteSpace: "nowrap",
            transition: "color 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
        >
          {child.label}
        </Link>
      ))}
    </div>
  );
}

export default function HeaderClient({ navItems }: HeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function openDropdown(id: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveId(id);
  }

  function closeDropdown() {
    timeoutRef.current = setTimeout(() => setActiveId(null), 120);
  }

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
            {navItems.map((item) => {
              const hasChildren = item.children.length > 0;
              const isActive = activeId === item.id;

              return (
                <div
                  key={item.id}
                  style={{ position: "relative" }}
                  onMouseEnter={() => hasChildren && openDropdown(item.id)}
                  onMouseLeave={() => hasChildren && closeDropdown()}
                >
                  <Link
                    href={item.href}
                    className="text-sm uppercase tracking-widest text-white transition-opacity"
                    style={{
                      fontFamily: "var(--font-body)",
                      letterSpacing: "0.2em",
                      opacity: isActive ? 1 : undefined,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                    onMouseEnter={(e) => !hasChildren && (e.currentTarget.style.opacity = "0.6")}
                    onMouseLeave={(e) => !hasChildren && (e.currentTarget.style.opacity = "1")}
                  >
                    {item.label}
                    {hasChildren && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        style={{
                          transition: "transform 0.15s",
                          transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                          opacity: 0.6,
                          flexShrink: 0,
                        }}
                      >
                        <polyline points="2,3 5,7 8,3" />
                      </svg>
                    )}
                  </Link>

                  {hasChildren && (
                    <DropdownPanel items={item.children} visible={isActive} />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            {/* Desktop: search pill */}
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 transition-colors focus:outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "6px 10px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            >
              <svg width="14" height="14" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--color-muted)", flexShrink: 0 }}>
                <circle cx="28.58" cy="28.58" r="18.58" />
                <line x1="41.94" y1="42" x2="54" y2="54" />
              </svg>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: "0.05em", color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                Search…
              </span>
              <kbd style={{
                fontFamily: "var(--font-header)", fontSize: 10, letterSpacing: "0.04em",
                color: "var(--color-muted)", background: "rgba(255,255,255,0.07)",
                border: "1px solid var(--color-border)", borderRadius: 3,
                padding: "1px 5px", marginLeft: 6, opacity: 0.7,
              }}>
                ⌘K
              </kbd>
            </button>

            {/* Mobile: search icon */}
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

            {/* Mobile: hamburger */}
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
            className="md:hidden border-t px-5 py-4 flex flex-col"
            style={{ background: "#111111", borderColor: "var(--color-border)" }}
          >
            {navItems.map((item) => {
              const hasChildren = item.children.length > 0;
              const isExpanded = expandedId === item.id;

              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => { if (!hasChildren) setMenuOpen(false); }}
                      style={{
                        display: "block",
                        padding: "12px 0",
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "#fff",
                        textDecoration: "none",
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        style={{
                          background: "transparent", border: "none",
                          color: "var(--color-muted)", cursor: "pointer",
                          padding: "8px 0 8px 16px",
                        }}
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        <svg
                          width="12" height="12" viewBox="0 0 10 10"
                          fill="none" stroke="currentColor" strokeWidth="1.5"
                          style={{ transition: "transform 0.15s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                        >
                          <polyline points="2,3 5,7 8,3" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {hasChildren && isExpanded && (
                    <div style={{ borderLeft: "2px solid var(--color-accent-purple)", marginLeft: 8, marginBottom: 8 }}>
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          onClick={() => setMenuOpen(false)}
                          style={{
                            display: "block",
                            padding: "9px 0 9px 16px",
                            fontFamily: "var(--font-body)",
                            fontSize: 12,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "var(--color-muted)",
                            textDecoration: "none",
                          }}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </header>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
