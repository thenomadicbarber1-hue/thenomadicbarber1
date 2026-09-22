/* Shared app-shell behaviour: mobile menu, installation, and the /app download page. */
const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
if (header && menuButton) {
  menuButton.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
  document.querySelectorAll(".site-header nav a").forEach((link) => link.addEventListener("click", () => {
    header.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  }));
}

let deferredInstallPrompt = null;
const installSheet = document.querySelector("#installSheet");
const installMessage = document.querySelector("#installMessage");
const installSteps = document.querySelector("#installSteps");
const installConfirm = document.querySelector("#installConfirm");
const userAgent = navigator.userAgent.toLowerCase();
const isIpadDevice = /ipad/.test(userAgent) || (/macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);
const isIosDevice = /iphone|ipod/.test(userAgent) || isIpadDevice;
const isAndroidDevice = /android/.test(userAgent);
const isIosBrowserWithoutInstall = isIosDevice && /crios|fxios|edgios|opt\//.test(userAgent);
const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

function installInstructions(platform = "auto") {
  const isIos = platform === "ios" || (platform === "auto" && isIosDevice);
  const isAndroid = platform === "android" || (platform === "auto" && isAndroidDevice);
  const isMacSafari = /macintosh/.test(userAgent) && /safari/.test(userAgent) && !/chrome|crios|edg/.test(userAgent);
  if (isIos) {
    const steps = ["Tap the Share button in Safari.", "Scroll and choose Add to Home Screen.", "Tap Add to place Nomadic Ready on your Home Screen."];
    if (isIosBrowserWithoutInstall) steps.unshift("Reopen this page in Safari — other iOS browsers cannot install apps.");
    return steps;
  }
  if (isAndroid) return ["Open this site in Chrome, Samsung Internet, Edge, or Brave.", "Tap Install app in the browser menu or accept the install prompt.", "Open Nomadic Ready from your Home Screen or app drawer."];
  if (isMacSafari) return ["Open the File menu in Safari.", "Choose Add to Dock.", "Open Nomadic Ready from your Dock like any other app."];
  return ["Open this page in Chrome, Edge, or Brave.", "Open the browser menu and choose Install app.", "Confirm Install to add Nomadic Ready to your device."];
}

function openInstallSheet(platform = "auto") {
  if (!installSheet) return;
  const steps = installInstructions(platform);
  installSteps.innerHTML = steps.map((step, index) => `<div class="install-step"><b>${index + 1}</b><span>${step}</span></div>`).join("");
  installConfirm.hidden = !deferredInstallPrompt || platform === "ios";
  installMessage.textContent = deferredInstallPrompt
    ? "Add the global barber finder to your device for fast, full-screen access."
    : "Keep the global barber finder and texture guide one tap away.";
  installSheet.hidden = false;
  document.body.style.overflow = "hidden";
  installSheet.querySelector(".install-close").focus();
}

function closeInstallSheet() {
  if (!installSheet) return;
  installSheet.hidden = true;
  document.body.style.overflow = "";
}

function runInstallPrompt(onDone) {
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.finally(() => {
    deferredInstallPrompt = null;
    if (onDone) onDone();
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.body.classList.add("can-install");
});

document.querySelectorAll("[data-install]").forEach((button) => button.addEventListener("click", () => {
  const platform = button.dataset.installPlatform || "auto";
  if (deferredInstallPrompt && platform !== "ios") {
    runInstallPrompt();
    return;
  }
  openInstallSheet(platform);
}));
document.querySelectorAll("[data-install-close]").forEach((button) => button.addEventListener("click", closeInstallSheet));
if (installConfirm) {
  installConfirm.addEventListener("click", () => {
    if (!deferredInstallPrompt) return;
    runInstallPrompt(closeInstallSheet);
  });
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && installSheet && !installSheet.hidden) closeInstallSheet();
});
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  closeInstallSheet();
  document.body.classList.add("is-standalone");
  document.querySelectorAll("[data-install], .install-trigger").forEach((element) => { element.hidden = true; });
});
if (isStandalone) document.body.classList.add("is-standalone");

/* Download page: name the visitor's platform and highlight the matching card. */
const deviceBanner = document.querySelector("#deviceBanner");
if (deviceBanner && !isStandalone) {
  const label = document.querySelector("#deviceLabel");
  const hint = document.querySelector("#deviceHint");
  let panel = "desktop";
  if (isIosDevice) {
    panel = "ios";
    label.textContent = isIpadDevice ? "iPad" : "iPhone";
    hint.textContent = isIosBrowserWithoutInstall
      ? "Open this page in Safari, then use Share to add it to your Home Screen"
      : "Install through Safari's Share menu — the steps are below";
  } else if (isAndroidDevice) {
    panel = "android";
    label.textContent = "Android";
    hint.textContent = "Tap install and confirm — it takes a few seconds";
  } else {
    label.textContent = "Desktop";
    hint.textContent = "You can install it here, or send the link to your phone below";
  }
  const detected = document.querySelector(`#panel-${panel}`);
  if (detected) detected.classList.add("is-detected");
  const heroInstall = document.querySelector("#heroInstall");
  if (heroInstall && panel === "ios") heroInstall.dataset.installPlatform = "ios";
  deviceBanner.hidden = false;
}

/* Download page: pass the install link over to a phone. */
const shareLink = document.querySelector("#shareLink");
if (shareLink) {
  const url = `${window.location.origin}/app`;
  shareLink.textContent = url;
  const sendStatus = document.querySelector("#sendStatus");
  const shareButton = document.querySelector("#shareButton");
  const copyButton = document.querySelector("#copyButton");
  const announce = (message) => { if (sendStatus) sendStatus.textContent = message; };

  if (shareButton) {
    if (!navigator.share) {
      shareButton.hidden = true;
      const actions = document.querySelector(".send-actions");
      if (actions) actions.classList.add("single");
    }
    shareButton.addEventListener("click", async () => {
      try {
        await navigator.share({ title: "Nomadic Ready", text: "Install the Nomadic Barber Global app on your phone.", url });
      } catch (error) {
        if (error && error.name !== "AbortError") announce("Sharing is unavailable — copy the link instead");
      }
    });
  }

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(url);
        announce("Link copied — open it on your phone");
      } catch (error) {
        announce(`Copy this address on your phone: ${url}`);
      }
    });
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/service-worker.js").catch(() => {}));
}
