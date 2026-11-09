'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DOCS } from '@/lib/docs';

// The site's document viewer. A link with data-doc="id" (lib/docs.js) opens it in place of a
// new tab: the page pours out of the link like a window out of the Mac's dock (the genie, or
// magic lamp), and pours back into it on close. Pages are drawn with pdf.js (loaded only on
// first open) as paper on the dark page, with the PDF's own links kept clickable on top. A
// toolbar has the page count, zoom, download, a new-tab link and close; Esc closes, + and -
// zoom. Cmd- or middle-click on the link still opens a new tab, and without JavaScript the
// link is a plain link to the file. The open document is in the address (#doc=id), so it can
// be shared.

let pdfjs;
const loadPdfjs = async () => {
  if (pdfjs) return pdfjs;
  pdfjs = await import('pdfjs-dist/legacy/build/pdf.min.mjs');
  // served as a plain file (copied from node_modules by the prebuild script): the bundler's
  // minifier can't parse pdf.js's worker
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  return pdfjs;
};

function Sheet({ pdf, n, scale, sizeHint, onVisible, onPrinted }) {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const [links, setLinks] = useState([]);
  const [size, setSize] = useState(null);

  useEffect(() => {
    let task, alive = true;
    (async () => {
      const page = await pdf.getPage(n);
      const vp = page.getViewport({ scale });
      const dpr = Math.min(2, devicePixelRatio || 1);
      const c = canvasRef.current;
      if (!alive || !c) return;
      c.width = Math.floor(vp.width * dpr);
      c.height = Math.floor(vp.height * dpr);
      setSize({ w: vp.width, h: vp.height });
      task = page.render({ canvasContext: c.getContext('2d'), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null });
      await task.promise;
      if (!alive) return;
      onPrinted(n, c);
      // the PDF's links, as real links over the sheet
      const notes = await page.getAnnotations();
      setLinks(
        notes
          .filter((a) => a.subtype === 'Link' && /^(https?:|mailto:)/i.test(a.url ?? ''))
          .map((a) => {
            const [x1, y1, x2, y2] = vp.convertToViewportRectangle(a.rect);
            return { url: a.url, x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
          })
      );
    })().catch(() => {});
    return () => {
      alive = false;
      task?.cancel();
    };
  }, [pdf, n, scale]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && onVisible(n), { threshold: 0.5 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [n, onVisible]);

  return (
    <div
      ref={ref}
      className="doc-sheet"
      style={{ width: size?.w ?? sizeHint.w * scale, height: size?.h ?? sizeHint.h * scale }}
      aria-label={`Page ${n}`}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {links.map((l, i) => (
        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="doc-link" style={{ left: l.x, top: l.y, width: l.w, height: l.h }} aria-label={l.url.replace(/^mailto:/, '')} />
      ))}
    </div>
  );
}

// pdf.js and the document, fetched once and kept, so a second open (or a hover first) is instant
const loading = {};
const loadDoc = (id) =>
  (loading[id] ??= loadPdfjs()
    .then((lib) => lib.getDocument(DOCS[id].file).promise)
    .then(async (p) => ({ pdf: p, size: (await p.getPage(1)).getViewport({ scale: 1 }) })));

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const smooth = (x) => x * x * (3 - 2 * x);

// The genie: the page cut into thin horizontal strips that slide into the link one after
// another, nearest first, each narrowing as it nears it, so the sides curve into a funnel
// and the page pours in. `opening` plays it backwards, out of the link.
function genie(overlay, src, sheet, link, opening) {
  return new Promise((done) => {
    const g = overlay.getContext('2d');
    const dpr = Math.min(2, devicePixelRatio || 1);
    overlay.width = innerWidth * dpr;
    overlay.height = innerHeight * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const below = link.top + link.height / 2 > sheet.top + sheet.height / 2;
    const ty = below ? link.top + link.height * 0.3 : link.bottom - link.height * 0.3;
    const tx = link.left + link.width / 2, tw = Math.max(12, link.width * 0.8);
    const far = below ? sheet.top : sheet.bottom, span = Math.abs(ty - far) || 1;
    const N = Math.max(40, Math.ceil(sheet.height / 3));
    const sh = src.height / N, dh = sheet.height / N;
    const began = performance.now(), dur = opening ? 600 : 560;
    const frame = (now) => {
      const k = Math.min(1, (now - began) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
      const p = opening ? 1 - e : e;
      g.clearRect(0, 0, innerWidth, innerHeight);
      // where each strip's top edge is now: strips nearer the link set off sooner
      const slideAt = (v) => smooth(Math.min(1, Math.max(0, p * 1.6 - (1 - (below ? v : 1 - v)) * 0.6)));
      const edge = (j) => {
        const y0 = sheet.top + j * dh;
        return y0 + (ty - y0) * slideAt(j / N);
      };
      let top = edge(0);
      for (let i = 0; i < N; i++) {
        // each strip runs from its own edge to the next one's, so neighbours always meet
        const bottom = edge(i + 1);
        const y = Math.min(top, bottom), h = Math.max(0.6, Math.abs(bottom - top));
        const slide = slideAt((i + 0.5) / N);
        const mid = y + h / 2;
        const f = smooth(Math.min(1, Math.max(0, 1 - Math.abs(mid - ty) / span))) * Math.min(1, p * 2.2);
        const cx = sheet.left + sheet.width / 2 + (tx - sheet.left - sheet.width / 2) * f;
        const hw = sheet.width / 2 + (tw / 2 - sheet.width / 2) * f;
        g.globalAlpha = 1 - Math.max(0, (slide - 0.85) / 0.15); // gone into the link at the very end
        g.drawImage(src, 0, i * sh, src.width, sh, cx - hw, y, hw * 2, h + 0.5);
        top = bottom;
      }
      g.globalAlpha = 1;
      if (k < 1) requestAnimationFrame(frame);
      else {
        g.clearRect(0, 0, innerWidth, innerHeight);
        done();
      }
    };
    requestAnimationFrame(frame);
  });
}
const announce = (state, from) => window.dispatchEvent(new CustomEvent('doc-state', { detail: { state, from } }));

export default function DocViewer() {
  const dialog = useRef(null);
  const stack = useRef(null);
  const overlay = useRef(null);
  const fromRef = useRef(null);
  const canvases = useRef(new Map()); // page number → its rendered canvas
  const phaseRef = useRef('closed');
  const [doc, setDoc] = useState(null); // { id, ...DOCS[id] }
  const [pdf, setPdf] = useState(null);
  const [first, setFirst] = useState(null); // page 1's size at scale 1
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(1);
  const [page, setPage] = useState(1);
  const [phase, setPhaseState] = useState('closed'); // opening, open, closing
  const setPhase = (v) => {
    phaseRef.current = v;
    setPhaseState(v);
  };
  // the genie only runs from a link that's on screen, and not for reduced motion
  const canGenie = () => !reduced() && fromRef.current?.isConnected && overlay.current;

  const open = useCallback(async (id, from) => {
    const d = DOCS[id];
    if (!d) return;
    fromRef.current = from ?? null;
    setDoc({ id, ...d });
    setPdf(null);
    setError(false);
    setZoom(1);
    setPage(1);
    canvases.current.clear();
    setPhase('opening');
    dialog.current?.showModal();
    announce('opening', fromRef.current);
    if (location.hash !== `#doc=${id}`) history.replaceState(null, '', `#doc=${id}`);
    try {
      const { pdf: p, size } = await loadDoc(id);
      setFit(Math.min(1.5, (Math.min(innerWidth, 900) - 48) / size.width));
      setFirst({ w: size.width, h: size.height });
      setPdf(p);
    } catch {
      setError(true);
    }
  }, []);

  // the first page is drawn (still hidden): pour it out of the link, then show the real pages
  const onPrinted = useCallback(async (n, canvas) => {
    canvases.current.set(n, canvas);
    if (n !== 1 || phaseRef.current !== 'opening') return;
    if (canGenie()) await genie(overlay.current, canvas, canvas.getBoundingClientRect(), fromRef.current.getBoundingClientRect(), true);
    if (phaseRef.current === 'opening') setPhase('open');
  }, []);

  const finish = useCallback(() => {
    dialog.current?.close();
    setPhase('closed');
    announce('closed', fromRef.current);
  }, []);

  // pour back into the link, then close; from the page you're on
  const close = useCallback(async () => {
    if (phaseRef.current === 'closing') return;
    const src = canvases.current.get(page) ?? canvases.current.get(1);
    if (!canGenie() || !src || phaseRef.current !== 'open') return finish();
    const rect = src.getBoundingClientRect();
    setPhase('closing');
    await genie(overlay.current, src, rect, fromRef.current.getBoundingClientRect(), false);
    finish();
  }, [page, finish]);

  useEffect(() => {
    // any link marked data-doc opens here, unless it's a modified or middle click; hovering
    // one fetches the document ahead
    const onClick = (e) => {
      const a = e.target.closest?.('a[data-doc]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      open(a.dataset.doc, a);
    };
    const warm = (e) => {
      const a = e.target.closest?.('a[data-doc]');
      if (a && DOCS[a.dataset.doc]) loadDoc(a.dataset.doc).catch(() => {});
    };
    const onOpen = (e) => open(e.detail.id, e.detail.from);
    document.addEventListener('click', onClick);
    document.addEventListener('pointerover', warm);
    document.addEventListener('focusin', warm);
    window.addEventListener('open-doc', onOpen);
    const m = location.hash.match(/^#doc=(\w+)/);
    if (m) open(m[1]);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('pointerover', warm);
      document.removeEventListener('focusin', warm);
      window.removeEventListener('open-doc', onOpen);
    };
  }, [open]);

  useEffect(() => {
    const d = dialog.current;
    const onClose = () => {
      setDoc(null);
      setPdf(null);
      if (location.hash.startsWith('#doc=')) history.replaceState(null, '', location.pathname + location.search);
    };
    // Esc: float back rather than vanish
    const onCancel = (e) => {
      e.preventDefault();
      close();
    };
    const onKey = (e) => {
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(2.5, z + 0.25));
      if (e.key === '-') setZoom((z) => Math.max(0.5, z - 0.25));
    };
    d.addEventListener('close', onClose);
    d.addEventListener('cancel', onCancel);
    d.addEventListener('keydown', onKey);
    return () => {
      d.removeEventListener('close', onClose);
      d.removeEventListener('cancel', onCancel);
      d.removeEventListener('keydown', onKey);
    };
  }, [close]);

  const scale = fit * zoom;
  const btn = 'w-8 h-8 grid place-items-center rounded-md text-mute hover:text-signal hover:bg-raised transition-colors no-underline';

  return (
    <dialog
      ref={dialog}
      aria-label={doc ? `${doc.title}, in a document viewer` : 'Document viewer'}
      className={`doc-viewer${phase === 'closing' ? ' closing' : ''}`}
      // a click on the backdrop (the dialog itself, outside the pages) closes it
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      {doc && (
        <>
          <div className="doc-bar">
            <span className="font-mono text-xs text-text truncate">
              {doc.title}
              <span className="text-mute">{pdf ? ` · page ${page} of ${pdf.numPages}` : error ? '' : ' · printing…'}</span>
            </span>
            <span className="flex items-center gap-0.5">
              <button type="button" className={btn} onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} aria-label="Zoom out">−</button>
              <button type="button" className={`${btn} !w-auto px-2 font-mono text-[11px]`} onClick={() => setZoom(1)} aria-label="Fit to width">
                {Math.round(zoom * 100)}%
              </button>
              <button type="button" className={btn} onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))} aria-label="Zoom in">+</button>
              <span className="w-px h-5 bg-line mx-1" aria-hidden="true" />
              <a href={doc.file} download={doc.download} className={btn} aria-label="Download">↓</a>
              <a href={doc.file} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Open in a new tab">↗</a>
              <button type="button" className={btn} onClick={close} aria-label="Close">✕</button>
            </span>
          </div>
          <div className="doc-pages" onClick={(e) => e.target === e.currentTarget && close()}>
            {error && (
              <p className="font-mono text-sm text-mute text-center mt-24">
                Couldn&rsquo;t show it here.{' '}
                <a href={doc.file} target="_blank" rel="noopener noreferrer" className="text-signal">
                  Open the PDF ↗
                </a>
              </p>
            )}
            {pdf && first && (
              <div ref={stack} className={`doc-stack ${phase}`} onClick={(e) => e.target === e.currentTarget && close()}>
                {Array.from({ length: pdf.numPages }, (_, i) => (
                  <Sheet key={i} pdf={pdf} n={i + 1} scale={scale} sizeHint={first} onVisible={setPage} onPrinted={onPrinted} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
      <canvas ref={overlay} className="doc-genie" aria-hidden="true" />
    </dialog>
  );
}
