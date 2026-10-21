/* Version switcher strip shown at the very top of every demo page (review only, not part of the store) */
(function () {
  var path = location.pathname, cur = (path.match(/\/(v[23])\//) || [])[1] || '';
  var skin = /[?&]opt=[^&]*skin-2/.test(location.search) || (function () { try { return (JSON.parse(localStorage.getItem('kv-options')) || {}).skin === '2'; } catch (e) { return false; } })();
  var items = [
    ['v2', 'Version 2', 'v2/index.html'],
    ['v3c', 'Version 3 Classic', 'v3/index.html?opt=skin-1'],
    ['v3m', 'Version 3 Modern', 'v3/index.html?opt=skin-2']
  ];
  var active = cur === 'v3' ? (skin ? 'v3m' : 'v3c') : cur;
  var root = path.slice(0, path.search(/\/v[1-4]\//) + 1) || '/';
  var bar = document.createElement('nav');
  bar.setAttribute('aria-label', 'Demo versions');
  bar.style.cssText = 'position:relative;z-index:9999;display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:6px 12px;background:#111;color:#fff;font:500 13px/1.2 Poppins,system-ui,sans-serif';
  var html = '<a href="' + root + 'index.html" style="color:#fff;text-decoration:none;margin-right:8px;opacity:.75">All versions:</a>';
  items.forEach(function (it) {
    var on = it[0] === active;
    html += '<a href="' + root + it[2] + '" style="padding:5px 10px;border-radius:4px;text-decoration:none;' + (on ? 'background:#fff;color:#111;font-weight:600' : 'color:#fff;border:1px solid #555') + '"' + (on ? ' aria-current="page"' : '') + '>' + it[1] + '</a>';
  });
  bar.innerHTML = html;
  document.body.insertBefore(bar, document.body.firstChild);
})();
