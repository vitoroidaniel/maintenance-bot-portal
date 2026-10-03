# Daniel Portfolio

Original mascot artwork lives in `public/mascote/`. The transparent raster cutout, `mascot-cutout.png`, is used for the logo, favicon, loader and hero. The original JPGs are preserved. The cutout was made with the built-in image editor: remove the light background, preserve the silhouette and white eyes, and constrain the aura to violet.

## Editing

- `index.html`: semantic page sections, service content, prices and FAQ.
- `src/main.ts`: icons, navigation and initialization.
- `src/animations.ts`: lazy-loaded GSAP opening, scroll stories, reveals and pointer effects.
- `src/contact.ts`: contact form and configurable social profiles.
- `src/styles.css`: palette, responsive layouts and microinteractions.
- `public/`: original static assets.
- `vite.config.ts`: Vite configuration and development API proxy.
- `server/index.mjs`: production static server.

Run `npm ci` to install dependencies, then `npm run dev` for http://localhost:5173 with live updates. Run `npm run build` for strict TypeScript checks and production output. Run `npm start` to serve the build at http://localhost:4173 (or the configured `PORT`). `dist/` is generated; edit `src/` and `public/` instead.

Built with vanilla TypeScript, GSAP ScrollTrigger and Lucide. Font Awesome supplies social brand icons. Native dialog and details elements provide navigation and FAQ behavior. Desktop scroll stories pin the services and move the project concepts horizontally; small or short screens use a normal reading layout and swipeable projects. Reduced-motion preferences disable pinning, parallax and pointer motion. Faux 3D uses CSS perspective, not a WebGL renderer. Fonts are self-hosted. Superseded React, Three.js and Tailwind code and dependencies have been removed.

## Railway

Connect this repository to a Railway service. Railway detects the Dockerfile, builds the site and starts the server. The server binds to `0.0.0.0` and Railway's `PORT`. The included `railway.json` configures `/health` as the deployment health check. Generate a public domain in the service's Networking settings.

## Contact & Profiles

Copy the values listed in `.env.example` into a local `.env`, or set them in Railway Variables. Public profile URLs and the public contact email use `VITE_` keys and require a rebuild after editing. Blank profiles appear as "coming soon" rather than linking to someone else's account.

The contact form posts to `/api/contact`. Configure `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (a verified sender) and `CONTACT_TO_EMAIL` to deliver enquiries through [Resend](https://resend.com/docs/api-reference/emails/send-email). Keep these server-only keys out of `VITE_` variables. Without configuration, the form displays an unavailable message and retains the visitor's input; it never claims an email was sent. The endpoint validates fields, limits body size, checks a honeypot, and limits repeat enquiries per email and connection. Rate limits are per running instance.

`npm run dev` starts both Vite and the API server (port 4175). `npm test` checks validation, provider failures, rate limits and honest unconfigured behavior without sending real emails.

Projects are labeled concepts. All four starting prices are samples requested for the design and should be replaced before publishing an offer.

Programming images are downloaded from Unsplash and served locally: [code editor by Vishnu Kalanad](https://unsplash.com/photos/computer-screen-displaying-colorful-code-evzHeMgbKOg) in `public/images/code-editor.jpg`, and [developer workspace by Bayu Syaits](https://unsplash.com/photos/laptop-and-phone-on-a-desk-with-coding-software-open-oYzjGQ7LCVE) in `public/images/developer-workstation.jpg`. CSS displays them in grayscale to preserve the palette. These are illustrative photography, not Daniel's personal workspace or completed client projects. Superseded interior and workspace images have been removed.
