#!/bin/bash
# Automatically rebuild client and server on file changes

echo "🔨 Building client and server..."

npm run build:client &
CLIENT_PID=$!

npm run build:server &
SERVER_PID=$!

wait $CLIENT_PID
wait $SERVER_PID

if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi
