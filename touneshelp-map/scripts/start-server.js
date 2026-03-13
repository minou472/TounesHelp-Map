const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectDir = path.join(__dirname, "..");

console.log("=== TounesHelp-Map Server Starter ===\n");

// 1. Kill any running node processes
console.log("1. Stopping any running Node.js processes...");
try {
  execSync("taskkill /F /IM node.exe", { stdio: "ignore" });
  console.log("   Stopped");
} catch (e) {
  console.log("   No running processes");
}

// 2. Delete .next folder
console.log("\n2. Deleting .next cache folder...");
const nextDir = path.join(projectDir, ".next");
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("   Deleted .next folder");
} else {
  console.log("   .next folder does not exist");
}

// 3. Start the dev server
console.log("\n3. Starting development server...\n");

const server = spawn("npm", ["run", "dev"], {
  cwd: projectDir,
  stdio: "inherit",
  shell: true,
});

server.on("error", (err) => {
  console.error("Failed to start server:", err);
});

process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  server.kill();
  process.exit();
});
