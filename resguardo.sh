#!/bin/bash

FECHA=$(date +%Y-%m-%d)
mkdir -p resguardos_tpi/$FECHA

mongodump \
  --uri="$MONGO_URI" \
  --db="tpi_steam_db" \
  --out="resguardos_tpi/$FECHA"

echo "Resguardo completado en resguardos_tpi/$FECHA"
