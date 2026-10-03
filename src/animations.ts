import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function opening(reduced: boolean) {
  const count = { value: 0 };
  const timeline = gsap.timeline();
  timeline.to(count, {
    value: 100,
    duration: reduced ? 0 : 1.1,
    ease: "power2.out",
    onUpdate: () => {
      document.querySelector(".loader-count")!.textContent = Math.round(
        count.value,
      )
        .toString()
        .padStart(2, "0");
    },
  });
  timeline
    .to(".loader-track div", { scaleX: 1, duration: reduced ? 0 : 1.1 }, 0)
    .to(".loader", {
      yPercent: -100,
      duration: reduced ? 0 : 0.7,
      ease: "power3.inOut",
      onComplete: () => {
        document.querySelector(".loader")?.remove();
      },
    })
    .from(
      ".hero h1",
      { y: reduced ? 0 : 65, opacity: 0, duration: reduced ? 0 : 0.9 },
      "-=0.2",
    )
    .from(
      ".hero-mascot",
      {
        scale: reduced ? 1 : 0.85,
        opacity: 0,
        rotation: -8,
        duration: reduced ? 0 : 1.1,
      },
      "<",
    )
    .from(
      ".hero-bottom",
      { y: reduced ? 0 : 20, opacity: 0, duration: reduced ? 0 : 0.6 },
      "-=0.5",
    );
}

function revealSections() {
  gsap.utils
    .toArray<HTMLElement>(
      ".section h2, .about-copy p, .process-grid article, .price-grid article, .faq-list details",
    )
    .forEach((element) => {
      gsap.from(element, {
        y: 35,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
        scrollTrigger: { trigger: element, start: "top 92%", once: true },
      });
    });
  gsap.to(".ticker div", {
    xPercent: -50,
    duration: 28,
    repeat: -1,
    ease: "none",
  });
  gsap.to(".doodle-star", {
    rotation: 360,
    duration: 24,
    repeat: -1,
    ease: "none",
  });
  gsap.from(".process-line span", {
    scaleX: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".process",
      start: "top 70%",
      end: "bottom 65%",
      scrub: 0.6,
    },
  });
  gsap.from(".about-sticker", {
    rotation: -20,
    scale: 0.7,
    scrollTrigger: {
      trigger: ".about-media",
      start: "top 80%",
      end: "bottom 60%",
      scrub: 1,
    },
  });
  gsap.to(".hero-grid", {
    y: 120,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

function serviceStory() {
  const panels = gsap.utils.toArray<HTMLElement>(".service-panel");
  document.querySelector(".services-stage")!.classList.add("is-pinned");
  gsap.set(panels.slice(1), { autoAlpha: 0, y: 70, rotateX: -8 });
  const timeline = gsap.timeline({
    onUpdate: () => {
      const active = panels.reduce((best, panel, index) =>
        Number(gsap.getProperty(panel, "opacity")) > Number(gsap.getProperty(panels[best], "opacity")) ? index : best, 0);
      document.querySelector(".service-number")!.textContent = String(active + 1).padStart(2, "0");
    },
    scrollTrigger: {
      trigger: ".services-stage",
      start: "top 100px",
      end: "+=2400",
      pin: true,
      scrub: 0.7,
    },
  });
  panels.forEach((panel, index) => {
    timeline.to(panel, { y: -8, duration: 0.7 });
    if (index < panels.length - 1) {
      timeline
        .to(panel, { autoAlpha: 0, y: -60, rotateX: 8, duration: 0.35 })
        .to(
          panels[index + 1],
          { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.35 },
          "<",
        );
    }
  });
  gsap.to(".service-progress div span", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".services-stage",
      start: "top 100px",
      end: "+=2400",
      scrub: true,
    },
  });
  return () =>
    document.querySelector(".services-stage")!.classList.remove("is-pinned");
}

function horizontalStory() {
  const section = document.querySelector<HTMLElement>(".work")!;
  section.classList.add("is-pinned-work");
  const track = document.querySelector<HTMLElement>(".work-track")!;
  const viewport = document.querySelector<HTMLElement>(".work-viewport")!;
  gsap.to(track, {
    x: () => -(track.scrollWidth - viewport.clientWidth),
    ease: "none",
    scrollTrigger: {
      trigger: ".work",
      start: "top 85px",
      end: () => "+=" + (track.scrollWidth - viewport.clientWidth),
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });
  return () => section.classList.remove("is-pinned-work");
}

function pointerDetails() {
  const cleanups: (() => void)[] = [];
  document
    .querySelectorAll<HTMLElement>(".tilt, .hero-mascot")
    .forEach((element) => {
      const x = gsap.quickTo(element, "rotationY", { duration: 0.5 });
      const y = gsap.quickTo(element, "rotationX", { duration: 0.5 });
      const move = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        x(((event.clientX - rect.left) / rect.width - 0.5) * 12);
        y(-((event.clientY - rect.top) / rect.height - 0.5) * 12);
      };
      const leave = () => {
        x(0);
        y(0);
      };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", leave);
      });
    });
  return () => cleanups.forEach((cleanup) => cleanup());
}

function messageDoodle() {
  const canvas = document.querySelector<HTMLCanvasElement>(".contact-doodle")!;
  const context = canvas.getContext("2d");
  if (!context) return;
  const ratio = Math.min(window.devicePixelRatio, 2);
  canvas.width = 260 * ratio; canvas.height = 200 * ratio;
  context.scale(ratio, ratio);
  const path = new Path2D("M18 176 C50 155 127 164 126 122 C126 91 54 90 66 124 C80 159 149 92 170 68 M164 65 L236 22 L210 99 L195 64 L164 65 M195 64 L236 22");
  const draw = (progress: number) => {
    context.clearRect(0, 0, 260, 200);
    context.strokeStyle = "#a58bf7"; context.lineWidth = 2.5;
    context.lineCap = "round"; context.lineJoin = "round";
    context.setLineDash([650]); context.lineDashOffset = 650 * (1 - progress);
    context.stroke(path);
  };
  draw(1);
  return draw;
}

export function initAnimations() {
  const draw = messageDoodle();
  opening(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const media = gsap.matchMedia();
  media.add({
    all: "all",
    motion: "(prefers-reduced-motion: no-preference)",
    desktop: "(min-width: 1000px) and (min-height: 640px)",
    hover: "(hover: hover)",
  }, (context) => {
    const { motion, desktop, hover } = context.conditions!;
    if (!motion) { draw?.(1); return; }
    const cleanups: (() => void)[] = [];
    // Pin spacing must exist before measuring the reveals further down the page.
    if (desktop) cleanups.push(serviceStory(), horizontalStory());
    revealSections();
    const ink = { progress: 0 };
    if (draw) gsap.to(ink, {
      progress: 1, ease: "none", onUpdate: () => draw(ink.progress),
      scrollTrigger: { trigger: ".contact", start: "top 80%", end: "top 20%", scrub: 0.5 },
    });
    gsap.to(".hero-mascot img", {
      y: -18,
      rotation: 3,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.from(".contact-doodle", {
      rotation: -30,
      opacity: 0,
      scrollTrigger: {
        trigger: ".contact",
        start: "top 80%",
        end: "top 30%",
        scrub: true,
      },
    });
    if (hover) cleanups.push(pointerDetails());
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => cleanups.forEach(cleanup => cleanup());
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), {
    once: true,
  });
}
