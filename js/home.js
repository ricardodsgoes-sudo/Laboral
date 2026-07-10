/* Home Laborite — selo circular, parallax e reveal no scroll.
   Independente do main.js. Conteúdo é visível mesmo sem este script. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Selo circular: clona o <template> em cada [data-seal] ---- */
  function mountSeals() {
    var tpl = document.getElementById("seal-tpl");
    if (!tpl) return;
    document.querySelectorAll("[data-seal]").forEach(function (host) {
      if (host.childElementCount) return;
      host.appendChild(tpl.content.cloneNode(true));
    });
  }

  /* ---- Reveal no scroll (aditivo: base já visível sem .in) ---- */
  function setupReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-rise]"));
    if (!items.length) return;

    // stagger entre irmãos [data-rise] do mesmo pai
    items.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) {
        return c.hasAttribute && c.hasAttribute("data-rise");
      });
      var i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = i * 80 + "ms";
    });

    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---- Parallax suave em [data-depth] ---- */
  function setupParallax() {
    // No mobile/touch o parallax baseado em scroll causa "tremor" e deslocamentos
    // estranhos — desliga em telas pequenas ou sem ponteiro fino.
    var noParallax = reduce
      || window.matchMedia("(hover: none), (pointer: coarse)").matches
      || window.innerWidth < 760;
    if (noParallax) return;
    var nodes = Array.prototype.map.call(document.querySelectorAll("[data-depth]"), function (el) {
      return { el: el, depth: parseFloat(el.getAttribute("data-depth")) || 0.1 };
    });
    if (!nodes.length) return;

    var ticking = false;
    function update() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      nodes.forEach(function (n) {
        var r = n.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var center = r.top + r.height / 2;
        var offset = (center - vh / 2) * n.depth;
        n.el.style.transform = "translate3d(0," + (-offset).toFixed(1) + "px,0)";
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ---- Hover mask reveal: revela a camada tecnica dentro do cursor ---- */
  function setupMaskReveal() {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    Array.prototype.forEach.call(document.querySelectorAll("[data-mask-reveal]"), function (card) {
      var targetNode = card;
      var radius = parseFloat(card.getAttribute("data-mask-radius")) || 220;
      var current = { x: 0, y: 0, r: 0 };
      var target = { x: 0, y: 0, r: 0 };
      var raf = 0;

      function write() {
        targetNode.style.setProperty("--mask-x", current.x.toFixed(1) + "px");
        targetNode.style.setProperty("--mask-y", current.y.toFixed(1) + "px");
        targetNode.style.setProperty("--mask-r", current.r.toFixed(1) + "px");
      }

      function tick() {
        current.x += (target.x - current.x) * 0.16;
        current.y += (target.y - current.y) * 0.16;
        current.r += (target.r - current.r) * 0.14;
        write();

        if (Math.abs(target.x - current.x) > 0.2 || Math.abs(target.y - current.y) > 0.2 || Math.abs(target.r - current.r) > 0.2) {
          raf = window.requestAnimationFrame(tick);
        } else {
          current.x = target.x;
          current.y = target.y;
          current.r = target.r;
          write();
          raf = 0;
        }
      }

      function requestTick() {
        if (!raf) raf = window.requestAnimationFrame(tick);
      }

      function updateFromPointer(event) {
        var rect = targetNode.getBoundingClientRect();
        target.x = event.clientX - rect.left;
        target.y = event.clientY - rect.top;
        requestTick();
      }

      card.addEventListener("pointerenter", function (event) {
        var rect = targetNode.getBoundingClientRect();
        current.x = target.x = event.clientX - rect.left;
        current.y = target.y = event.clientY - rect.top;
        target.r = radius;
        card.classList.add("is-active");
        requestTick();
      });

      card.addEventListener("pointermove", updateFromPointer);

      card.addEventListener("pointerleave", function () {
        target.r = 0;
        card.classList.remove("is-active");
        requestTick();
      });
    });
  }

  /* ---- Navbar fixa: vira "stuck" ao sair do hero ---- */
  function setupStickyHeader() {
    var header = document.querySelector(".lab-header");
    if (!header) return;
    var hero = document.querySelector(".lab-hero, .lab-hero-scrub, .sb-hero, .sol-hero, .pf-hero, .ct-hero, .fx-hero");
    var ticking = false;
    function apply() {
      var trigger = hero ? hero.offsetHeight * 0.72 : 400;
      header.classList.toggle("is-stuck", window.scrollY > trigger);
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(apply);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    apply();
  }

  /* ---- Hero: scrubbing por sequência de frames desenhada em <canvas> ---- */
  function setupHeroSequence() {
    var section = document.querySelector("[data-hero-seq]");
    if (!section) return;
    var canvas = section.querySelector(".lab-hero-canvas");
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;
    var count = parseInt(section.getAttribute("data-seq-frames"), 10) || 0;
    var prefix = section.getAttribute("data-seq-src") || "";
    var ext = section.getAttribute("data-seq-ext") || ".webp";
    var pad = parseInt(section.getAttribute("data-seq-pad"), 10) || 4;
    var poster = section.getAttribute("data-seq-poster");
    if (count <= 0) return;

    function pathFor(i) {
      var n = "" + i;
      while (n.length < pad) n = "0" + n;
      return prefix + n + ext;
    }

    // Mobile/touch: não carrega os 240 frames — usa o <video> em loop.
    // (Sob reduced-motion não dá play: o vídeo mostra só o seu poster, estático.)
    var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (isTouch) {
      var video = section.querySelector(".lab-hero-video");
      if (video && !reduce) {
        video.load();
        var playPromise = video.play();
        if (playPromise && playPromise.catch) playPromise.catch(function () {});
      } else if (!video) {
        var fallback = new Image();
        fallback.onload = function () { ctx.drawImage(fallback, 0, 0, W, H); };
        fallback.src = poster || pathFor(count - 1);
      }
      return;
    }

    // Desktop com reduced-motion: frame estático no canvas, sem scrub.
    if (reduce) {
      var still = new Image();
      still.onload = function () { ctx.drawImage(still, 0, 0, W, H); };
      still.src = poster || pathFor(count - 1);
      return;
    }

    var images = new Array(count);
    var current = -1;

    function frameIndex() {
      var rect = section.getBoundingClientRect();
      var scrollable = section.offsetHeight - window.innerHeight;
      var progress = scrollable > 0 ? -rect.top / scrollable : 0;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      return Math.min(count - 1, Math.round(progress * (count - 1)));
    }

    function render() {
      var i = frameIndex();
      if (i === current) return;
      var img = images[i];
      if (img && img.complete && img.naturalWidth) {
        ctx.drawImage(img, 0, 0, W, H);
        current = i;
      }
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(function () { render(); ticking = false; });
      }
    }

    for (var i = 0; i < count; i++) {
      (function (idx) {
        var img = new Image();
        img.decoding = "async";
        img.onload = function () {
          if (current === -1 || idx === frameIndex()) render();
        };
        img.src = pathFor(idx);
        images[idx] = img;
      })(i);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    render();
  }


  function init() {
    mountSeals();
    setupReveal();
    setupParallax();
    setupMaskReveal();
    setupStickyHeader();
    setupHeroSequence();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
