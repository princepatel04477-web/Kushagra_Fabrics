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
 */

/** sessionStorage key the preloader writes once its curtain has lifted. */
export const PRELOADER_FLAG = "kushagra-preloaded";

export const HEAD_SCRIPT = `(function(){var d=document.documentElement;d.dataset.js="1";try{if(sessionStorage.getItem("${PRELOADER_FLAG}")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.preloaded="1"}}catch(e){d.dataset.preloaded="1"}})();`;
