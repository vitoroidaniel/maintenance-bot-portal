const revealItems = document.querySelectorAll("[data-reveal]");
const cursorGlow = document.querySelector(".cursor-glow");
const tiltCards = document.querySelectorAll("[data-tilt]");
const magneticItems = document.querySelectorAll(".magnetic");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

window.addEventListener("pointermove", (event) => {
  if (cursorGlow) {
    cursorGlow.style.transform = `translate3d(${event.clientX - 144}px, ${event.clientY - 144}px, 0)`;
  }
});

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
});

magneticItems.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  });

  item.addEventListener("pointerleave", () => {
    item.style.transform = "";
  });
});
