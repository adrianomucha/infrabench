/* The contact form, shared by every page. Any button marked data-contact opens it in a
   dialog; it posts to /api/contact, which emails Adrian. Adrian's address never appears in
   the page. Styles ride along here so a page needs only this one tag, and they use each
   page's own tokens, so the dialog matches wherever it opens.

   The draft survives closing and reopening; it clears only once a message is sent. A
   click on the backdrop closes the dialog only while it is empty, so a stray click never
   throws a message away. */
(function () {
  "use strict";
  var CSS = [
    "html:has(.cf[open]){overflow:hidden}",
    ".cf{width:min(520px,calc(100vw - 32px));max-height:calc(100dvh - 32px);margin:auto;padding:0;overflow:auto;",
    "  background:var(--bg3,#14181C);color:var(--tx);border:1px solid var(--line2);box-shadow:0 24px 64px rgba(0,0,0,.55)}",
    ".cf::backdrop{background:rgba(5,7,10,.72)}",
    ".cf form{display:grid;gap:18px;padding:28px}",
    ".cf-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}",
    ".cf h2{margin:0;font-size:var(--fs-heading);font-weight:500;letter-spacing:-.02em;line-height:1.25}",
    ".cf-sub{margin:6px 0 0;font-size:var(--fs-small);color:var(--tx2)}",
    ".cf-x{flex:none;display:grid;place-items:center;width:32px;height:32px;margin:-4px -6px 0 0;padding:0;background:none;border:0;color:var(--tx2);cursor:pointer}",
    ".cf-x:hover{color:var(--tx)}",
    ".cf-x svg{width:14px;height:14px}",
    ".cf label{display:grid;gap:6px;font-size:var(--fs-small);color:var(--tx2)}",
    ".cf label span b{font-weight:400;color:var(--tx3)}",
    ".cf input,.cf textarea{width:100%;box-sizing:border-box;padding:10px 12px;background:var(--bg);color:var(--tx);",
    "  border:1px solid var(--control-border);border-radius:0;font:inherit;font-size:16px;line-height:1.5}",
    ".cf textarea{min-height:140px;resize:vertical}",
    ".cf input:hover,.cf textarea:hover{border-color:var(--control-border-hover)}",
    ".cf input:focus-visible,.cf textarea:focus-visible{outline:2px solid var(--grn);outline-offset:0;border-color:transparent}",
    ".cf [aria-invalid=true]{border-color:#FF9A8C}",
    ".cf-err{font-size:var(--fs-small);color:#FF9A8C}",
    ".cf-err:empty{display:none}",
    ".cf-trap{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}",
    ".cf-status{margin:0;font-size:var(--fs-small);color:var(--tx2)}",
    ".cf-status:empty{display:none}",
    ".cf-status.bad{color:#FF9A8C}",
    ".cf-acts{display:flex;flex-wrap:wrap;align-items:center;gap:12px 24px}",
    ".cf-send{padding:12px 20px;background:var(--action-bg);color:var(--action-fg);border:1px solid var(--action-bg);font:inherit;font-size:var(--fs-ui);font-weight:500;cursor:pointer}",
    ".cf-send:hover{background:var(--action-bg-hover);border-color:var(--action-bg-hover)}",
    ".cf-send[disabled]{opacity:.6;cursor:progress}",
    ".cf-cancel{padding:12px 0;background:none;border:0;color:var(--tx2);font:inherit;font-size:var(--fs-ui);cursor:pointer}",
    ".cf-cancel:hover{color:var(--tx)}",
    ".cf-done{display:grid;gap:18px;padding:28px}",
    ".cf-done p{margin:0;color:var(--tx2)}",
    "@media(max-width:520px){.cf form,.cf-done{padding:22px 18px}}"
  ].join("\n");

  var dlg, form, sendBtn, status, opened = 0, trigger = null;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (html) n.innerHTML = html;   // only ever this file's own markup, never anything typed
    return n;
  }
  function field(name) { return form.elements[name]; }
  function say(text, bad) { status.textContent = text; status.classList.toggle("bad", !!bad); }
  function flag(name, msg) {
    var f = field(name), err = document.getElementById("cf-" + name + "-err");
    f.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg || "";
  }
  function isEmpty() { return !field("name").value.trim() && !field("email").value.trim() && !field("message").value.trim(); }

  function build() {
    var style = el("style"); style.textContent = CSS; document.head.appendChild(style);
    dlg = el("dialog", { "class": "cf", "aria-labelledby": "cf-title" });
    dlg.innerHTML =
      '<form novalidate>' +
        '<div class="cf-hd"><div><h2 id="cf-title">Write to Adrian</h2><p class="cf-sub">Replies go to the address you leave.</p></div>' +
          '<button type="button" class="cf-x" aria-label="Close"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12" stroke="currentColor" stroke-width="1.6"/></svg></button></div>' +
        '<label><span>Name <b>(optional)</b></span><input name="name" autocomplete="name" maxlength="100"></label>' +
        '<label><span>Your email</span><input name="email" type="email" autocomplete="email" maxlength="200" required aria-describedby="cf-email-err"><span class="cf-err" id="cf-email-err"></span></label>' +
        '<label><span>Message</span><textarea name="message" maxlength="5000" required aria-describedby="cf-message-err"></textarea><span class="cf-err" id="cf-message-err"></span></label>' +
        '<div class="cf-trap" aria-hidden="true"><label>Company<input name="company" tabindex="-1" autocomplete="off"></label></div>' +
        '<p class="cf-status" role="status" aria-live="polite"></p>' +
        '<div class="cf-acts"><button type="submit" class="cf-send">Send message</button><button type="button" class="cf-cancel">Cancel</button></div>' +
      '</form>';
    document.body.appendChild(dlg);
    form = dlg.querySelector("form"); sendBtn = form.querySelector(".cf-send"); status = form.querySelector(".cf-status");

    dlg.querySelector(".cf-x").addEventListener("click", close);
    form.querySelector(".cf-cancel").addEventListener("click", close);
    dlg.addEventListener("click", function (e) { if (e.target === dlg && isEmpty()) close(); });
    dlg.addEventListener("close", function () { if (trigger) trigger.focus(); });
    ["email", "message"].forEach(function (n) { field(n).addEventListener("input", function () { flag(n, ""); }); });
    form.addEventListener("submit", send);
  }

  function open(e) {
    if (!dlg) build();
    trigger = e && e.currentTarget;
    if (dlg.querySelector(".cf-done")) reset();
    opened = Date.now();
    dlg.showModal();
    (isEmpty() ? field("name") : field("message")).focus();
  }
  function close() { if (dlg && dlg.open) dlg.close(); }
  function reset() {
    var done = dlg.querySelector(".cf-done");
    if (done) done.remove();
    form.hidden = false; form.reset(); say(""); flag("email", ""); flag("message", "");
    dlg.setAttribute("aria-labelledby", "cf-title");
  }

  function send(e) {
    e.preventDefault();
    var email = field("email").value.trim(), message = field("message").value.trim(), bad = null;
    if (!message) { flag("message", "Write a message first."); bad = bad || "message"; }
    if (!EMAIL.test(email)) { flag("email", "Add an email address Adrian can reply to."); bad = "email"; }
    if (bad) { field(bad).focus(); return; }

    sendBtn.disabled = true; sendBtn.textContent = "Sending…"; say("");
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: field("name").value, email: email, message: message,
        company: field("company").value, elapsed: Date.now() - opened, page: location.pathname })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok && d.ok, d: d }; });
    }).then(function (res) {
      if (res.ok) return done();
      if (res.d.field) { flag(res.d.field, res.d.error); field(res.d.field).focus(); }
      else say(res.d.error || "That did not send. Try again in a moment.", true);
    }).catch(function () {
      say("That did not send; check your connection and try again.", true);
    }).then(function () { sendBtn.disabled = false; sendBtn.textContent = "Send message"; });
  }

  function done() {
    form.hidden = true;
    var d = el("div", { "class": "cf-done" },
      '<div class="cf-hd"><h2 id="cf-sent" tabindex="-1">Sent</h2></div>' +
      '<p>Your message is on its way to Adrian.</p>' +
      '<div class="cf-acts"><button type="button" class="cf-send">Close</button></div>');
    dlg.appendChild(d);
    d.querySelector(".cf-send").addEventListener("click", close);
    dlg.setAttribute("aria-labelledby", "cf-sent");
    d.querySelector("h2").focus();
  }

  function wire() {
    var btns = document.querySelectorAll("[data-contact]");
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", open);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire); else wire();
})();
