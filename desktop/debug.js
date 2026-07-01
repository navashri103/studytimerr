const e = require("electron");
console.log("typeof electron:", typeof e);
if (typeof e === "object" && e !== null) {
  console.log("ipcMain:", typeof e.ipcMain);
  console.log("app:", typeof e.app);
  console.log("BrowserWindow:", typeof e.BrowserWindow);
} else {
  console.log("electron value:", e);
}
process.exit(0);
