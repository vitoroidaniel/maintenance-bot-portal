import { spawn } from "node:child_process";

const children = [
  spawn(process.execPath, ["--watch", "--env-file-if-exists=.env", "server/index.mjs"], { stdio: "inherit", env: { ...process.env, PORT: "4175" } }),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "0.0.0.0"], { stdio: "inherit" }),
];
let stopping = false;
const stop = code => { if (stopping) return; stopping = true; children.forEach(child => child.kill("SIGTERM")); process.exitCode = code; };
children.forEach(child => { child.on("error", () => stop(1)); child.on("exit", code => stop(code || 0)); });
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
