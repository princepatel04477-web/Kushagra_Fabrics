/**
 * The one render-blocking inline script, run in <head> before first paint.
 *
 * Kept out of any "use client" module on purpose: a server component that
 * imports a value from a client module receives a client-reference stub, not
 * the value — the inline script would be a function stub instead of code.
 *
 * - html[data-js]        JS is running: the hero starts closed (globals.css).
 * - html[data-preloaded] skip the preloader: already played this session, or
 *                        the visitor prefers reduced motion.
 * - Strips comments and whitespace-only text from <head> parsed so far.
 *   Netlify injects a "This site is hosted on Netlify" comment right after
 *   <meta charset> on production deploys; React never rendered it, so
 *   hydration fails (#418) and the whole document is re-rendered on the
 *   client — losing data-js and data-preloaded, which is what made the live
 *   site glitch. React itself puts no comments or bare text in <head>.
 */

/** sessionStorage key the preloader writes once its curtain has lifted. */
export const PRELOADER_FLAG = "kushagra-preloaded";

export const HEAD_SCRIPT = `(function(){var d=document.documentElement;d.dataset.js="1";try{if(sessionStorage.getItem("${PRELOADER_FLAG}")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.preloaded="1"}}catch(e){d.dataset.preloaded="1"}var h=document.head,n=h&&h.firstChild;while(n){var x=n.nextSibling;if(n.nodeType===8||(n.nodeType===3&&!/\\S/.test(n.data))){h.removeChild(n)}n=x}})();`;
