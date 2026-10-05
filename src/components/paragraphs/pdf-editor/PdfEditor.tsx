"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import SignaturePad from "./SignaturePad";

// ── Types ────────────────────────────────────────────────────────────────────

interface TextAnnot {
  id: string; kind: "text";
  x: number; y: number;
  value: string; fontSize: number; color: string;
}

interface SigAnnot {
  id: string; kind: "signature";
  x: number; y: number;
  dataUrl: string;
}

type Annot = TextAnnot | SigAnnot;

// ── Helpers ──────────────────────────────────────────────────────────────────

const SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24];

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ];
}

function btn(v: "primary" | "outline" | "active"): React.CSSProperties {
  const base: React.CSSProperties = {
    fontFamily: "var(--font-header)", fontSize: 9, letterSpacing: "0.12em",
    textTransform: "uppercase", padding: "8px 14px", borderRadius: 4, cursor: "pointer",
  };
  if (v === "primary")  return { ...base, background: "var(--color-accent-purple)", border: "none", color: "#fff" };
  if (v === "active")   return { ...base, background: "var(--color-accent-purple)", border: "1px solid var(--color-accent-purple)", color: "#fff" };
  return { ...base, background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-muted)" };
}

// ── AnnotEl ──────────────────────────────────────────────────────────────────

function AnnotEl({ annot, active, onActivate, onEdit, onRemove, onDragStart }: {
  annot: Annot;
  active: boolean;
  onActivate: (id: string) => void;
  onEdit: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
}) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (active && annot.kind === "text") inputRef.current?.focus();
  }, [active, annot.kind]);

  // Keep input width in sync with content
  useEffect(() => {
    if (annot.kind !== "text" || !inputRef.current || !mirrorRef.current) return;
    inputRef.current.style.width =
      Math.max(60, mirrorRef.current.offsetWidth + 8) + "px";
  }, [annot.kind, annot.kind === "text" ? annot.value : null, annot.kind === "text" ? annot.fontSize : null]);

  return (
    <div
      className="group"
      style={{ position: "absolute", left: `${annot.x}%`, top: `${annot.y}%`, zIndex: 10, userSelect: "none" }}
      onMouseDown={(e) => { e.stopPropagation(); onDragStart(e, annot.id); onActivate(annot.id); }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Remove button */}
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onRemove(annot.id); }}
        className="group-hover:!flex"
        style={{
          position: "absolute", top: -8, right: -8, width: 16, height: 16,
          borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff",
          fontSize: 10, cursor: "pointer", display: "none", alignItems: "center",
          justifyContent: "center", lineHeight: 1,
        }}
      >×</button>

      {annot.kind === "text" && (
        <>
          {/* Hidden mirror — measures text so the input auto-expands */}
          <span
            ref={mirrorRef}
            aria-hidden
            style={{
              position: "absolute", visibility: "hidden", whiteSpace: "pre",
              fontSize: annot.fontSize, fontFamily: "Helvetica, Arial, sans-serif",
              padding: 0, margin: 0, lineHeight: 1, pointerEvents: "none",
            }}
          >
            {annot.value || (active ? "Type…" : " ")}
          </span>

          <input
            ref={inputRef}
            value={annot.value}
            readOnly={!active}
            onChange={(e) => onEdit(annot.id, e.target.value)}
            onBlur={() => { if (!annot.value.trim()) onRemove(annot.id); }}
            placeholder={active ? "Type…" : ""}
            autoComplete="off"
            style={{
              background: "transparent",
              border: "none",
              boxShadow: active ? `0 1px 0 ${annot.color}` : "none",
              outline: "none",
              color: annot.color,
              fontSize: annot.fontSize,
              fontFamily: "Helvetica, Arial, sans-serif",
              width: 60,
              caretColor: active ? annot.color : "transparent",
              padding: 0,
              margin: 0,
              lineHeight: 1,
              display: "block",
              cursor: active ? "text" : "move",
              whiteSpace: "nowrap",
            }}
          />
        </>
      )}

      {annot.kind === "signature" && (
        <img
          src={annot.dataUrl}
          alt="signature"
          draggable={false}
          style={{ height: 44, objectFit: "contain", cursor: "move", display: "block" }}
        />
      )}
    </div>
  );
}

// ── UploadZone ───────────────────────────────────────────────────────────────

