#!/bin/bash

# Solana Airdrop Tracker - Quick Start Script
# This script automates the local development setup

echo "🚀 Solana Airdrop Tracker - Quick Start"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node -v) found"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker from https://docker.com"
    exit 1
fi
echo "✅ Docker found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi
echo "✅ Dependencies installed"

# Start PostgreSQL
echo ""
echo "🐘 Starting PostgreSQL..."
docker-compose up -d
sleep 3

# Check if database is ready
echo "⏳ Waiting for database to be ready..."
for i in {1..30}; do
    docker exec airdrop-tracker-db pg_isready -U postgres > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL failed to start"
        exit 1
    fi
    sleep 1
done

# Setup database
echo ""
echo "🗄️  Setting up database schema..."
npm run db:setup
if [ $? -ne 0 ]; then
    echo "❌ Database setup failed"
    exit 1
fi
echo "✅ Database schema created"

# Create .env.local
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your:"
    echo "   - HELIUS_API_KEY (get from https://dev.helius.xyz)"
    echo "   - TOKEN_MINT (already set to: 9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump)"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "======================================"
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local with your Helius API key"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo "4. Click '🚀 Start Sync' to sync airdrop data"
echo ""
echo "📚 Documentation: See README.md"
echo "======================================"
