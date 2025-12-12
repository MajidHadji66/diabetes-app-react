Write-Host "Starting DiaSync App (Frontend + Backend)..." -ForegroundColor Cyan

# Check if node_modules exists, install if missing
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

if (!(Test-Path "server\node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    cd server
    npm install
    cd ..
}

# Run the concurrently script
npm run dev
