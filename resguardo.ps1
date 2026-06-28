$fecha = Get-Date -Format "yyyy-MM-dd"
New-Item -ItemType Directory -Force -Path "resguardos_tpi\$fecha" | Out-Null

mongodump `
  --uri="$env:MONGO_URI" `
  --db="tpi_steam_db" `
  --out="resguardos_tpi\$fecha"

Write-Host "Resguardo completado en resguardos_tpi\$fecha"
