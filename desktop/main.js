const { app, BrowserWindow, Tray, Menu, nativeImage } = require("electron");
const path = require("path");

const APP_URL = "https://studytimerrr.vercel.app";

let mainWindow = null;
let overlayWindow = null;
let tray = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: "StudyTimer",
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.loadURL(APP_URL);
  mainWindow.on("closed", () => { mainWindow = null; });
}

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 90,
    height: 90,
    frame: false,
    transparent: false,
    backgroundColor: '#0d0d0d',
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    roundedCorners: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  // Load a standalone local HTML file — no Next.js, no body background,
  // fully transparent. Much more reliable than loading the full Vercel site.
  overlayWindow.loadFile(path.join(__dirname, "overlay.html"));
  overlayWindow.on("closed", () => { overlayWindow = null; });
}

function toggleOverlay() {
  if (overlayWindow) {
    overlayWindow.close();
  } else {
    createOverlayWindow();
  }
}

function createTray() {
  const iconPath = path.join(__dirname, "assets", "tray-icon.png");
  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    icon = nativeImage.createFromDataURL(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjkB6QAAAABJRU5ErkJggg==",
    );
  }

  tray = new Tray(icon);
  tray.setToolTip("StudyTimer");

  const menu = Menu.buildFromTemplate([
    {
      label: "Open StudyTimer",
      click: () => {
        if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
        else { createMainWindow(); }
      },
    },
    { label: "Toggle overlay timer", click: toggleOverlay },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.setContextMenu(menu);
  tray.on("click", toggleOverlay);
}

function createAppMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [{ label: "Quit", accelerator: "CmdOrCtrl+Q", click: () => app.quit() }],
    },
    {
      label: "Timer",
      submenu: [
        {
          label: "Toggle Floating Overlay",
          accelerator: "CmdOrCtrl+Shift+T",
          click: toggleOverlay,
        },
      ],
    },
    {
      label: "Window",
      submenu: [
        { label: "Minimize", accelerator: "CmdOrCtrl+M", role: "minimize" },
        { label: "Reload", accelerator: "CmdOrCtrl+R", role: "reload" },
        { type: "separator" },
        { label: "Toggle DevTools", accelerator: "F12", role: "toggleDevTools" },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createMainWindow();
  createTray();
  createAppMenu();
});

// Keep the app alive in the tray when all windows are closed.
app.on("window-all-closed", () => {
  // intentionally do nothing — user must Quit via tray menu
});

app.on("activate", () => {
  if (mainWindow === null) createMainWindow();
});
