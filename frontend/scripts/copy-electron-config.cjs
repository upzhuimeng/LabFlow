const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const source = path.join(rootDir, "frontend.config.json.example");
const outputDir = path.join(rootDir, "dist-electron");
const target = path.join(outputDir, "frontend.config.json");
const releaseDir = path.join(outputDir, "portable-release");

if (!fs.existsSync(source)) {
  throw new Error(`Missing config template: ${source}`);
}

if (!fs.existsSync(outputDir)) {
  throw new Error(`Missing output directory: ${outputDir}`);
}

fs.copyFileSync(source, target);
console.log(`Copied runtime config to ${target}`);

const exeName = fs
  .readdirSync(outputDir)
  .find((name) => /^LabFlowFrontend .*\.exe$/i.test(name));

if (!exeName) {
  throw new Error(`Cannot find portable exe in ${outputDir}`);
}

if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const sourceExe = path.join(outputDir, exeName);
const targetExe = path.join(releaseDir, exeName);
const targetConfig = path.join(releaseDir, "frontend.config.json");

fs.copyFileSync(sourceExe, targetExe);
fs.copyFileSync(source, targetConfig);
console.log(`Prepared portable release in ${releaseDir}`);
