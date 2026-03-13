# Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Killed all Node.js processes"

# Wait a moment
Start-Sleep -Seconds 2

# Delete .next folder
$nextPath = "C:\Users\HP\OneDrive\Desktop\projects\TounesHelp-Map\touneshelp-map\.next"
if (Test-Path $nextPath) {
    Remove-Item -Path $nextPath -Recurse -Force
    Write-Host "Deleted .next folder"
}
else {
    Write-Host ".next folder does not exist"
}

# Clean node_modules cache
$cachePath = "C:\Users\HP\OneDrive\Desktop\projects\TounesHelp-Map\touneshelp-map\node_modules\.cache"
if (Test-Path $cachePath) {
    Remove-Item -Path $cachePath -Recurse -Force
    Write-Host "Cleaned node_modules cache"
}

Write-Host ""
Write-Host "Starting server..."
Write-Host ""

# Start the dev server
cd "C:\Users\HP\OneDrive\Desktop\projects\TounesHelp-Map\touneshelp-map"
npm run dev
