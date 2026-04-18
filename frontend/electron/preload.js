const fs = require("node:fs");
const path = require("node:path");
const { contextBridge } = require("electron");

const DEFAULT_CONFIG = {
  backendBaseUrl: "http://127.0.0.1:8000",
  frontendPort: 3210,
};

function getConfigPath() {
  return path.join(path.dirname(process.execPath), "frontend.config.json");
}

function loadRuntimeConfig() {
  const configPath = getConfigPath();
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

contextBridge.exposeInMainWorld("labflowRuntimeConfig", loadRuntimeConfig());
