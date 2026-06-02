const fs = require("fs");
const path = require("path");

function searchDir(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath, query);
    } else if (stat.isFile() && (file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".js") || file.endsWith(".css"))) {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (content.toLowerCase().includes(query.toLowerCase())) {
        console.log(`Found "${query}" in: ${fullPath}`);
      }
    }
  }
}

console.log("Searching for 'heart'...");
searchDir(path.join(__dirname, "src"), "heart");

console.log("\nSearching for 'sorry'...");
searchDir(path.join(__dirname, "src"), "sorry");

console.log("\nSearching for 'support'...");
searchDir(path.join(__dirname, "src"), "support");
