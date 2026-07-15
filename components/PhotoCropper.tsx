"use client";

import { useRef, useState } from "react";

// A5-verhouding (148:210 mm), export op 5x voor een scherpe foto.
const CANVAS_W = 740;
const CANVAS_H = 1050;

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/**
 * Laat de gever een foto kiezen, altijd rechtop op A5-verhouding uitgesneden.
 * Slepen verschuift het beeld, de schuif zoomt in. Het resultaat wordt als
 * losstaand bestand in een verborgen file-input gezet, zodat het gewoon met
 * de rest van het formulier meegaat.
 */
export default function PhotoCropper({
  name,
  onPreviewChange,
}: {
  name: string;
  onPreviewChange?: (url: string | null) => void;
}) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [zoomDisplay, setZoomDisplay] = useState(1);

  const naturalRef = useRef({ w: 0, h: 0 });
  const panRef = useRef({ x: 0.5, y: 0.5 });
  const zoomRef = useRef(1);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(
    null
  );

  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  function metrics() {
    const frame = frameRef.current;
    const { w: iw, h: ih } = naturalRef.current;
    if (!frame || !iw || !ih) return null;
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    // "contain": bij zoom 1 staat de hele foto in beeld, niet uitgesneden.
    const baseScale = Math.min(fw / iw, fh / ih);
    const effScale = baseScale * zoomRef.current;
    const dispW = iw * effScale;
    const dispH = ih * effScale;
    return { fw, fh, dispW, dispH, maxX: Math.max(dispW - fw, 0), maxY: Math.max(dispH - fh, 0) };
  }

  function render() {
    const m = metrics();
    const img = imgRef.current;
    if (!m || !img) return;
    const panX = panRef.current.x * m.maxX;
    const panY = panRef.current.y * m.maxY;
    img.style.width = `${m.dispW}px`;
    img.style.height = `${m.dispH}px`;
    img.style.transform = `translate(${-panX}px, ${-panY}px)`;
  }

  function composite() {
    const img = imgRef.current;
    const m = metrics();
    if (!img || !m || !img.complete) return;

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Witte ondergrond zodat een niet-volledig gevulde foto (bij "hele foto
    // tonen") geen zwarte randen krijgt in het geëxporteerde bestand.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const scaleToCanvas = CANVAS_W / m.fw;
    const dispWC = m.dispW * scaleToCanvas;
    const dispHC = m.dispH * scaleToCanvas;
    const panXC = panRef.current.x * (dispWC - CANVAS_W);
    const panYC = panRef.current.y * (dispHC - CANVAS_H);

    ctx.drawImage(img, -panXC, -panYC, dispWC, dispHC);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "cadeau-foto.jpg", { type: "image/jpeg" });
        const dt = new DataTransfer();
        dt.items.add(file);
        if (hiddenInputRef.current) hiddenInputRef.current.files = dt.files;
        onPreviewChange?.(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.92
    );
  }

  function handleImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    naturalRef.current = { w: img.naturalWidth, h: img.naturalHeight };
    panRef.current = { x: 0.5, y: 0.5 };
    zoomRef.current = 1;
    setZoomDisplay(1);
    render();
    composite();
  }

  function pickFile(file: File) {
    setImgSrc(URL.createObjectURL(file));
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!imgSrc) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const m = metrics();
    if (!m) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const fracX = m.maxX > 0 ? dragRef.current.panX - dx / m.maxX : 0.5;
    const fracY = m.maxY > 0 ? dragRef.current.panY - dy / m.maxY : 0.5;
    panRef.current = { x: clamp01(fracX), y: clamp01(fracY) };
    render();
  }

  function onPointerUp() {
    if (!dragRef.current) return;
    dragRef.current = null;
    composite();
  }

  function onZoomChange(z: number) {
    zoomRef.current = z;
    setZoomDisplay(z);
    render();
    composite();
  }

  return (
    <div>
      <input ref={hiddenInputRef} type="file" name={name} className="hidden" tabIndex={-1} />

      {!imgSrc ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-navy-900/25 bg-white px-4 py-10 text-center text-sm text-navy-900/60 hover:border-gold-500/60">
          <span className="font-medium text-navy-900">Kies een foto</span>
          <span className="text-xs">
            Wordt rechtop op A5-formaat gezet — hierna kun je slepen en zoomen
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) pickFile(file);
            }}
          />
        </label>
      ) : (
        <div className="space-y-3">
          <div
            ref={frameRef}
            className="relative mx-auto touch-none select-none overflow-hidden rounded-xl border border-navy-900/15 bg-white"
            style={{ aspectRatio: "148 / 210", maxWidth: 280 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Gekozen foto"
              onLoad={handleImgLoad}
              className="absolute left-0 top-0 max-w-none cursor-grab active:cursor-grabbing"
              draggable={false}
            />

            {/* Toont waar de band met de boodschap straks overheen komt te
                staan (worst-case hoogte, bij een langere groet op 2 regels) —
                zodat belangrijke inhoud (bv. een handtekening) daar niet
                per ongeluk onder verdwijnt. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-end gap-0.5 border-t border-dashed border-white/50 bg-navy-950/55 py-1.5 text-center text-white/80" style={{ height: "15.5%" }}>
              <span className="text-[9px] font-medium uppercase tracking-wide">Boodschap komt hier</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-navy-900/50">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoomDisplay}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="flex-1 accent-gold-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-block cursor-pointer text-sm font-medium text-navy-950 underline">
              Andere foto kiezen
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) pickFile(file);
                }}
              />
            </label>
            <p className="text-xs text-navy-900/40">Sleep de foto om te verschuiven</p>
          </div>
        </div>
      )}
    </div>
  );
}
