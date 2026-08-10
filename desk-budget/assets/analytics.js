/* Keep my own visits out of Vercel Web Analytics.
   Loads before the insights script and drops every event while a
   `va-disable` flag is set in localStorage.
     ?va-disable=1  → stop counting this browser
     ?va-disable=0  → count it again                                        */

/* Queue stub — the insights script drains window.vaq once it loads. */
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

(function () {
  const KEY = 'va-disable';

  /* localStorage throws in some privacy modes; treat that as "count me". */
  function isMuted() {
    try { return localStorage.getItem(KEY) !== null; } catch (e) { return false; }
  }
  function setMuted(muted) {
    try { muted ? localStorage.setItem(KEY, '1') : localStorage.removeItem(KEY); } catch (e) {}
  }

  /* ?va-disable=1 / =0 flips the flag, then strips the param from the
     URL so it never reaches an event or gets copied into a shared link. */
  let param = null;
  try { param = new URLSearchParams(location.search).get(KEY); } catch (e) {}
  if (param === '1' || param === '0') {
    setMuted(param === '1');
    try {
      const url = new URL(location.href);
      url.searchParams.delete(KEY);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) {}
    console.info('[analytics] this browser is ' +
      (param === '1' ? 'no longer counted' : 'counted again') + ' in Web Analytics');
  }

  window.va('beforeSend', function (event) { return isMuted() ? null : event; });
})();
