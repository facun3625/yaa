#!/bin/bash
# Deploy de YAA en el VPS. Correr desde /root/yaa/yaa:
#   bash deploy.sh
set -e

echo "== git pull =="
git pull origin main

echo "== npm install =="
npm install

echo "== prisma migrate deploy =="
npx prisma migrate deploy

echo "== prisma generate =="
npx prisma generate

echo "== build limpio =="
pm2 stop yaa
rm -rf .next
npm run build

echo "== reiniciar =="
pm2 restart yaa

echo "== listo — últimas líneas del log =="
sleep 2
pm2 logs yaa --lines 15 --nostream
