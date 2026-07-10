const WHATSAPP_URL =
  "https://wa.me/5511999990000?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Laborite%20Est%C3%A9tica%20Dental%20e%20quero%20falar%20sobre%20uma%20parceria%20ou%20or%C3%A7amento.";
const EMAIL = "contato@laborite.com.br";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js");

function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    links.classList.remove("is-open");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    links.classList.toggle("is-open", !isOpen);
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (!links.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

function setupContactLinks() {
  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    link.setAttribute("href", WHATSAPP_URL);
  });

  document.querySelectorAll("[data-email]").forEach((link) => {
    link.setAttribute("href", `mailto:${EMAIL}`);
  });

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

function setupForms() {
  document.querySelectorAll("[data-contact-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = data.get("name") || "";
      const phone = data.get("phone") || "";
      const service = data.get("service") || "";
      const message = data.get("message") || "";
      const subject = encodeURIComponent("Contato pelo site - Laborite Estetica Dental");
      const body = encodeURIComponent(
        `Nome: ${name}\nTelefone/WhatsApp: ${phone}\nInteresse: ${service}\n\nMensagem:\n${message}`
      );
      const status = form.querySelector(".form-status");
      if (status) status.textContent = "Abrindo seu aplicativo de e-mail com a mensagem preenchida.";
      window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    });
  });
}

function setupGalleryFilters() {
  const buttons = document.querySelectorAll("[data-filter]");
  const items = document.querySelectorAll("[data-category]");
  if (!buttons.length || !items.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      items.forEach((item) => {
        const visible = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("is-hidden", !visible);
      });
    });
  });
}

function setupMagneticButtons() {
  if (prefersReducedMotion) return;

  document.querySelectorAll(".button, .service-card, .filter-button").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
      element.style.transform = `translate(${x * 7}px, ${y * 7}px)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

function setupLenis() {
  if (prefersReducedMotion || !window.Lenis) return;

  const lenis = new window.Lenis({
    duration: 1.08,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    lerp: 0.085,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.2,
  });

  let rafId = 0;
  let gsapTick = null;

  const updateScrollTrigger = () => {
    if (window.ScrollTrigger) window.ScrollTrigger.update();
  };

  lenis.on("scroll", updateScrollTrigger);

  if (window.gsap) {
    gsapTick = (time) => lenis.raf(time * 1000);
    window.gsap.ticker.add(gsapTick);
    window.gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
  }

  window.addEventListener(
    "pagehide",
    () => {
      if (gsapTick && window.gsap) window.gsap.ticker.remove(gsapTick);
      if (rafId) cancelAnimationFrame(rafId);
      lenis.destroy();
    },
    { once: true }
  );
}

async function setupAnimeTimeline() {
  if (prefersReducedMotion) {
    document.body.classList.add("is-loaded");
    return;
  }

  try {
    const { createTimeline, stagger } = await import("https://cdn.jsdelivr.net/npm/animejs/+esm");
    const timeline = createTimeline({
      defaults: { duration: 760, ease: "out(4)" },
    });

    timeline
      .add(".brand-mark", { opacity: [0, 1], scale: [0.72, 1], rotate: [-12, 0] })
      .add(".hero-kicker, .page-kicker", { opacity: [0, 1], translateY: [18, 0] }, "-=520")
      .add(".hero-title, .page-title", { opacity: [0, 1], translateY: [34, 0] }, "-=520")
      .add(".hero-copy .lead, .home-hero-copy .lead, .page-hero .lead", { opacity: [0, 1], translateY: [22, 0] }, "-=500")
      .add(".hero-actions .button, .cta-row .button", { opacity: [0, 1], translateY: [18, 0], delay: stagger(80) }, "-=460")
      .add(".image-card, .page-hero-card, .home-case-card", { opacity: [0, 1], translateY: [42, 0], delay: stagger(95) }, "-=620");
  } catch (error) {
    document.body.classList.add("is-loaded");
  }
}

function setupGsap() {
  if (prefersReducedMotion) return;

  if (!window.gsap || !window.ScrollTrigger) {
    document.body.classList.add("is-loaded");
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".reveal").forEach((element) => {
    gsap.fromTo(
      element,
      { y: 44, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 84%",
        },
      }
    );
  });

  gsap.utils.toArray("[data-parallax]").forEach((element) => {
    gsap.to(element, {
      yPercent: -10,
      ease: "none",
      scrollTrigger: {
        trigger: element.closest("figure") || element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  const process = document.querySelector(".process-list");
  if (process && window.innerWidth > 980) {
    gsap.fromTo(
      ".process-step",
      { opacity: 0.35, x: 36 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.16,
        scrollTrigger: {
          trigger: process,
          start: "top 70%",
          end: "bottom 55%",
          scrub: 1,
        },
      }
    );
  }

  const gallery = document.querySelector(".gallery-grid");
  if (gallery) {
    gsap.from(".gallery-item", {
      opacity: 0,
      y: 36,
      duration: 0.8,
      stagger: 0.055,
      ease: "power3.out",
      scrollTrigger: {
        trigger: gallery,
        start: "top 80%",
      },
    });
  }
}

function initLaboriteSite() {
  setupNavigation();
  setupContactLinks();
  setupForms();
  setupGalleryFilters();
  setupMagneticButtons();
  setupLenis();
  setupAnimeTimeline();
  setupGsap();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLaboriteSite, { once: true });
} else {
  initLaboriteSite();
}
