/* =============================================
   PomoBorrow — Main JS
   Vanilla JS, no dependencies
   ============================================= */

(function () {
  'use strict';

  // ---- Scroll Reveal (IntersectionObserver) ----

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  // ---- Opening: trigger follow-up + scroll indicator after typing ----

  var followEl = document.getElementById('opening-follow');
  var scrollInd = document.getElementById('scroll-indicator');

  // Typing animation is 2.8s + 0.5s delay = 3.3s total
  // Show follow-up 1.5s after typing completes
  setTimeout(function () {
    if (followEl) followEl.classList.add('visible');
  }, 4800);

  setTimeout(function () {
    if (scrollInd) scrollInd.classList.add('visible');
  }, 5800);

  // ---- Hourglass Parallax ----

  var hourglassImg = document.getElementById('hourglass-img');
  var ticking = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        if (hourglassImg) {
          var rect = hourglassImg.getBoundingClientRect();
          var viewH = window.innerHeight;
          // Only parallax when image is near viewport
          if (rect.bottom > -100 && rect.top < viewH + 100) {
            var offset = (rect.top - viewH / 2) * 0.08;
            var scale = 1 + Math.max(0, Math.min(0.05, -rect.top * 0.00005));
            hourglassImg.style.transform = 'translateY(' + offset + 'px) scale(' + scale + ')';
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  // ---- Ring Segment Animation ----

  var ringObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var segments = entry.target.querySelectorAll('.ring-segment');
        segments.forEach(function (seg, i) {
          setTimeout(function () {
            seg.classList.add('visible');
          }, i * 200);
        });
        ringObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  var dayRing = document.querySelector('.day-ring');
  if (dayRing) ringObserver.observe(dayRing);

  // ---- Timeline Tooltip ----

  var tooltip = document.getElementById('timeline-tooltip');
  var timelineBlocks = document.querySelectorAll('.timeline-block');

  timelineBlocks.forEach(function (block) {
    block.addEventListener('mouseenter', function (e) {
      var activity = block.dataset.activity;
      var start = block.dataset.start;
      var end = block.dataset.end;
      var detail = block.dataset.detail;

      tooltip.innerHTML =
        '<div class="tooltip-activity">' + activity + '</div>' +
        '<div class="tooltip-time">' + start + ' – ' + end + '</div>' +
        '<div class="tooltip-detail">' + detail + '</div>';
      tooltip.classList.add('active');
    });

    block.addEventListener('mousemove', function (e) {
      var x = e.clientX + 16;
      var y = e.clientY - 10;

      // Keep tooltip in viewport
      var tw = tooltip.offsetWidth;
      if (x + tw > window.innerWidth - 16) {
        x = e.clientX - tw - 16;
      }

      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    });

    block.addEventListener('mouseleave', function () {
      tooltip.classList.remove('active');
    });
  });

  // Touch support for timeline
  timelineBlocks.forEach(function (block) {
    block.addEventListener('touchstart', function (e) {
      // Remove active from all
      timelineBlocks.forEach(function (b) { b.style.filter = ''; });
      block.style.filter = 'brightness(1.3)';

      var activity = block.dataset.activity;
      var start = block.dataset.start;
      var end = block.dataset.end;
      var detail = block.dataset.detail;

      tooltip.innerHTML =
        '<div class="tooltip-activity">' + activity + '</div>' +
        '<div class="tooltip-time">' + start + ' – ' + end + '</div>' +
        '<div class="tooltip-detail">' + detail + '</div>';
      tooltip.classList.add('active');

      var rect = block.getBoundingClientRect();
      tooltip.style.left = rect.left + 'px';
      tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
    }, { passive: true });
  });

  document.addEventListener('touchstart', function (e) {
    if (!e.target.closest('.timeline')) {
      tooltip.classList.remove('active');
      timelineBlocks.forEach(function (b) { b.style.filter = ''; });
    }
  }, { passive: true });

  // ---- Waitlist Form ----

  var form = document.getElementById('waitlist-form');
  var successMsg = document.getElementById('waitlist-success');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // In production, this would POST to an API
      form.style.display = 'none';
      if (successMsg) successMsg.classList.add('show');
    });
  }

})();
