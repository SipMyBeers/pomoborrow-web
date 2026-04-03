/* ============================================
   POMOBORROW — Interactive Demo Ring (SVG)
   ============================================ */

(function () {
  'use strict';

  var container = document.getElementById('demo-ring-container');
  if (!container) return;

  // Activity data for a sample day
  var activities = [
    { name: 'Sleep',    startHour: 0,  endHour: 6,  color: '#1E3A5F', glow: 'rgba(30, 58, 95, 0.4)' },
    { name: 'Commute',  startHour: 6,  endHour: 7,  color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)' },
    { name: 'Work',     startHour: 7,  endHour: 12, color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)' },
    { name: 'Lunch',    startHour: 12, endHour: 13, color: '#FBBF24', glow: 'rgba(251, 191, 36, 0.4)' },
    { name: 'Work',     startHour: 13, endHour: 17, color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)' },
    { name: 'Gym',      startHour: 17, endHour: 19, color: '#F97316', glow: 'rgba(249, 115, 22, 0.4)' },
    { name: 'Leisure',  startHour: 19, endHour: 23, color: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
    { name: 'Sleep',    startHour: 23, endHour: 24, color: '#1E3A5F', glow: 'rgba(30, 58, 95, 0.4)' },
  ];

  var size = 440;
  var cx = size / 2;
  var cy = size / 2;
  var outerR = 190;
  var innerR = 130;
  var needleR = 195;

  // Create SVG
  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('id', 'demo-ring');
  svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  // Defs for filters
  var defs = document.createElementNS(svgNS, 'defs');

  // Glow filter
  var filter = document.createElementNS(svgNS, 'filter');
  filter.setAttribute('id', 'glow');
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');
  var blur = document.createElementNS(svgNS, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '3');
  blur.setAttribute('result', 'glow');
  filter.appendChild(blur);
  var merge = document.createElementNS(svgNS, 'feMerge');
  var mn1 = document.createElementNS(svgNS, 'feMergeNode');
  mn1.setAttribute('in', 'glow');
  var mn2 = document.createElementNS(svgNS, 'feMergeNode');
  mn2.setAttribute('in', 'SourceGraphic');
  merge.appendChild(mn1);
  merge.appendChild(mn2);
  filter.appendChild(merge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  // Helper: angle from hour (0h = top, clockwise)
  function hourToAngle(h) {
    return ((h / 24) * 360 - 90) * (Math.PI / 180);
  }

  // Helper: describe arc path
  function arcPath(cx, cy, r, startAngle, endAngle) {
    var x1 = cx + r * Math.cos(startAngle);
    var y1 = cy + r * Math.sin(startAngle);
    var x2 = cx + r * Math.cos(endAngle);
    var y2 = cy + r * Math.sin(endAngle);
    var diff = endAngle - startAngle;
    var largeArc = diff > Math.PI ? 1 : 0;
    return 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2;
  }

  // Helper: ring segment path (annular sector)
  function sectorPath(cx, cy, outerR, innerR, startAngle, endAngle) {
    var ox1 = cx + outerR * Math.cos(startAngle);
    var oy1 = cy + outerR * Math.sin(startAngle);
    var ox2 = cx + outerR * Math.cos(endAngle);
    var oy2 = cy + outerR * Math.sin(endAngle);
    var ix1 = cx + innerR * Math.cos(endAngle);
    var iy1 = cy + innerR * Math.sin(endAngle);
    var ix2 = cx + innerR * Math.cos(startAngle);
    var iy2 = cy + innerR * Math.sin(startAngle);
    var diff = endAngle - startAngle;
    var largeArc = diff > Math.PI ? 1 : 0;
    return 'M ' + ox1 + ' ' + oy1 +
           ' A ' + outerR + ' ' + outerR + ' 0 ' + largeArc + ' 1 ' + ox2 + ' ' + oy2 +
           ' L ' + ix1 + ' ' + iy1 +
           ' A ' + innerR + ' ' + innerR + ' 0 ' + largeArc + ' 0 ' + ix2 + ' ' + iy2 +
           ' Z';
  }

  // Background circle
  var bgCircle = document.createElementNS(svgNS, 'circle');
  bgCircle.setAttribute('cx', cx);
  bgCircle.setAttribute('cy', cy);
  bgCircle.setAttribute('r', outerR + 10);
  bgCircle.setAttribute('fill', 'none');
  bgCircle.setAttribute('stroke', '#111');
  bgCircle.setAttribute('stroke-width', '1');
  svg.appendChild(bgCircle);

  // Inner circle
  var innerCircle = document.createElementNS(svgNS, 'circle');
  innerCircle.setAttribute('cx', cx);
  innerCircle.setAttribute('cy', cy);
  innerCircle.setAttribute('r', innerR - 5);
  innerCircle.setAttribute('fill', 'none');
  innerCircle.setAttribute('stroke', '#111');
  innerCircle.setAttribute('stroke-width', '1');
  svg.appendChild(innerCircle);

  // Draw segments
  var segmentPaths = [];
  activities.forEach(function (act, i) {
    var startAngle = hourToAngle(act.startHour);
    var endAngle = hourToAngle(act.endHour);

    var gap = 0.01; // tiny gap between segments
    var path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', sectorPath(cx, cy, outerR, innerR, startAngle + gap, endAngle - gap));
    path.setAttribute('fill', act.color);
    path.setAttribute('filter', 'url(#glow)');
    path.setAttribute('opacity', '0.85');
    path.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    path.style.transformOrigin = cx + 'px ' + cy + 'px';
    path.style.cursor = 'pointer';
    path.dataset.index = i;
    svg.appendChild(path);
    segmentPaths.push(path);
  });

  // Hour ticks
  for (var h = 0; h < 24; h++) {
    var angle = hourToAngle(h);
    var tickOuter = outerR + 6;
    var tickInner = outerR + 2;
    var line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', cx + tickInner * Math.cos(angle));
    line.setAttribute('y1', cy + tickInner * Math.sin(angle));
    line.setAttribute('x2', cx + tickOuter * Math.cos(angle));
    line.setAttribute('y2', cy + tickOuter * Math.sin(angle));
    line.setAttribute('stroke', '#333');
    line.setAttribute('stroke-width', h % 6 === 0 ? '2' : '1');
    svg.appendChild(line);

    // Labels for major hours
    if (h % 6 === 0) {
      var labelR = outerR + 20;
      var text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', cx + labelR * Math.cos(angle));
      text.setAttribute('y', cy + labelR * Math.sin(angle));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('fill', '#555');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-family', '-apple-system, system-ui, sans-serif');
      var hourLabel = h === 0 ? '12a' : h === 6 ? '6a' : h === 12 ? '12p' : '6p';
      text.textContent = hourLabel;
      svg.appendChild(text);
    }
  }

  // Center text
  var centerText = document.createElementNS(svgNS, 'text');
  centerText.setAttribute('x', cx);
  centerText.setAttribute('y', cy - 12);
  centerText.setAttribute('text-anchor', 'middle');
  centerText.setAttribute('fill', '#fff');
  centerText.setAttribute('font-size', '18');
  centerText.setAttribute('font-weight', '600');
  centerText.setAttribute('font-family', '-apple-system, system-ui, sans-serif');
  centerText.textContent = 'TODAY';
  svg.appendChild(centerText);

  var centerSub = document.createElementNS(svgNS, 'text');
  centerSub.setAttribute('x', cx);
  centerSub.setAttribute('y', cy + 12);
  centerSub.setAttribute('text-anchor', 'middle');
  centerSub.setAttribute('fill', '#666');
  centerSub.setAttribute('font-size', '12');
  centerSub.setAttribute('font-family', '-apple-system, system-ui, sans-serif');
  centerSub.textContent = 'Hover to explore';
  svg.appendChild(centerSub);

  // Needle
  var needleGroup = document.createElementNS(svgNS, 'g');
  var needleLine = document.createElementNS(svgNS, 'line');
  needleLine.setAttribute('x1', cx);
  needleLine.setAttribute('y1', cy);
  needleLine.setAttribute('stroke', '#fff');
  needleLine.setAttribute('stroke-width', '2');
  needleLine.setAttribute('stroke-linecap', 'round');
  needleLine.setAttribute('opacity', '0.8');
  needleGroup.appendChild(needleLine);

  var needleDot = document.createElementNS(svgNS, 'circle');
  needleDot.setAttribute('cx', cx);
  needleDot.setAttribute('cy', cy);
  needleDot.setAttribute('r', '4');
  needleDot.setAttribute('fill', '#fff');
  needleGroup.appendChild(needleDot);
  svg.appendChild(needleGroup);

  // Set needle to current simulated time (2pm for demo)
  var currentHour = 14;
  function setNeedle(hour) {
    var angle = hourToAngle(hour);
    needleLine.setAttribute('x2', cx + needleR * Math.cos(angle));
    needleLine.setAttribute('y2', cy + needleR * Math.sin(angle));
  }
  setNeedle(currentHour);

  // Animate needle slowly
  var needleHour = currentHour;
  function animateNeedle() {
    needleHour += 0.0002;
    if (needleHour >= 24) needleHour = 0;
    if (!isDragging) setNeedle(needleHour);
    requestAnimationFrame(animateNeedle);
  }
  animateNeedle();

  container.appendChild(svg);

  // Tooltip
  var tooltip = document.querySelector('.demo-tooltip');
  var tooltipActivity = tooltip ? tooltip.querySelector('.tooltip-activity') : null;
  var tooltipTime = tooltip ? tooltip.querySelector('.tooltip-time') : null;
  var tooltipDuration = tooltip ? tooltip.querySelector('.tooltip-duration') : null;

  function formatHour(h) {
    if (h === 0 || h === 24) return '12:00 AM';
    if (h === 12) return '12:00 PM';
    if (h < 12) return h + ':00 AM';
    return (h - 12) + ':00 PM';
  }

  function showTooltip(act, x, y) {
    if (!tooltip) return;
    tooltipActivity.textContent = act.name;
    tooltipTime.textContent = formatHour(act.startHour) + ' - ' + formatHour(act.endHour);
    tooltipDuration.textContent = (act.endHour - act.startHour) + 'h';
    tooltip.classList.add('active');

    var rect = container.getBoundingClientRect();
    tooltip.style.left = (x - rect.left + 15) + 'px';
    tooltip.style.top = (y - rect.top - 30) + 'px';
  }

  function hideTooltip() {
    if (tooltip) tooltip.classList.remove('active');
  }

  // Hover interactions
  segmentPaths.forEach(function (path, i) {
    path.addEventListener('mouseenter', function (e) {
      path.setAttribute('opacity', '1');
      showTooltip(activities[i], e.clientX, e.clientY);
      // Update center text
      centerText.textContent = activities[i].name;
      centerSub.textContent = (activities[i].endHour - activities[i].startHour) + ' hours';
      // Highlight timeline segment
      highlightTimeline(i);
    });

    path.addEventListener('mousemove', function (e) {
      showTooltip(activities[i], e.clientX, e.clientY);
    });

    path.addEventListener('mouseleave', function () {
      path.setAttribute('opacity', '0.85');
      hideTooltip();
      centerText.textContent = 'TODAY';
      centerSub.textContent = 'Hover to explore';
      highlightTimeline(-1);
    });
  });

  // Drag to scrub
  var isDragging = false;

  svg.addEventListener('mousedown', function (e) {
    isDragging = true;
    scrubTo(e);
  });

  document.addEventListener('mousemove', function (e) {
    if (isDragging) scrubTo(e);
  });

  document.addEventListener('mouseup', function () {
    isDragging = false;
  });

  // Touch support
  svg.addEventListener('touchstart', function (e) {
    isDragging = true;
    scrubTo(e.touches[0]);
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', function (e) {
    if (isDragging) scrubTo(e.touches[0]);
  });

  document.addEventListener('touchend', function () {
    isDragging = false;
  });

  function scrubTo(e) {
    var rect = svg.getBoundingClientRect();
    var x = e.clientX - rect.left - rect.width / 2;
    var y = e.clientY - rect.top - rect.height / 2;
    var angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;
    var hour = (angle / (Math.PI * 2)) * 24;
    needleHour = hour;
    setNeedle(hour);

    // Find which activity
    for (var i = 0; i < activities.length; i++) {
      if (hour >= activities[i].startHour && hour < activities[i].endHour) {
        centerText.textContent = activities[i].name;
        centerSub.textContent = formatHour(Math.floor(hour));
        highlightTimeline(i);
        break;
      }
    }
  }

  // Timeline bar interaction
  function highlightTimeline(activeIndex) {
    var timelineSegments = document.querySelectorAll('.timeline-segment');
    timelineSegments.forEach(function (seg, i) {
      seg.style.opacity = activeIndex === -1 ? '1' : (i === activeIndex ? '1' : '0.3');
    });
  }

  // Build timeline bar
  var timelineBar = document.querySelector('.timeline-bar');
  if (timelineBar) {
    activities.forEach(function (act) {
      var seg = document.createElement('div');
      seg.className = 'timeline-segment';
      var pct = ((act.endHour - act.startHour) / 24) * 100;
      seg.style.flex = '0 0 ' + pct + '%';
      seg.style.background = act.color;
      timelineBar.appendChild(seg);
    });
  }
})();
