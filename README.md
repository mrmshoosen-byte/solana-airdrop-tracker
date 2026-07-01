# Solana Airdrop Tracker 📊

A professional-grade web application for tracking and analyzing Solana token airdrop recipient behavior in real-time. Track which wallets sold, held, or accumulated more tokens after airdrops.

## 🎯 Features

✅ **Real-time Analytics** - Live data from Solana blockchain  
✅ **Wallet Behavior Classification** - Sold (Paper Hands), Held (Diamond Hands), Accumulated (Believers)  
✅ **Advanced Search** - Find any wallet and analyze their complete activity  
✅ **Professional Dashboard** - Beautiful black-themed UI with Recharts visualizations  
✅ **Mobile Responsive** - Works perfectly on desktop, tablet, and mobile  
✅ **One-time Sync** - Efficient data collection and caching  
✅ **Production Ready** - Built for Vercel deployment  

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js App   │  ← Frontend (React) + API Routes
│   (Vercel)      │
└────────┬────────┘
         │
    ┌────▼─────────────┐
    │  PostgreSQL DB   │  ← Data persistence
    │  (Vercel/Local)  │
    └─────────────────┘
         │
    ┌────▼─────────────────────┐
    │  Solana Blockchain (RPC)  │  ← Via Helius API
    │  - getAirdropRecipients   │
    │  - getWalletTransactions  │
    │  - detectSwapEvents       │
    │  - getWalletTokenBalance  │
    └───────────────────────────┘
```

## 📋 Tech Stack

**Frontend:**
- Next.js 14
- React 18
- Tailwind CSS 3
- Recharts (charting)
- Framer Motion (animations)

**Backend:**
- Node.js (Next.js API routes)
- Express-compatible serverless functions
- PostgreSQL 15

**Blockchain:**
- Solana Web3.js
- Helius API (RPC)
- SPL Token Standard

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Helius API Key (free from https://dev.helius.xyz)

### Step 1: Clone & Install

```bash
cd airdrop-tracker
npm install
```

### Step 2: Start PostgreSQL

```bash
docker-compose up -d
```

Verify it's running:
```bash
docker ps
```

### Step 3: Setup Database

```bash
npm run db:setup
```

### Step 4: Configure Environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/airdrop_tracker
HELIUS_API_KEY=your_api_key_here
TOKEN_MINT=9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump
NODE_ENV=development
```

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6: Sync Airdrop Data

1. Click "🚀 Start Sync" on the home page
2. Wait for completion (can take several minutes depending on recipient count)
3. View results in Dashboard → Recipients → Analytics

## 🚀 Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/airdrop-tracker.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select Next.js as framework

### Step 3: Configure Environment Variables

In Vercel project settings → Environment Variables:

```
DATABASE_URL = postgresql://...vercel-postgres...
HELIUS_API_KEY = your_api_key
TOKEN_MINT = 9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump
NODE_ENV = production
```

### Step 4: Setup Vercel Postgres (Recommended)

1. In Vercel Dashboard → Storage → Create Database
2. Select Postgres
3. Copy connection string to `DATABASE_URL` env var
4. Run migrations:

```bash
npm run db:setup
```

### Step 5: Deploy

```bash
git push origin main
```

Vercel auto-deploys on push. View your live app at `your-project.vercel.app`

## 📚 API Endpoints

### Sync Airdrop Data
```
POST /api/sync
Response: { success, data: { token, summary, topSellers, diamondHands } }
```

### Get Analytics
```
GET /api/data/analytics
Response: { analytics, topSellers, diamondHands }
```

### Get Recipients
```
GET /api/data/recipients?limit=100
Response: { recipients: [{ address, airdropAmount, currentBalance, status }] }
```

### Search Wallet
```
GET /api/data/wallet-search?address=...
Response: { results: [{ address, airdropsReceived }] }
```

### Get Wallet Status
```
GET /api/data/wallet-airdrop-status?address=...
Response: { walletAddress, status, currentBalance, ... }
```

## 🗂️ Project Structure

```
airdrop-tracker/
├── pages/
│   ├── _app.js                 # Next.js app wrapper
│   ├── index.js                # Home page
│   ├── dashboard.js            # Main dashboard
│   ├── recipients.js           # Recipients listing
│   ├── analytics.js            # Detailed analytics
│   ├── search.js               # Wallet search
│   └── api/
│       ├── sync.js             # Sync endpoint
│       └── data/[action].js    # Data endpoints
├── lib/
│   ├── solanaService.js        # Blockchain interactions
│   ├── databaseService.js      # Database operations
│   └── analyticsService.js     # Analytics logic
├── styles/
│   └── globals.css             # Global styles
├── scripts/
│   └── setupDb.js              # Database initialization
├── docker-compose.yml          # Local PostgreSQL
├── next.config.js              # Next.js config
├── tailwind.config.js          # Tailwind config
├── postcss.config.js           # PostCSS config
├── package.json                # Dependencies
├── .env.example                # Environment template
└── README.md                   # This file
```

