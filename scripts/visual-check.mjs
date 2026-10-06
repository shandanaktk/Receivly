// Optional local visual smoke check. Start Edge/Chrome with --remote-debugging-port=9222.
import fs from "node:fs";
import path from "node:path";

const [route = "/", widthText = "390", theme = "dark"] = process.argv.slice(2);
const width = Number(widthText);
const height = Number(process.env.VISUAL_HEIGHT || 844);
const origin = process.env.VISUAL_BASE_URL || "http://127.0.0.1:3000";
const tabs = await (await fetch("http://127.0.0.1:9222/json")).json();
const tab = tabs.find((item) => item.type === "page");
if (!tab) throw new Error("No browser tab available");
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let counter = 0;
const pending = new Map();
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++counter;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 });
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: theme }] });
if (route.startsWith("/app") || route.startsWith("/admin")) {
  await send("Page.navigate", { url: `${origin}/` });
  await new Promise((resolve) => setTimeout(resolve, 500));
  const admin = route.startsWith("/admin");
  const session = { id: admin ? "user_admin" : "user_demo", email: admin ? "admin@receivly.ai" : "demo@receivly.ai", name: admin ? "Platform Owner" : "Alex Morgan", role: admin ? "platform_admin" : "admin", workspaceId: admin ? undefined : "ws_demo", timezone: "America/New_York", locale: "en-US", onboardingCompleted: true, notificationPreferences: { disputes: true, paymentClaims: true, extensionRequests: true, lowConfidence: true, messageFailures: true, missedPromises: true, upcomingPromises: true, subscriptionIssues: true, digest: "daily" } };
  await send("Runtime.evaluate", { expression: `localStorage.setItem("receivly_session", ${JSON.stringify(JSON.stringify(session))})` });
} else if (["/login", "/signup"].includes(route)) {
  await send("Page.navigate", { url: `${origin}/` });
  await new Promise((resolve) => setTimeout(resolve, 500));
  await send("Runtime.evaluate", { expression: 'localStorage.removeItem("receivly_session")' });
}
await send("Page.navigate", { url: `${origin}${route}` });
await new Promise((resolve) => setTimeout(resolve, route === "/" ? 3000 : 1800));
if (process.env.VISUAL_TARGET) {
  await send("Runtime.evaluate", { expression: `document.querySelector(${JSON.stringify(process.env.VISUAL_TARGET)})?.scrollIntoView({block:'start'})` });
  await new Promise((resolve) => setTimeout(resolve, 1200));
}
const metrics = await send("Runtime.evaluate", { expression: "({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, theme: document.documentElement.dataset.theme, title: document.title, videos: [...document.querySelectorAll('video')].map(v => ({time:v.currentTime,paused:v.paused,readyState:v.readyState,src:v.currentSrc})), sidebar: (() => { const n = document.querySelector('.sidebar-nav'); return n ? { viewport: n.clientHeight, content: n.scrollHeight } : null })() })", returnByValue: true });
const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
const filename = path.join(process.env.TEMP || process.cwd(), `receivly-${route.replaceAll("/", "-") || "home"}-${width}-${theme}${process.env.VISUAL_SUFFIX ? `-${process.env.VISUAL_SUFFIX}` : ""}.png`);
fs.writeFileSync(filename, Buffer.from(screenshot.data, "base64"));
console.log(JSON.stringify({ ...metrics.result.value, screenshot: filename }));
socket.close();
