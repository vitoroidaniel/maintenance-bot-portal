import {
  faGithub,
  faTelegram,
  faInstagram,
  faFacebookF,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/free-brands-svg-icons";

function brandIcon(icon: IconDefinition): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${icon.icon[0]} ${icon.icon[1]}`);
  svg.setAttribute("aria-hidden", "true");
  const paths = Array.isArray(icon.icon[4]) ? icon.icon[4] : [icon.icon[4]];
  paths.forEach((data) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", data);
    svg.append(path);
  });
  return svg;
}

function initProfiles() {
  const profiles: [string, IconDefinition, string | undefined][] = [
    ["GitHub", faGithub, import.meta.env.VITE_GITHUB_URL],
    ["Telegram", faTelegram, import.meta.env.VITE_TELEGRAM_URL],
    ["Instagram", faInstagram, import.meta.env.VITE_INSTAGRAM_URL],
    ["Facebook", faFacebookF, import.meta.env.VITE_FACEBOOK_URL],
    ["LinkedIn", faLinkedinIn, import.meta.env.VITE_LINKEDIN_URL],
  ];
  const socials = document.querySelector(".socials")!;
  profiles.forEach(([name, icon, url]) => {
    const safe = url && /^https:\/\//i.test(url);
    const element = document.createElement(safe ? "a" : "button");
    element.className = "social-link";
    element.setAttribute(
      "aria-label",
      safe ? name : `${name} — profile coming soon`,
    );
    element.setAttribute("title", safe ? name : `${name}: profile coming soon`);
    if (element instanceof HTMLAnchorElement && url) {
      element.href = url;
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    } else element.setAttribute("aria-disabled", "true");
    const label = document.createElement("span");
    label.textContent = name;
    element.append(brandIcon(icon), label);
    socials.append(element);
  });
  const email = import.meta.env.VITE_CONTACT_EMAIL;
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const link = document.querySelector<HTMLAnchorElement>(".email-link")!;
    link.href = `mailto:${email}`;
    link.textContent = email;
    link.hidden = false;
  }
}

export function initContact() {
  initProfiles();
  const form = document.querySelector<HTMLFormElement>("#contact form")!;
  const success = document.querySelector<HTMLElement>(".form-success")!;
  const error = form.querySelector<HTMLElement>(".form-error")!;
  const button = form.querySelector<HTMLButtonElement>(".submit")!;
  document
    .querySelectorAll<HTMLAnchorElement>("[data-service]")
    .forEach((link) => {
      link.addEventListener("click", () => {
        form
          .querySelectorAll<HTMLInputElement>('[name="service"]')
          .forEach((input) => {
            input.checked = input.value === link.dataset.service;
          });
      });
    });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!button.disabled && form.reportValidity())
      void sendEnquiry(form, button, error, success);
  });
  document.querySelector(".reset-form")!.addEventListener("click", () => {
    success.hidden = true;
    form.hidden = false;
    form.querySelector<HTMLInputElement>('[name="name"]')!.focus();
  });
}

async function sendEnquiry(
  form: HTMLFormElement,
  button: HTMLButtonElement,
  error: HTMLElement,
  success: HTMLElement,
) {
  const label = button.querySelector("span")!;
  button.disabled = true;
  label.textContent = "Sending your idea…";
  error.hidden = true;
  form.setAttribute("aria-busy", "true");
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
      signal: AbortSignal.timeout(20000),
    });
    const result: unknown = await response.json();
    if (
      !response.ok ||
      typeof result !== "object" ||
      result === null ||
      !("ok" in result) ||
      result.ok !== true
    ) {
      throw new Error(
        typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
          ? result.error
          : "Couldn't send your message. Please try again.",
      );
    }
    form.reset();
    form.hidden = true;
    success.hidden = false;
    success.setAttribute("tabindex", "-1");
    success.focus();
  } catch (cause) {
    error.textContent =
      cause instanceof Error && cause.name !== "TimeoutError"
        ? cause.message
        : "The connection timed out. Your message is still here; please try again.";
    error.hidden = false;
  } finally {
    button.disabled = false;
    label.textContent = "Send my idea";
    form.removeAttribute("aria-busy");
  }
}