function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  return (
    <div
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") onFile(f); }}
      onDragOver={(e) => e.preventDefault()}
      style={{
        border: "2px dashed var(--color-border)", borderRadius: 8,
        padding: "80px 40px", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 16, background: "var(--color-surface)",
      }}
    >
      <span style={{ fontSize: 48 }}>📄</span>
      <p style={{ fontFamily: "var(--font-header)", fontSize: 14, color: "#fff", letterSpacing: "0.05em" }}>
        Drop a PDF here
      </p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--color-muted)" }}>or</p>
      <label style={{
        fontFamily: "var(--font-header)", fontSize: 10, letterSpacing: "0.15em",
        textTransform: "uppercase", padding: "10px 24px",
        background: "var(--color-accent-purple)", border: "none", borderRadius: 4,
        color: "#fff", cursor: "pointer",
      }}>
        Browse file
        <input type="file" accept="application/pdf" style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </label>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PdfEditor({ heading }: { heading?: string }) {
  const [pdfBytes, setPdfBytes]   = useState<Uint8Array | null>(null);
  const [pdfName, setPdfName]     = useState("");
  const [annots, setAnnots]       = useState<Annot[]>([]);
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [pendingSig, setPendingSig] = useState(false);
  const [showSigPad, setShowSigPad] = useState(false);
  const [fontSize, setFontSize]   = useState(13);
  const [color, setColor]         = useState("#000000");
  const [downloading, setDownloading] = useState(false);

  const canvasRef     = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const sigPosRef     = useRef<{ x: number; y: number }>({ x: 10, y: 10 });

  const renderPDF = useCallback(async (bytes: Uint8Array) => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    const pdf     = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
    const page    = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas  = canvasRef.current;
    if (!canvas) return;
    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    if (renderTaskRef.current) renderTaskRef.current.cancel();
    const task = page.render({ canvasContext: ctx, viewport, canvas });
    renderTaskRef.current = task;
    await task.promise;
  }, []);

  async function handleFile(file: File) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    setPdfBytes(bytes);
    setPdfName(file.name);
    setAnnots([]);
    setActiveId(null);
    await renderPDF(bytes);
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;

    if (pendingSig) {
      sigPosRef.current = { x, y };
      setPendingSig(false);
      setShowSigPad(true);
      return;
    }

    const id = `t-${Date.now()}`;
    setAnnots((prev) => [...prev, { id, kind: "text", x, y, value: "", fontSize, color }]);
    setActiveId(id);
  }

  function handleAnnotDragStart(e: React.MouseEvent, id: string) {
    const annot = annots.find((a) => a.id === id);
    if (!annot) return;
    const startX = e.clientX, startY = e.clientY;
    const origX  = annot.x,   origY  = annot.y;
    let dragging = false;

    function onMove(ev: MouseEvent) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      // Only start moving after crossing a 6px threshold so a
      // plain click to position the text cursor doesn't drag.
      if (!dragging && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      dragging = true;
      const rect = canvas.getBoundingClientRect();
      setAnnots((prev) => prev.map((a) =>
        a.id === id
          ? { ...a, x: Math.max(0, Math.min(90, origX + (dx / rect.width)  * 100)),
                    y: Math.max(0, Math.min(95, origY + (dy / rect.height) * 100)) }
          : a
      ));
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  async function handleDownload() {
    if (!pdfBytes) return;
    setDownloading(true);
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page   = pdfDoc.getPages()[0];
      const { width: pw, height: ph } = page.getSize();
      const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (const annot of annots) {
        const px = (annot.x / 100) * pw;
        const py = ph - (annot.y / 100) * ph;

        if (annot.kind === "text" && annot.value.trim()) {
          const [r, g, b] = hexToRgb(annot.color);
          const size = annot.fontSize / 1.5;
          page.drawText(annot.value, { x: px, y: py - size, size, font, color: rgb(r, g, b) });
        }

        if (annot.kind === "signature") {
          const sigBytes = Uint8Array.from(
            atob(annot.dataUrl.replace(/^data:image\/png;base64,/, "")),
            (c) => c.charCodeAt(0)
          );
          const img  = await pdfDoc.embedPng(sigBytes);
          const dims = img.scaleToFit(pw * 0.25, 50);
          page.drawImage(img, { x: px, y: py - dims.height, width: dims.width, height: dims.height });
        }
      }

      const out  = await pdfDoc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = pdfName.replace(/\.pdf$/i, "-edited.pdf");
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section style={{ padding: "48px 0 80px" }}>
      <div className="page-width">

        <div className="article-list-header" style={{ marginBottom: 32 }}>
          <div className="article-list-header__line" />
          <div className="article-list-header__badge">{heading ?? "PDF Editor"}</div>
        </div>

        {!pdfBytes ? (
          <UploadZone onFile={handleFile} />
        ) : (
          <>
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => { setPdfBytes(null); setAnnots([]); setActiveId(null); }}
                style={btn("outline")}
              >
                ← New file
              </button>

              <div style={{ width: 1, height: 24, background: "var(--color-border)" }} />

              <label style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                Size
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 4, color: "#fff", padding: "2px 6px", fontFamily: "var(--font-body)", fontSize: 12 }}
                >
                  {SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
                </select>
              </label>

              <label style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                Color
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", padding: 0 }}
                />
              </label>

              <div style={{ width: 1, height: 24, background: "var(--color-border)" }} />

              <button
                onClick={() => setPendingSig((v) => !v)}
                style={btn(pendingSig ? "active" : "outline")}
              >
                {pendingSig ? "Click PDF to place…" : "✍ Signature"}
              </button>

              <div style={{ marginLeft: "auto" }}>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  style={{ ...btn("primary"), opacity: downloading ? 0.6 : 1 }}
                >
                  {downloading ? "Generating…" : "⬇ Download PDF"}
                </button>
              </div>
            </div>

            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)", marginBottom: 12 }}>
              Click anywhere on the PDF to place text. Drag to reposition. Hover any annotation to remove it.
            </p>

            {/* PDF canvas */}
            <div
              style={{
                position: "relative", display: "inline-block", lineHeight: 0,
                boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                cursor: pendingSig ? "crosshair" : "text",
              }}
              onClick={handleCanvasClick}
            >
              <canvas ref={canvasRef} style={{ display: "block" }} />
              {annots.map((annot) => (
                <AnnotEl
                  key={annot.id}
                  annot={annot}
                  active={activeId === annot.id}
                  onActivate={setActiveId}
                  onEdit={(id, value) =>
                    setAnnots((p) => p.map((a) =>
                      a.id === id && a.kind === "text" ? { ...a, value } : a
                    ))
                  }
                  onRemove={(id) => setAnnots((p) => p.filter((a) => a.id !== id))}
                  onDragStart={handleAnnotDragStart}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showSigPad && (
        <SignaturePad
          onSave={(dataUrl) => {
            setAnnots((prev) => [
              ...prev,
              { id: `s-${Date.now()}`, kind: "signature", x: sigPosRef.current.x, y: sigPosRef.current.y, dataUrl },
            ]);
            setShowSigPad(false);
          }}
          onCancel={() => setShowSigPad(false)}
        />
      )}
    </section>
  );
}
