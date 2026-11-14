(function () {
  var cost = document.getElementById('ng-cost-form');
  if (cost) {
    cost.addEventListener('submit', function (e) {
      e.preventDefault();
      var income = Number(document.getElementById('ng-income').value || 0);
      var benefits = Number(document.getElementById('ng-benefits').value || 0);
      var savings = Number(document.getElementById('ng-savings').value || 0);
      var median = 5610;
      var monthly = income + benefits;
      var gap = median - monthly;
      var out = document.getElementById('ng-cost-out');
      var money = function (n) {
        return '$' + Math.round(n).toLocaleString('en-US');
      };
      var html = '<p>Florida’s 2025 median assisted living cost is <strong>$5,610 a month</strong>. The numbers you entered stay on this device.</p>';
      html += '<p>Monthly income plus benefits already going toward care: <strong>' + money(monthly) + '</strong>.</p>';
      if (gap > 0) {
        html += '<p>Compared with that median, there is a monthly gap of <strong>' + money(gap) + '</strong>.</p>';
        if (savings > 0) {
          var months = Math.floor(savings / gap);
          html += '<p>At that gap, the savings you entered would cover about <strong>' + months + '</strong> month' + (months === 1 ? '' : 's') + ' of the difference. Local fees can be higher or lower, because each provider sets its own rates.</p>';
        }
        html += '<p>You may want to <a href="' + (cost.getAttribute('data-medicaid') || '/senior-care/medicaid/') + '">check Florida Medicaid</a> or <a href="' + (cost.getAttribute('data-veterans') || '/senior-care/veterans/') + '">VA long-term care benefits</a>. This is not an eligibility decision.</p>';
      } else {
        html += '<p>The monthly amount you entered meets or is above that 2025 Florida median. Local communities still set their own fees, so ask for a current written rate.</p>';
        html += '<p>Even so, some families still review <a href="' + (cost.getAttribute('data-medicaid') || '/senior-care/medicaid/') + '">Florida Medicaid</a> or <a href="' + (cost.getAttribute('data-veterans') || '/senior-care/veterans/') + '">VA benefits</a>.</p>';
      }
      out.innerHTML = html;
      out.hidden = false;
    });
  }

  var time = document.getElementById('ng-time-form');
  if (time) {
    time.addEventListener('submit', function (e) {
      e.preventDefault();
      var count = time.querySelectorAll('input[name="sign"]:checked').length;
      var out = document.getElementById('ng-time-out');
      var html = '';
      if (count === 0) {
        html = '<p>You did not check any of the official signs on this list. Not every day looks the same. If you are unsure, talk with the older adult, and call Jeff or start with <a href="/senior-care/where-to-start/">Where to Start</a>. This checklist is not a diagnosis.</p>';
      } else {
        html = '<p>You noticed ' + count + ' of the signs the National Institute on Aging describes. That can be a reason to look more closely. This is not a diagnosis, and it does not decide what kind of care someone needs.</p>';
        html += '<p>A gentle next step is to talk with the older adult, a doctor if you have one, and Jeff. You can also open <a href="/senior-care/where-to-start/">Your first 7 days</a> or call <a href="tel:6095758626">609-575-8626</a>.</p>';
      }
      out.innerHTML = html;
      out.hidden = false;
    });
  }

  var quiz = document.getElementById('ng-quiz-form');
  if (quiz) {
    quiz.addEventListener('submit', function (e) {
      e.preventDefault();
      var picked = quiz.querySelector('input[name="need"]:checked');
      var out = document.getElementById('ng-quiz-out');
      if (!picked) {
        out.innerHTML = '<p>Please choose one option.</p>';
        out.hidden = false;
        return;
      }
      var map = {
        none: { url: quiz.getAttribute('data-il') || '/senior-care/independent-living/', label: 'Independent Living' },
        daily: { url: quiz.getAttribute('data-al') || '/senior-care/assisted-living/what-assisted-living-is/', label: 'What Assisted Living Is' },
        memory: { url: quiz.getAttribute('data-mem') || '/senior-care/memory-care/', label: 'Memory Care' },
        home: { url: quiz.getAttribute('data-home') || '/senior-care/home-care/', label: 'Home Care' },
        rehab: { url: quiz.getAttribute('data-snf') || '/senior-care/hospital-discharge/', label: 'Hospital Discharge and skilled nursing' }
      };
      var go = map[picked.value];
      out.innerHTML = '<p>Based on what you selected, a good official starting page is <a href="' + go.url + '">' + go.label + '</a>. This is not a medical or financial assessment. Call Jeff if you want to talk it through.</p>';
      out.hidden = false;
    });
  }
})();
