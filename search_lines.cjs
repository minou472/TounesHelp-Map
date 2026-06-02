const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "app", "components", "touneshelp", "UserDashboard.tsx");
const lines = fs.readFileSync(filePath, "utf-8").split("\n");

console.log("Lines in UserDashboard.tsx containing 'heart' or 'sorry':");
lines.forEach((line, index) => {
  if (line.toLowerCase().includes("heart") || line.toLowerCase().includes("sorry")) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
