@echo off
set NODE_OPTIONS=--max-old-space-size=8192
cd /d D:\projects\llcpad
node --max-old-space-size=8192 node_modules/next/dist/bin/next dev --port 3000
