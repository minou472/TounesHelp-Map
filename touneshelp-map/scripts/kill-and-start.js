const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const projectDir = path.join(__dirname, "..");

console.log("=== Starting TounesHelp-Map ===\n");

// Step 1: Kill all node processes
console.log("1. Killing all Node.js processes...");
try {
  execSync("taskkill /F /IM node.exe", { stdio: "pipe", cwd: projectDir });
  console.log("   Done\n");
} catch (e) {
  console.log("   No node processes running\n");
}

// Step 2: Delete .next folder
console.log("2. Deleting .next folder...");
const nextDir = path.join(projectDir, ".next");
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("   Deleted\n");
} else {
  console.log("   Already deleted\n");
}

// Step 3: Delete node_modules/.cache
console.log("3. Cleaning node_modules cache...");
const cacheDir = path.join(projectDir, "node_modules/.cache");
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log("   Cleaned\n");
} else {
  console.log("   No cache found\n");
}

// Step 4: Start the server
console.log("4. Starting development server...\n");
console.log("=====================================\n");

const server = spawn("npx", ["next", "dev", "-p", "3004"], {
  cwd: projectDir,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NODE_ENV: "development" },
});

server.on("error", (err) => {
  console.error("Error starting server:", err);
});

server.on("close", (code) => {
  console.log(`Server exited with code ${code}`);
});

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\nShutting down...");
  server.kill();
  process.exit();
});
