// Documents that open in the site's own viewer (components/DocViewer.jsx) instead of a new tab.
// Add a certificate here and link to it with <a href={file} data-doc="id">.
export const DOCS = {
  resume: { title: 'Résumé', file: '/Manas_resume.pdf', download: 'Manas_Dasari_resume.pdf' },
};

// open a document from code (the command palette, say); `from` is the element it grows out of
export const openDoc = (id, from) => window.dispatchEvent(new CustomEvent('open-doc', { detail: { id, from } }));
