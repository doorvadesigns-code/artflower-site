/*
 * Small runtime that replaces the Framer bundle for this static export.
 * Handles: scroll/appear reveals, the header menu, contact link,
 * home card hover labels, and the posters lightbox.
 */
(function () {
  'use strict';

  var root = document.querySelector('script[src$="assets/site.js"]').getAttribute('src').replace('assets/site.js', '');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function visible(el) {
    return el.offsetParent !== null || getComputedStyle(el).position === 'fixed';
  }

  /* ---------- Reveal animations ---------- */

  // Elements Framer leaves at opacity 0 that are meant to stay hidden.
  function keepHidden(el) {
    if (el.closest('[data-framer-name="Expanded text"], [data-framer-name="Label Measure"]')) return true;
    if (el.closest('.framer-pointer-events-none, .framer-QolSI')) return true;
    var s = el.getAttribute('style') || '';
    if (/inset:0/.test(s) && /pointer-events:none/.test(s)) return true; // poster hover overlays
    if (el.querySelector(':scope > button')) return true; // empty poster filter row
    return false;
  }

  var hidden = Array.prototype.filter.call(document.querySelectorAll('[style*="opacity:0"]'), function (el) {
    var o = parseFloat(el.style.opacity);
    return o < 0.01 && !keepHidden(el);
  });

  function show(el, delay) {
    if (!el.style.transition) {
      el.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), filter 0.8s ease';
    }
    if (delay) el.style.transitionDelay = delay + 's';
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.filter = 'none';
  }

  // Letter-by-letter title effect: stagger the spans inside each parent.
  var letterIndex = new Map();
  function letterDelay(el) {
    if (!/blur/.test(el.getAttribute('style') || '')) return 0;
    var parent = el.closest('h1, h2, h3, p, [data-framer-component-type="RichTextContainer"]') || el.parentElement;
    var i = letterIndex.get(parent) || 0;
    letterIndex.set(parent, i + 1);
    return i * 0.03;
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    hidden.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none'; });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        show(entry.target, letterDelay(entry.target));
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    requestAnimationFrame(function () {
      hidden.forEach(function (el) {
        if (el.matches('[data-framer-appear-id]')) show(el, 0.1); // header etc. animate on load
        else io.observe(el);
      });
    });
  }

  /* ---------- Header menu ---------- */

  function textIs(el, word) {
    return el.textContent.replace(/[\s-]/g, '').toLowerCase() === word;
  }

  document.querySelectorAll('nav').forEach(function (nav) {
    var menuText = Array.prototype.find.call(nav.querySelectorAll('p'), function (p) { return textIs(p, 'menu'); });
    var contactText = Array.prototype.find.call(nav.querySelectorAll('p'), function (p) { return textIs(p, 'contact'); });
    var row = nav.querySelector('[data-framer-name="Row 1"]') || nav.firstElementChild;

    if (contactText) {
      var c = contactText.closest('[data-framer-component-type="RichTextContainer"]') || contactText;
      c.style.cursor = 'pointer';
      c.addEventListener('click', function () {
        var footer = Array.prototype.find.call(document.querySelectorAll('p, h1, h2, h3, h4'), function (el) {
          return /have a project in mind/i.test(el.textContent) && visible(el);
        });
        if (footer) footer.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        else location.href = 'mailto:artflovver@gmail.com';
      });
    }

    if (!menuText || !row) return;
    var trigger = menuText.closest('[data-framer-component-type="RichTextContainer"]') || menuText;
    var preset = menuText.className;
    var color = getComputedStyle(menuText).color;
    var bg = getComputedStyle(nav).backgroundColor;
    if (!bg || bg === 'rgba(0, 0, 0, 0)') bg = getComputedStyle(document.body).backgroundColor;

    var panel = document.createElement('div');
    panel.className = 'framer-sfhsjj af-menu';
    panel.style.backgroundColor = bg;
    [['art projects', 'art-projects/'], ['cv', 'cv/']].forEach(function (item) {
      var wrap = document.createElement('div');
      wrap.className = 'framer-lgpgs8';
      wrap.setAttribute('data-framer-component-type', 'RichTextContainer');
      var p = document.createElement('p');
      p.className = preset;
      p.style.color = color;
      var a = document.createElement('a');
      a.href = root + item[1];
      a.textContent = item[0];
      a.style.color = 'inherit';
      p.appendChild(a);
      wrap.appendChild(p);
      panel.appendChild(wrap);
    });
    row.parentNode.insertBefore(panel, row.nextSibling);

    var label = menuText.innerHTML;
    trigger.style.cursor = 'pointer';
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-expanded', 'false');
    function setOpen(open) {
      // Sit the panel right under the header row, ~30px above where the label baseline ends.
      var t = trigger.getBoundingClientRect(), n = nav.getBoundingClientRect();
      panel.style.top = (t.bottom - n.top + 8) + 'px';
      panel.style.left = (t.left - n.left - parseFloat(getComputedStyle(panel).paddingLeft)) + 'px';
      panel.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
      menuText.innerHTML = open ? ' - ' + label : label;
    }
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!panel.classList.contains('is-open'));
    });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger.click(); }
    });
    document.addEventListener('click', function (e) { if (!panel.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  });

  /* ---------- Home card hover labels (desktop) ---------- */

  var cardLabels = {
    'soma/': 'SOMA',
    'posters/': 'POSTER COLLECTION',
    'social-media/': 'SOCIAL MEDIA',
    'marta/': 'MARTA',
    'art-projects/': 'ART PORTFOLIO'
  };
  document.querySelectorAll('a[data-framer-name="Variant 1"].framer-J4CYv').forEach(function (a) {
    var key = a.getAttribute('href').replace(root, '');
    if (!cardLabels[key] || a.querySelector('.af-pill')) return;
    var pill = document.createElement('div');
    pill.className = 'framer-128pxs7 af-pill';
    pill.innerHTML = '<div class="framer-1fu3eor" data-framer-component-type="RichTextContainer">' +
      '<p class="framer-text framer-styles-preset-qznm67" dir="auto"></p></div>';
    pill.querySelector('p').textContent = cardLabels[key];
    var arrow = document.createElement('div');
    arrow.className = 'framer-4msno8 af-pill af-arrow';
    arrow.innerHTML = '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><path d="M5 2l5 5-5 5" fill="none" stroke="rgba(255,255,255,0.78)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    a.appendChild(pill);
    a.appendChild(arrow);
  });

  /* ---------- Custom cursor dot ---------- */

  if (document.querySelector('[data-framer-cursor]') && window.matchMedia('(pointer: fine)').matches) {
    var dot = document.createElement('div');
    dot.className = 'af-cursor';
    document.body.appendChild(dot);
    window.addEventListener('mousemove', function (e) {
      dot.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      dot.classList.add('is-on');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { dot.classList.remove('is-on'); });
  }

  /* ---------- Slideshows (auto-advance every 2s, endless loop, dot nav) ---------- */

  document.querySelectorAll('section.framer-slideshow').forEach(function (section) {
    var ul = section.querySelector('ul');
    if (!ul) return;
    var slides = Array.prototype.slice.call(ul.children);
    var count = slides.length;
    if (count < 2) return;
    var gap = parseFloat(ul.style.gap) || 0;
    ul.appendChild(slides[0].cloneNode(true)); // lets the last slide roll forward into the first
    var dotsBar = section.querySelector('.framer--slideshow-controls > div:nth-child(2)');
    var dots = dotsBar ? Array.prototype.slice.call(dotsBar.querySelectorAll('button')) : [];
    var index = 0;
    var timer = null;

    function place(i, animate) {
      ul.style.transition = animate ? 'transform 0.6s cubic-bezier(0.44, 0, 0.56, 1)' : 'none';
      ul.style.transform = 'translateX(calc(' + (-i) + ' * (100% + ' + gap + 'px)))';
      dots.forEach(function (d, k) {
        var pip = d.firstElementChild;
        if (pip) pip.style.opacity = k === i % count ? '0.8' : '0.3';
      });
    }
    function go(i) {
      index = i;
      place(index, true);
    }
    ul.addEventListener('transitionend', function (e) {
      if (e.target === ul && index >= count) { index = 0; place(0, false); }
    });
    function start() {
      if (reduceMotion || timer) return;
      timer = setInterval(function () { go(index + 1); }, 2000);
    }
    function stop() { clearInterval(timer); timer = null; }

    if (dotsBar) {
      dotsBar.style.opacity = '1';
      dotsBar.style.pointerEvents = 'auto';
      dots.forEach(function (d, k) {
        d.disabled = false;
        d.addEventListener('click', function () { stop(); go(k); start(); });
      });
    }
    place(0, false);
    // Only run while on screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting && visible(section) ? start() : stop();
      }).observe(section);
    } else {
      start();
    }
  });

  /* ---------- Posters lightbox ---------- */

  var cards = Array.prototype.filter.call(
    document.querySelectorAll('div[style*="cursor:pointer"][style*="break-inside"]'),
    function (el) { return el.querySelector('img'); }
  );
  if (cards.length) {
    var box = document.createElement('div');
    box.className = 'af-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<button class="af-lb-close" aria-label="Close">&times;</button>' +
      '<button class="af-lb-prev" aria-label="Previous">&#8249;</button>' +
      '<img alt="">' +
      '<button class="af-lb-next" aria-label="Next">&#8250;</button>' +
      '<div class="af-lb-count"></div>';
    document.body.appendChild(box);
    var img = box.querySelector('img');
    var count = box.querySelector('.af-lb-count');
    var list = [];
    var index = 0;

    function render() {
      var src = list[index].querySelector('img');
      img.src = src.currentSrc || src.src;
      count.textContent = (index + 1) + ' / ' + list.length;
    }
    function open(card) {
      list = cards.filter(visible);
      index = Math.max(0, list.indexOf(card));
      render();
      box.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden';
    }
    function close() {
      box.classList.remove('is-open');
      document.documentElement.style.overflow = '';
    }
    function step(d) { index = (index + d + list.length) % list.length; render(); }

    cards.forEach(function (card) {
      card.classList.add('af-poster');
      card.addEventListener('click', function () { open(card); });
    });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    box.querySelector('.af-lb-close').addEventListener('click', close);
    box.querySelector('.af-lb-prev').addEventListener('click', function () { step(-1); });
    box.querySelector('.af-lb-next').addEventListener('click', function () { step(1); });
    img.addEventListener('click', function () { step(1); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
  }
})();
