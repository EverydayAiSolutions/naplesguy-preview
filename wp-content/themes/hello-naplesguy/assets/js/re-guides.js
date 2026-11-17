(function () {
  var form = document.getElementById('ng-re-calc');
  if (!form) return;
  var out = document.getElementById('ng-re-calc-out');
  function num(id) {
    var v = parseFloat(form.querySelector('[name="'+id+'"]').value || '0');
    return isFinite(v) && v >= 0 ? v : 0;
  }
  function money(n) {
    return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function units100(amount) {
    return Math.ceil(amount / 100);
  }
  function titleOriginal(liability) {
    if (liability <= 0) return 0;
    // Fla. Admin. Code R. 69O-186.003: fraction of $100 counts as a full $100.
    var rounded = Math.ceil(liability / 100) * 100;
    var premium = 0;
    var remaining = rounded;
    var bands = [
      { cap: 100000, rate: 5.75 },
      { cap: 1000000, rate: 5.00 },
      { cap: 5000000, rate: 2.50 },
      { cap: 10000000, rate: 2.25 },
      { cap: Infinity, rate: 2.00 }
    ];
    var prev = 0;
    for (var i = 0; i < bands.length && remaining > 0; i++) {
      var slice = Math.min(remaining, bands[i].cap - prev);
      premium += (slice / 1000) * bands[i].rate;
      remaining -= slice;
      prev = bands[i].cap;
    }
    return Math.max(premium, 100);
  }
  function run(e) {
    if (e) e.preventDefault();
    var price = num('price');
    var loan = num('loan');
    var deedPages = Math.max(1, Math.floor(num('deed_pages')) || 1);
    var mtgPages = Math.max(1, Math.floor(num('mtg_pages')) || 1);
    var deedStamps = units100(price) * 0.70;
    var mtgStamps = loan > 0 ? units100(loan) * 0.35 : 0;
    var intangible = loan * 0.002;
    var ownerTitle = titleOriginal(price);
    var deedRec = 10 + Math.max(0, deedPages - 1) * 8.5;
    var mtgRec = loan > 0 ? (10 + Math.max(0, mtgPages - 1) * 8.5) : 0;
    var rows = [
      ['Documentary stamp tax on the deed (s. 201.02: $0.70 per $100 or fraction of consideration)', deedStamps],
      ['Documentary stamp tax on a recorded mortgage (s. 201.08: $0.35 per $100 or fraction of the amount secured; no cap on the recorded mortgage)', mtgStamps],
      ['Nonrecurring intangible tax (s. 199.133: 2 mills, which is $2 per $1,000 of the secured obligation)', intangible],
      ['Owner’s title insurance, original promulgated risk premium (Rule 69O-186.003; $100 minimum)', ownerTitle],
      ['Collier Clerk recording fee for the deed ($10 first page + $8.50 each additional page, as posted)', deedRec],
      ['Collier Clerk recording fee for the mortgage (same posted page rate; $0 if no loan)', mtgRec]
    ];
    var total = 0;
    var html = '<table class="g-compare"><caption>Example calculation — not a quote</caption><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      total += r[1];
      html += '<tr><td>' + r[0] + '</td><td>' + money(r[1]) + '</td></tr>';
    });
    html += '<tr><th>Subtotal of these sourced items</th><th>' + money(total) + '</th></tr></tbody></table>';
    html += '<p>This subtotal is only the state taxes, the promulgated owner’s title risk premium, and Collier recording fees you entered. It does not include lender fees, owner’s title endorsements, a lender’s title policy (a simultaneously issued lender policy has a $25 minimum promulgated risk premium under the same rule, and title agencies may also charge for other services), survey, HOA or condo estoppel fees, prepaid insurance or taxes, or commissions. Those vary. Who pays each item is set in your contract, not by this calculator. Nothing you type is stored.</p>';
    out.innerHTML = html;
    out.hidden = false;
  }
  form.addEventListener('submit', run);
  form.querySelector('[type="reset"]').addEventListener('click', function () {
    out.hidden = true;
    out.innerHTML = '';
  });
})();

