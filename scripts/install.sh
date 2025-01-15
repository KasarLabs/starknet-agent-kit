#!/bin/bash

echo "🔍 Checking environment..."
echo "Node $(node -v)"
echo "PNPM $(pnpm -v)"

echo "🧹 Cleaning previous installations..."
pnpm clean

echo "📦 Installing dependencies..."
pnpm install

echo "⚙️ Setting up Next.js environment..."
cd client
cp .env.example .env.local 2>/dev/null || true
cd ..

echo "🔨 Building projects..."
pnpm build

echo "✅ Installation complete!"