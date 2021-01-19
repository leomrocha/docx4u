import { app, BrowserWindow, globalShortcut } from "electron";
import * as path from "path";
import * as isDev from "electron-is-dev";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from "electron-devtools-installer";

import { registerFileService } from "../src/ipc/mainProcessService";

let browserWindow: BrowserWindow | null = null;

function createWindow() {
  browserWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  globalShortcut.register("f5", function () {
    console.log("f5 is pressed");
    browserWindow?.reload();
  });
  globalShortcut.register("CommandOrControl+R", function () {
    console.log("CommandOrControl+R is pressed");
    browserWindow?.reload();
  });

  browserWindow.setMenu(null);

  if (isDev) {
    browserWindow.loadURL("http://localhost:3000/index.html");
  } else {
    // 'build/index.html'
    browserWindow.loadURL(`file://${__dirname}/../index.html`);
  }

  registerFileService(browserWindow);

  browserWindow.on("closed", () => {
    browserWindow = null;
  });

  // Hot Reloading

  if (isDev) {
    require("electron-reload")(
      [__dirname, path.join(__dirname, "..", "src", "ipc")],
      {
        electron: path.join(
          __dirname,
          "..",
          "..",
          "node_modules",
          ".bin",
          "electron" + (process.platform === "win32" ? ".cmd" : "")
        ),
        forceHardReset: true,
        hardResetMethod: "exit",
      }
    );
  }

  // DevTools
  installExtension(REDUX_DEVTOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log("An error occurred: ", err));

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log("An error occurred: ", err));

  if (isDev) {
    browserWindow.webContents.openDevTools();
  }
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (browserWindow === null) {
    createWindow();
  }
});
