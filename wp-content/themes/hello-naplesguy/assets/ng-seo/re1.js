/* Community pages: closing-cost quick math using Florida's published rates only. */
(function () {
  var f = document.querySelector('.s3-calc');
  if (!f) return;
  var out = f.querySelector('.s3-calc-out');
  function money(n) { return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function val(n) { var v = parseFloat(f.querySelector('[name="' + n + '"]').value || '0'); return isFinite(v) && v > 0 ? v : 0; }
  function title(liab) { // Fla. Admin. Code R. 69O-186.003; part of $100 counts as $100; $100 minimum
    if (liab <= 0) return 0;
    var r = Math.ceil(liab / 100) * 100, p = 0, prev = 0;
    var b = [[100000, 5.75], [1000000, 5.00], [5000000, 2.50], [10000000, 2.25], [Infinity, 2.00]];
    for (var i = 0; i < b.length && r > prev; i++) { var s = Math.min(r, b[i][0]) - prev; p += s / 1000 * b[i][1]; prev = b[i][0]; }
    return Math.max(p, 100);
  }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var price = val('price'), loan = val('loan');
    if (!price) { out.innerHTML = '<p class="s3-calc-note">Enter a purchase price to see the math.</p>'; return; }
    var rows = [['Deed stamp tax ($0.70 per $100 of price)', Math.ceil(price / 100) * 0.70], ['Owner\u2019s title insurance (state-set premium)', title(price)]];
    if (loan) { rows.push(['Mortgage stamp tax ($0.35 per $100 of loan)', Math.ceil(loan / 100) * 0.35]); rows.push(['Intangible tax (0.2% of loan)', loan * 0.002]); }
    var tot = 0, h = '<table><tbody>';
    rows.forEach(function (r) { tot += r[1]; h += '<tr><th scope="row">' + r[0] + '</th><td>' + money(r[1]) + '</td></tr>'; });
    h += '<tr class="tot"><th scope="row">These state items together</th><td>' + money(tot) + '</td></tr></tbody></table>';
    out.innerHTML = h;
  });
})();
