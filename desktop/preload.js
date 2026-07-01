const { contextBridge, ipcRenderer } = require("electron");

// Expose a small safe bridge so pages can talk to the main process.
contextBridge.exposeInMainWorld("electron", {
  closeOverlay: () => ipcRenderer.send("overlay-close"),
  isOverlay: () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("overlay") === "true";
  },
});