## 🔑 Core Functions

### `SolanaService.getAirdropRecipients(tokenMint)`
Fetches all wallets that received the airdrop token using Solana's token supply API.

```javascript
const recipients = await solana.getAirdropRecipients(tokenMint);
// Returns: [{ address, currentBalance, tokenAccount, lastUpdate }]
```

### `SolanaService.getWalletTokenBalance(walletAddress, tokenMint)`
Gets current token balance for a specific wallet.

```javascript
const balance = await solana.getWalletTokenBalance(address, mint);
// Returns: { balance, rawBalance, decimals }
```

### `AnalyticsService.classifyWalletBehavior()`
Classifies wallet behavior based on transaction history.

```javascript
const behavior = AnalyticsService.classifyWalletBehavior(
  airdropAmount,
  currentBalance,
  totalSold,
  totalBought
);
// Returns: 'SOLD' | 'HELD' | 'ACCUMULATED'
```

### `DatabaseService.getTokenAnalytics(tokenId)`
Gets comprehensive analytics for a token.

```javascript
const stats = await db.getTokenAnalytics(tokenId);
// Returns: { total_recipients, sold_count, held_count, accumulated_count, percentages }
```

## 📊 Database Schema

**tokens** - Token metadata  
**wallets** - Unique wallet addresses  
**airdrop_recipients** - Airdrop distribution records  
**token_transfers** - Token transfer events  
**swap_events** - DEX swap activity  
**wallet_token_states** - Current wallet state per token  
**sync_metadata** - Sync progress tracking  

## 🔄 Sync Process

1. **Fetch Token Info** → Get decimals, supply
2. **Find Recipients** → Get all airdrop recipients
3. **Analyze Each Wallet**:
   - Get current balance
   - Check transaction history
   - Detect swap events
   - Classify behavior (SOLD/HELD/ACCUMULATED)
4. **Store Results** → Update database with findings
5. **Calculate Analytics** → Generate statistics

## 🎨 UI Pages

- **Home** - Sync initiation and overview
- **Dashboard** - Key metrics and top charts
- **Recipients** - Complete recipient list with filtering/sorting
- **Analytics** - Detailed charts and statistics
- **Search** - Individual wallet deep dive

All pages are fully mobile responsive with professional dark theme.

## ⚙️ Configuration

### Environment Variables

```env
# Database (required)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Blockchain (required)
HELIUS_API_KEY=your_api_key
TOKEN_MINT=token_mint_address

# Optional
NODE_ENV=production|development
SYNC_BATCH_SIZE=100
CACHE_DURATION=60
```

### Database Connection

**Local (Docker):**
```
postgresql://postgres:postgres@localhost:5432/airdrop_tracker
```

**Vercel Postgres:**
```
postgresql://[user]:[password]@[host]:5432/[database]
```

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart Docker
docker-compose restart postgres

# Verify connection
psql postgresql://postgres:postgres@localhost:5432/airdrop_tracker
```

### Helius API Rate Limit
- Increase sync batch size in `.env`
- Add delays between requests
- Upgrade Helius plan for higher limits

### No Recipients Found
- Verify TOKEN_MINT is correct
- Check if token has been distributed
- Try different token address

### Vercel Deployment Issues
- Check environment variables are set
- Verify DATABASE_URL is accessible from Vercel
- Check build logs in Vercel dashboard

## 📈 Performance Considerations

- **Caching** - Results cached for 60 minutes by default
- **Batch Processing** - Wallets processed in batches to avoid rate limits
- **Database Indexes** - Optimized queries with proper indexing
- **CDN** - Vercel Edge Network caches static assets

## 🔒 Security

- Environment variables stored securely in Vercel
- No private keys or sensitive data in code
- PostgreSQL connections require authentication
- API endpoints validated and sanitized

## 📝 License

MIT License - Feel free to use and modify

## 🤝 Contributing

Contributions welcome! Please fork and submit pull requests.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review blockchain data accuracy
3. Verify environment configuration
4. Check Vercel logs for errors

---

**Built for analyzing real Solana blockchain data** ⛓️✨

Made with ❤️ for the Solana community
