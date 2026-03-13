const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectDir = __dirname;

console.log("Cleaning .next folder...");
const nextDir = path.join(projectDir, ".next");
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log(".next folder deleted");
} else {
  console.log(".next folder does not exist");
}

console.log("Building project...");
try {
  execSync("npm run build", { cwd: projectDir, stdio: "inherit" });
  console.log("Build completed successfully!");
} catch (error) {
  console.error("Build failed:", error.message);
  process.exit(1);
}
