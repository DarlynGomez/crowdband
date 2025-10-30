#!/bin/bash
# Auto-run type checking when TypeScript files change

echo "Running TypeScript type check..."
npm run type-check

if [ $? -eq 0 ]; then
  echo "✅ Type check passed"
else
  echo "❌ Type check failed"
  exit 1
fi
