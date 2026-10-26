(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function block(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  document.addEventListener('contextmenu', block);
  document.addEventListener('dragstart', block);
  document.addEventListener('selectstart', block);
  document.addEventListener('copy', block);
  document.addEventListener('cut', block);
  document.addEventListener('keydown', function (e) {
    var k = e.keyCode || e.which;
    var ctrl = e.ctrlKey || e.metaKey;
    if (k === 123) return block(e);
    if (ctrl && e.shiftKey && (k === 73 || k === 74 || k === 67 || k === 75)) return block(e);
    if (ctrl && (k === 85 || k === 83 || k === 80 || k === 65)) return block(e);
  }, true);

  try {
    if (!sessionStorage.getItem('rx_trk')) {
      sessionStorage.setItem('rx_trk', '1');
      var bot = 0;
      try { if (navigator.webdriver) bot = 1; } catch (e) {}
      var x = new XMLHttpRequest();
      x.open('POST', '/tracker', true);
      x.setRequestHeader('Content-Type', 'application/json');
      x.send(JSON.stringify({
        ua: navigator.userAgent,
        ref: document.referrer || (location.origin + location.pathname),
        lang: navigator.language,
        scr: screen.width + 'x' + screen.height,
        plat: navigator.platform || '',
        bot: bot,
        touch: ('ontouchstart' in window) ? 1 : 0,
        mm: 0,
        top: 0
      }));
    }
  } catch (e) {}

  document.querySelectorAll('[data-go]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var slug = btn.getAttribute('data-go');
      if (!slug) return;
      btn.disabled = true;
      window.location.href = 'https://t.me/LainTools';
    });
  });

  function starfield(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, stars = [], raf = 0, running = false;
    var px = 0, py = 0, tx = 0, ty = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(220, Math.round((w * h) / 5200));
      stars = [];
      for (var i = 0; i < count; i++) {
        var big = Math.random() < 0.07;
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: big ? 1.1 + Math.random() * 0.8 : 0.3 + Math.random() * 0.7,
          a: 0.22 + Math.random() * 0.6,
          t: Math.random() * Math.PI * 2,
          s: 0.4 + Math.random() * 1.5,
          tinted: Math.random() < 0.28,
          z: 0.2 + Math.random() * 0.8
        });
      }
      if (!running && !reduce) draw(performance.now());
    }

    function draw(now) {
      ctx.clearRect(0, 0, w, h);
      px += (tx - px) * 0.05;
      py += (ty - py) * 0.05;
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        var tw = reduce ? 1 : 0.55 + 0.45 * Math.sin(st.t + (now / 1000) * st.s);
        var x = st.x + px * st.z;
        var y = st.y + py * st.z;
        ctx.fillStyle = st.tinted ? '#9a8b75' : '#fff';
        ctx.globalAlpha = st.a * tw;
        ctx.beginPath();
        ctx.arc(x, y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (running) raf = requestAnimationFrame(draw);
    }

    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);
    document.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * -22;
      ty = (e.clientY / window.innerHeight - 0.5) * -14;
    });
    resize();
    if (!reduce) {
      running = true;
      raf = requestAnimationFrame(draw);
    }
  }
  document.querySelectorAll('canvas.stars').forEach(starfield);

  function setHall(slug) {
    document.querySelectorAll('[data-hall-card]').forEach(function (card) {
      card.classList.toggle('is-on', card.getAttribute('data-hall-card') === slug);
    });
  }

  function rotator() {
    var rot = document.querySelector('[data-rotator]');
    if (!rot) return;
    var words = [];
    try { words = JSON.parse(rot.getAttribute('data-words') || '[]'); } catch (e) {}
    if (!words.length) return;
    var slugs = [];
    document.querySelectorAll('[data-hall-card]').forEach(function (c) { slugs.push(c.getAttribute('data-hall-card')); });
    var i = 0;
    setHall(slugs[0] || '');
    if (reduce || words.length < 2) return;
    setInterval(function () {
      if (document.hidden) return;
      i = (i + 1) % words.length;
      var old = rot.querySelector('.rw:not(.out)');
      var next = document.createElement('span');
      next.className = 'rw in';
      next.textContent = words[i];
      rot.style.width = rot.offsetWidth + 'px';
      if (old) old.classList.add('out');
      rot.appendChild(next);
      requestAnimationFrame(function () { rot.style.width = next.offsetWidth + 'px'; });
      setHall(slugs[i] || '');
      setTimeout(function () {
        if (old) old.remove();
        next.classList.remove('in');
        rot.style.width = '';
      }, 650);
    }, 2600);
  }
  rotator();

  document.querySelectorAll('[data-hall-card]').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      setHall(card.getAttribute('data-hall-card'));
    });
  });

  function ago(ts) {
    var s = Math.max(0, Math.floor(Date.now() / 1000) - ts);
    if (s < 90) return 'live';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  }

  function fillHash(d) {
    document.querySelectorAll('[data-hash-card]').forEach(function (card) {
      var val = card.querySelector('[data-hash-val]');
      var ver = card.querySelector('[data-hash-ver]');
      var age = card.querySelector('[data-hash-age]');
      var prev = card.querySelector('[data-hash-prev]');
      var wrap = card.querySelector('[data-hash-prev-wrap]');
      if (val) val.textContent = d.hash;
      if (ver) ver.textContent = d.version || '';
      if (age) age.textContent = ago(d.fetched || d.seen);
      if (prev && wrap && d.prev_hash) {
        prev.textContent = d.prev_hash;
        wrap.hidden = false;
      }
      card.setAttribute('data-hash', d.hash);
      var tip = 'Roblox Windows ' + (d.version || '') + ' · ' + d.hash;
      if (d.prev_hash) tip += ' · was ' + d.prev_hash;
      card.setAttribute('title', tip);
    });
  }

  fetch('https://clientsettingscdn.roblox.com/v2/client-version/WindowsPlayer').then(function (r) { return r.json(); }).then(function (v) {
    var d = v && v.clientVersionUpload ? { ok: true, hash: v.clientVersionUpload, version: v.version, fetched: Math.floor(Date.now() / 1000) } : v;
    if (d && d.ok && d.hash) fillHash(d);
    else {
      document.querySelectorAll('[data-hash-age]').forEach(function (el) { el.textContent = 'offline'; });
    }
  }).catch(function () {
    document.querySelectorAll('[data-hash-age]').forEach(function (el) { el.textContent = 'offline'; });
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-hash-copy]');
    if (!btn) return;
    var card = btn.closest('[data-hash-card]');
    var hash = (card || btn).getAttribute('data-hash');
    if (!hash) return;
    function done() {
      btn.classList.add('is-copied');
      setTimeout(function () { btn.classList.remove('is-copied'); }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hash).then(done).catch(done);
    } else {
      done();
    }
  });

  function reveal() {
    var items = document.querySelectorAll('.brand-page .reveal');
    if (!items.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }
  reveal();

  function countUp() {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var to = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (reduce) { el.textContent = String(to); return; }
      var start = 0;
      var t0 = null;
      function step(now) {
        if (!t0) t0 = now;
        var p = Math.min(1, (now - t0) / 900);
        el.textContent = String(Math.round(to * p));
        if (p < 1) requestAnimationFrame(step);
      }
      var watch = el.closest('.stat') || el;
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting) return;
          io.disconnect();
          watch.classList.add('in');
          requestAnimationFrame(step);
        }, { threshold: 0.4 });
        io.observe(watch);
      } else requestAnimationFrame(step);
    });
  }
  countUp();

  function typeCode() {
    var pre = document.querySelector('[data-code]');
    if (!pre) return;
    var raw = pre.getAttribute('data-code') || '';
    var text = '';
    try { text = atob(raw); } catch (e) { return; }
    if (reduce) { pre.textContent = text; return; }
    var i = 0;
    function tick() {
      i += 1;
      pre.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(tick, 18 + Math.random() * 28);
    }
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0] || !entries[0].isIntersecting) return;
      io.disconnect();
      tick();
    }, { threshold: 0.25 });
    io.observe(pre);
  }
  typeCode();

  if (reduce) return;

  function tilt(el, max) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'rotateY(' + (x * max) + 'deg) rotateX(' + (-y * max) + 'deg)';
    });
    el.addEventListener('mouseleave', function () { el.style.transform = ''; });
  }
  document.querySelectorAll('[data-tilt-win]').forEach(function (el) { tilt(el, 8); });
  document.querySelectorAll('[data-tilt] .card-win').forEach(function (el) { tilt(el, 6); });
})();
