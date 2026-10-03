import "@fontsource-variable/manrope";
import "./styles.css";
import {
  createIcons,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Menu,
  X,
  Bot,
  Monitor,
  Smartphone,
  Presentation,
  Ellipsis,
  CheckCheck,
  Wifi,
  CalendarDays,
  Send,
  CheckCircle2,
  MoveRight,
  Heart,
  MapPin,
  MessagesSquare,
  Sparkles,
  PencilRuler,
  Code2,
  Rocket,
  Plus,
  RotateCcw,
} from "lucide";
import { initContact } from "./contact";

createIcons({
  icons: {
    ArrowUpRight,
    ArrowDown,
    ArrowUp,
    Menu,
    X,
    Bot,
    Monitor,
    Smartphone,
    Presentation,
    Ellipsis,
    CheckCheck,
    Wifi,
    CalendarDays,
    Send,
    CheckCircle2,
    MoveRight,
    Heart,
    MapPin,
    MessagesSquare,
    Sparkles,
    PencilRuler,
    Code2,
    Rocket,
    Plus,
    RotateCcw,
  },
});
document.querySelector(".year")!.textContent = String(new Date().getFullYear());
const menu = document.querySelector<HTMLDialogElement>("#mobile-menu")!;
document
  .querySelector(".menu-toggle")!
  .addEventListener("click", () => menu.showModal());
document
  .querySelector(".close-menu")!
  .addEventListener("click", () => menu.close());
menu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", () => menu.close()));
menu.addEventListener("click", (event) => {
  if (event.target === menu) menu.close();
});
initContact();

// Animation code is optional: the page and its form remain usable if it fails.
import("./animations")
  .then(({ initAnimations }) => initAnimations())
  .catch(() => {
    document.querySelector(".loader")?.remove();
  });
