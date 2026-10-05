"use client";

import { useRef, useEffect, useState } from "react";
import SignaturePadLib from "signature_pad";

interface Props {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

const PRESETS = ["#000000", "#1a1aff", "#cc0000", "#1a7a1a", "#a78bfa"];

export default function SignaturePad({ onSave, onCancel }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const padRef     = useRef<SignaturePadLib | null>(null);
  const [penColor, setPenColor] = useState("#000000");

  useEffect(() => {
    if (!canvasRef.current) return;
    padRef.current = new SignaturePadLib(canvasRef.current, {
      backgroundColor: "rgba(255,255,255,0)",
      penColor,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep pad in sync when color changes
  useEffect(() => {
    if (padRef.current) padRef.current.penColor = penColor;
  }, [penColor]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)" }}>
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: 24, width: 480 }}>
        <p style={{ fontFamily: "var(--font-header)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-muted)", marginBottom: 12 }}>
          Draw your signature
        </p>

        <canvas
          ref={canvasRef}
          width={432}
          height={150}
          style={{ border: "1px solid var(--color-border)", borderRadius: 4, width: "100%", background: "#ffffff" }}
        />

        {/* Color picker row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
          <span style={{ fontFamily: "var(--font-header)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-muted)" }}>
            Ink
          </span>
          {PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => setPenColor(c)}
              style={{
                width: 20, height: 20, borderRadius: "50%", border: penColor === c ? "2px solid #fff" : "2px solid transparent",
                background: c, cursor: "pointer", flexShrink: 0, padding: 0,
              }}
            />
          ))}
          <input
            type="color"
            value={penColor}
            onChange={(e) => setPenColor(e.target.value)}
            style={{ width: 24, height: 24, border: "none", background: "none", cursor: "pointer", padding: 0 }}
            title="Custom color"
          />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
          {[
            { label: "Clear",  onClick: () => padRef.current?.clear() },
            { label: "Cancel", onClick: onCancel },
          ].map((b) => (
            <button
              key={b.label}
              onClick={b.onClick}
              style={{ fontFamily: "var(--font-header)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: 4, color: "var(--color-muted)", cursor: "pointer" }}
            >
              {b.label}
            </button>
          ))}
          <button
            onClick={() => { if (!padRef.current?.isEmpty()) onSave(padRef.current!.toDataURL("image/png")); }}
            style={{ fontFamily: "var(--font-header)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", background: "var(--color-accent-purple)", border: "none", borderRadius: 4, color: "#fff", cursor: "pointer" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
