const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function splitText() {
  document.querySelectorAll(".split-text").forEach((element) => {
    const text = element.textContent || "";
    element.setAttribute("aria-label", text.trim());
    element.textContent = "";

    text.split(/(\s+)/).forEach((token, index) => {
      if (!token.trim()) {
        element.append(document.createTextNode("\u00a0"));
        return;
      }

      const span = document.createElement("span");
      span.textContent = token;
      span.style.animationDelay = `${index * 0.045 + 0.08}s`;
      span.setAttribute("aria-hidden", "true");
      element.appendChild(span);
    });
  });
}

function animateCounter(element) {
  const target = Number.parseInt(element.dataset.counter || "0", 10);
  const suffix = element.dataset.suffix || "";
  const prefix = element.dataset.prefix || "";
  const duration = 1500;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${prefix}${Math.round(target * eased).toLocaleString("nl-BE")}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function initReveal() {
  const revealTargets = document.querySelectorAll("[data-reveal], .image-reveal");

  revealTargets.forEach((element) => {
    if (element.dataset.delay) {
      element.style.setProperty("--reveal-delay", `${element.dataset.delay}ms`);
    }
  });

  if (prefersReducedMotion) {
    revealTargets.forEach((element) => element.classList.add("visible"));
    document.querySelectorAll("[data-counter]").forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        element.classList.add("visible");

        if (element.dataset.counter) {
          animateCounter(element);
        }

        element.querySelectorAll("[data-counter]").forEach(animateCounter);
        observer.unobserve(element);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -70px 0px" },
  );

  revealTargets.forEach((element) => observer.observe(element));
}

function initScrollEffects() {
  const progress = document.querySelector(".scroll-progress");
  const parallaxLayers = document.querySelectorAll("[data-speed]");

  function update() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    progress?.style.setProperty("--progress", scrollProgress.toFixed(4));

    if (!prefersReducedMotion) {
      parallaxLayers.forEach((layer) => {
        const speed = Number.parseFloat(layer.dataset.speed || "0");
        const rect = layer.getBoundingClientRect();
        const offset = (rect.top - window.innerHeight / 2) * speed;
        layer.style.transform = `translateY(${offset}px)`;
      });
    }
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function initMagneticButtons() {
  if (prefersReducedMotion) return;

  document.querySelectorAll(".magnetic-btn").forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
      button.style.transform = `translate(${x}px, ${y}px)`;
      button.style.transition = "none";
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translate(0, 0)";
      button.style.transition = "transform 520ms cubic-bezier(0.16, 1, 0.3, 1)";
    });
  });
}

function initTiltCards() {
  if (prefersReducedMotion) return;

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 9;
      const rotateY = (x - 0.5) * 9;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.transition = "none";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateY(0)";
      card.style.transition = "transform 620ms cubic-bezier(0.16, 1, 0.3, 1)";
    });
  });
}

function initTabs() {
  const buttons = document.querySelectorAll(".offer-tabs button");
  const cards = document.querySelectorAll(".offer-card");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      buttons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
        item.setAttribute("aria-selected", item === button ? "true" : "false");
      });

      cards.forEach((card) => {
        const isVisible = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !isVisible);
      });
    });
  });
}

function initReviews() {
  const reviews = document.querySelectorAll(".review-card");
  const controls = document.querySelectorAll("[data-review]");
  let activeIndex = 0;
  let timer;

  function show(index) {
    activeIndex = index;
    reviews.forEach((review, reviewIndex) => {
      review.classList.toggle("is-active", reviewIndex === index);
    });
    controls.forEach((control, controlIndex) => {
      control.classList.toggle("is-active", controlIndex === index);
    });
  }

  function start() {
    if (prefersReducedMotion) return;
    timer = window.setInterval(() => {
      show((activeIndex + 1) % reviews.length);
    }, 6500);
  }

  controls.forEach((control) => {
    control.addEventListener("click", () => {
      window.clearInterval(timer);
      show(Number.parseInt(control.dataset.review || "0", 10));
      start();
    });
  });

  start();
}

function initAccordion() {
  document.querySelectorAll(".accordion button").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.nextElementSibling;
      const isOpen = button.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".accordion button").forEach((item) => {
        item.setAttribute("aria-expanded", "false");
        item.nextElementSibling.hidden = true;
      });

      if (!isOpen) {
        button.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });
}

function initLightbox() {
  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox?.querySelector("img");
  const closeButton = lightbox?.querySelector("button");

  function close() {
    if (!lightbox || !lightboxImage) return;
    lightbox.hidden = true;
    lightboxImage.src = "";
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".gallery-item").forEach((button) => {
    button.addEventListener("click", () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = button.dataset.full || button.querySelector("img")?.src || "";
      lightboxImage.alt = button.querySelector("img")?.alt || "Sfeerbeeld";
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  closeButton?.addEventListener("click", close);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function initContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent("Aanvraag Deceuninck Dylan Event");
    const body = encodeURIComponent(
      [
        `Naam: ${data.get("name")}`,
        `E-mail: ${data.get("email")}`,
        `Datum en locatie: ${data.get("event")}`,
        `Thema: ${data.get("theme")}`,
        "",
        "Extra info:",
        data.get("message") || "-",
      ].join("\n"),
    );

    window.location.href = `mailto:info@deceuninck-dylan-event.be?subject=${subject}&body=${body}`;
  });
}

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  toggle?.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
    nav?.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle?.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    });
  });
}

function initHeroCarousel() {
  const images = document.querySelectorAll(".hero-image");
  if (prefersReducedMotion || images.length < 2) return;

  let index = 0;
  window.setInterval(() => {
    images[index].classList.remove("is-active");
    index = (index + 1) % images.length;
    images[index].classList.add("is-active");
  }, 5200);
}

function initCursorGlow() {
  const glow = document.querySelector(".cursor-glow");
  if (!glow || prefersReducedMotion) return;

  window.addEventListener("pointermove", (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });

  window.addEventListener("pointerleave", () => {
    glow.style.opacity = "0";
  });

  window.addEventListener("pointerenter", () => {
    glow.style.opacity = "0.35";
  });
}

function initSparkCanvas() {
  const canvas = document.querySelector(".spark-canvas");
  if (!canvas || prefersReducedMotion) return;

  const context = canvas.getContext("2d");
  const colors = ["#d7b56d", "#f06f51", "#18b7ad", "#fff8ef"];
  const particles = [];

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function spawn() {
    while (particles.length < 42) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 2 + Math.random() * 4,
        speed: 0.18 + Math.random() * 0.58,
        drift: -0.22 + Math.random() * 0.44,
        rotation: Math.random() * Math.PI,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  function draw() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle) => {
      particle.y += particle.speed;
      particle.x += particle.drift;
      particle.rotation += 0.012;

      if (particle.y > window.innerHeight + 20) {
        particle.y = -20;
        particle.x = Math.random() * window.innerWidth;
      }

      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = particle.color;
      context.globalAlpha = 0.5;
      context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      context.restore();
    });

    requestAnimationFrame(draw);
  }

  resize();
  spawn();
  draw();
  window.addEventListener("resize", () => {
    resize();
    spawn();
  });
}

splitText();
initReveal();
initScrollEffects();
initMagneticButtons();
initTiltCards();
initTabs();
initReviews();
initAccordion();
initLightbox();
initContactForm();
initNav();
initHeroCarousel();
initCursorGlow();
initSparkCanvas();