(function () {
  var form = document.getElementById('ng-sell-calc');
  if (!form) return;
  var out = document.getElementById('ng-sell-calc-out');
  function num(name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return 0;
    var v = parseFloat(el.value || '0');
    return isFinite(v) && v >= 0 ? v : 0;
  }
  function checked(name) {
    var el = form.querySelector('[name="' + name + '"]');
    return !!(el && el.checked);
  }
  function money(n) {
    var sign = n < 0 ? '-' : '';
    return sign + '$' + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function units100(amount) {
    return Math.ceil(amount / 100);
  }
  function titleOriginal(liability) {
    if (liability <= 0) return 0;
    var rounded = Math.ceil(liability / 100) * 100;
    var premium = 0;
    var remaining = rounded;
    var bands = [
      { cap: 100000, rate: 5.75 },
      { cap: 1000000, rate: 5.00 },
      { cap: 5000000, rate: 2.50 },
      { cap: 10000000, rate: 2.25 },
      { cap: Infinity, rate: 2.00 }
    ];
    var prev = 0;
    for (var i = 0; i < bands.length && remaining > 0; i++) {
      var slice = Math.min(remaining, bands[i].cap - prev);
      premium += (slice / 1000) * bands[i].rate;
      remaining -= slice;
      prev = bands[i].cap;
    }
    return Math.max(premium, 100);
  }
  function daysInYear(y) {
    return ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) ? 366 : 365;
  }
  function dayOfYear(d) {
    var start = Date.UTC(d.getUTCFullYear(), 0, 1);
    return Math.floor((d.getTime() - start) / 86400000) + 1;
  }
  function run(e) {
    if (e) e.preventDefault();
    var price = num('price');
    var payoff = num('payoff');
    var annualTax = num('annual_tax');
    var estoppel = num('estoppel');
    var deedPages = Math.max(1, Math.floor(num('deed_pages')) || 1);
    var stamps = checked('pay_stamps') ? units100(price) * 0.70 : 0;
    var title = checked('pay_title') ? titleOriginal(price) : 0;
    var recording = checked('pay_recording') ? (10 + Math.max(0, deedPages - 1) * 8.5) : 0;
    var proration = 0;
    var prorationNote = '';
    var closeEl = form.querySelector('[name="close_date"]');
    var closeVal = closeEl ? closeEl.value : '';
    if (annualTax > 0 && closeVal) {
      var parts = closeVal.split('-');
      if (parts.length === 3) {
        var close = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
        if (!isNaN(close.getTime())) {
          var y = close.getUTCFullYear();
          var diy = daysInYear(y);
          var sellerDays = Math.max(0, dayOfYear(close) - 1);
          proration = annualTax * (sellerDays / diy);
          prorationNote = ' (' + sellerDays + ' of ' + diy + ' days in ' + y + ', through the day before closing)';
        }
      }
    }
    var costs = stamps + title + recording + proration + estoppel;
    var net = price - payoff - costs;
    var rows = [
      ['Sale price', price],
      ['Minus mortgage payoff', payoff ? -payoff : 0]
    ];
    if (checked('pay_stamps')) {
      rows.push(['Documentary stamp tax on the deed ($0.70 per $100 or fraction)', -stamps]);
    }
    if (checked('pay_title')) {
      rows.push(['Owner’s title insurance (promulgated risk premium; $100 minimum)', -title]);
    }
    if (checked('pay_recording')) {
      rows.push(['Collier Clerk deed recording fee ($10 first page + $8.50 each added page)', -recording]);
    }
    if (proration > 0) {
      rows.push(['Calendar-year tax proration' + prorationNote, -proration]);
    } else if (annualTax > 0 && !closeVal) {
      rows.push(['Property-tax proration (enter a closing date to estimate)', 0]);
    }
    if (estoppel > 0) {
      rows.push(['HOA or condo estoppel fee (amount you entered; compare with the official DBPR cap)', -estoppel]);
    }
    var html = '<table class="g-compare"><caption>Example only — not a quote</caption><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr><td>' + r[0] + '</td><td>' + money(r[1]) + '</td></tr>';
    });
    html += '<tr><th>Estimated walk-away from these items</th><th>' + money(net) + '</th></tr></tbody></table>';
    html += '<p>This estimate is only the sale price, the payoff you entered, and the official-rate items you checked, plus any tax proration example and estoppel amount you typed. It does not include commissions, seller credits, repair credits, title endorsements, survey costs, or other contract charges. Who pays deed stamps and owner’s title insurance is set in your contract. Nothing you type is stored.</p>';
    out.innerHTML = html;
    out.hidden = false;
  }
  form.addEventListener('submit', run);
  var reset = form.querySelector('[type="reset"]');
  if (reset) {
    reset.addEventListener('click', function () {
      out.hidden = true;
      out.innerHTML = '';
    });
  }
})();
