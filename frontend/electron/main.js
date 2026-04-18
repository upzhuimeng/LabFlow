const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const { app, BrowserWindow, dialog } = require("electron");

const DEFAULT_CONFIG = {
  backendBaseUrl: "http://127.0.0.1:8000",
  frontendPort: 3210,
};

let nextServerStarted = false;

function getRuntimeConfigPath() {
  return path.join(path.dirname(process.execPath), "frontend.config.json");
}

function loadRuntimeConfig() {
  const configPath = getRuntimeConfigPath();
  if (!fs.existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      backendBaseUrl: (parsed.backendBaseUrl || DEFAULT_CONFIG.backendBaseUrl).replace(/\/$/, ""),
      frontendPort: Number(parsed.frontendPort || DEFAULT_CONFIG.frontendPort),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function resolveServerEntrypoint() {
  if (app.isPackaged) {
    const serverRoot = path.join(process.resourcesPath, "server");
    const directEntrypoint = path.join(serverRoot, "server.js");
    if (fs.existsSync(directEntrypoint)) {
      return directEntrypoint;
    }

    const recursiveEntrypoint = findFileByName(serverRoot, "server.js");
    if (recursiveEntrypoint) {
      return recursiveEntrypoint;
    }

    return directEntrypoint;
  }
  return path.join(app.getAppPath(), ".next", "standalone", "server.js");
}

function findFileByName(baseDir, targetName) {
  if (!fs.existsSync(baseDir)) {
    return null;
  }

  const queue = [baseDir];
  while (queue.length > 0) {
    const current = queue.shift();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isFile() && entry.name === targetName) {
        return fullPath;
      }
      if (entry.isDirectory()) {
        queue.push(fullPath);
      }
    }
  }

  return null;
}

function startNextServer(config) {
  const serverEntrypoint = resolveServerEntrypoint();
  if (!fs.existsSync(serverEntrypoint)) {
    throw new Error(`Missing Next standalone server: ${serverEntrypoint}`);
  }

  if (nextServerStarted) {
    return;
  }

  process.env.NODE_ENV = "production";
  process.env.HOSTNAME = "127.0.0.1";
  process.env.PORT = String(config.frontendPort);
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL = config.backendBaseUrl;

  require(serverEntrypoint);
  nextServerStarted = true;
}

function waitForServer(url, timeoutMs = 40000) {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });

      req.on("error", () => {
        if (Date.now() >= deadline) {
          reject(new Error(`Frontend server startup timeout: ${url}`));
          return;
        }
        setTimeout(check, 500);
      });
    };

    check();
  });
}

function stopNextServer() {
  // Next standalone server runs in current process; app exit will stop it.
}

async function createWindow() {
  const config = loadRuntimeConfig();
  const frontendUrl = `http://127.0.0.1:${config.frontendPort}`;

  startNextServer(config);
  await waitForServer(frontendUrl);

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  await mainWindow.loadURL(frontendUrl);
}

app.whenReady().then(async () => {
  try {
    await createWindow();
  } catch (error) {
    await dialog.showErrorBox("LabFlow 启动失败", String(error));
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  stopNextServer();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  stopNextServer();
});
