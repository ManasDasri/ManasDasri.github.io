'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DOCS } from '@/lib/docs';

// The site's document viewer. A link with data-doc="id" (lib/docs.js) opens it in place of a
// new tab: the page grows out of the link, then each sheet is printed onto the screen, an
// accent line sweeping down it as it renders. Pages are drawn with pdf.js (loaded only on
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

function Sheet({ pdf, n, scale, onVisible }) {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const [links, setLinks] = useState([]);
  const [size, setSize] = useState(null);
  const [printed, setPrinted] = useState(false);

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
      setPrinted(true);
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
      className={`doc-sheet${printed ? ' printed' : ''}`}
      style={{ width: size?.w ?? 612 * scale, height: size?.h ?? 792 * scale, '--i': n - 1 }}
      aria-label={`Page ${n}`}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      <span className="doc-scan" aria-hidden="true" />
      {links.map((l, i) => (
        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="doc-link" style={{ left: l.x, top: l.y, width: l.w, height: l.h }} aria-label={l.url.replace(/^mailto:/, '')} />
      ))}
    </div>
  );
}

export default function DocViewer() {
  const dialog = useRef(null);
  const [doc, setDoc] = useState(null); // { id, ...DOCS[id] }
  const [pdf, setPdf] = useState(null);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(1);
  const [page, setPage] = useState(1);
  const [origin, setOrigin] = useState(null);

  const open = useCallback(async (id, from) => {
    const d = DOCS[id];
    if (!d) return;
    // grow out of the link that opened it
    const r = from?.getBoundingClientRect?.();
    setOrigin(r ? { x: r.left + r.width / 2 - innerWidth / 2, y: r.top + r.height / 2 - innerHeight / 2 } : null);
    setDoc({ id, ...d });
    setPdf(null);
    setError(false);
    setZoom(1);
    setPage(1);
    dialog.current?.showModal();
    if (location.hash !== `#doc=${id}`) history.replaceState(null, '', `#doc=${id}`);
    try {
      const lib = await loadPdfjs();
      const p = await lib.getDocument(d.file).promise;
      const first = await p.getPage(1);
      const w = first.getViewport({ scale: 1 }).width;
      setFit(Math.min(1.5, (Math.min(innerWidth, 900) - 48) / w));
      setPdf(p);
    } catch {
      setError(true);
    }
  }, []);

  const close = useCallback(() => {
    dialog.current?.close();
  }, []);

  useEffect(() => {
    // any link marked data-doc opens here, unless it's a modified or middle click
    const onClick = (e) => {
      const a = e.target.closest?.('a[data-doc]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      open(a.dataset.doc, a);
    };
    const onOpen = (e) => open(e.detail.id, e.detail.from);
    document.addEventListener('click', onClick);
    window.addEventListener('open-doc', onOpen);
    const m = location.hash.match(/^#doc=(\w+)/);
    if (m) open(m[1]);
    return () => {
      document.removeEventListener('click', onClick);
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
    const onKey = (e) => {
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(2.5, z + 0.25));
      if (e.key === '-') setZoom((z) => Math.max(0.5, z - 0.25));
    };
    d.addEventListener('close', onClose);
    d.addEventListener('keydown', onKey);
    return () => {
      d.removeEventListener('close', onClose);
      d.removeEventListener('keydown', onKey);
    };
  }, []);

  const scale = fit * zoom;
  const btn = 'w-8 h-8 grid place-items-center rounded-md text-mute hover:text-signal hover:bg-raised transition-colors no-underline';

  return (
    <dialog
      ref={dialog}
      aria-label={doc ? `${doc.title}, in a document viewer` : 'Document viewer'}
      className="doc-viewer"
      style={origin ? { '--from-x': `${origin.x}px`, '--from-y': `${origin.y}px` } : undefined}
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
            {!pdf && !error && <div className="doc-sheet doc-blank" style={{ width: Math.min(innerWidth - 48, 640), height: Math.min(innerWidth - 48, 640) * 1.294 }} />}
            {pdf && Array.from({ length: pdf.numPages }, (_, i) => <Sheet key={i} pdf={pdf} n={i + 1} scale={scale} onVisible={setPage} />)}
          </div>
        </>
      )}
    </dialog>
  );
}
