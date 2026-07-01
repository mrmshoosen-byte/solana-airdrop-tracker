# 📁 Complete File Directory & Index

This document describes every file in the Solana Airdrop Tracker project.

---

## 🎯 Documentation Files

### `README.md` (Primary Documentation)
- Complete project overview
- Features list and architecture
- Tech stack details
- Local setup instructions
- Deployment guide
- API endpoint documentation
- Database schema
- Troubleshooting guide
- **Status:** Must read first

### `DEPLOYMENT.md` (Vercel Deployment Guide)
- Step-by-step Vercel deployment
- Environment variable setup
- Database setup options
- Monitoring and troubleshooting
- Custom domain configuration
- Scaling considerations
- **Status:** Read before deploying

### `QUICK_START.md` (Quick Reference)
- Common commands cheat sheet
- File locations reference
- Quick troubleshooting
- Performance tips
- Security checklist
- Helpful links
- **Status:** Bookmark this!

### `PROJECT_SUMMARY.md` (This Project Overview)
- High-level project summary
- What was built
- Files created list
- Quick start guide
- Architecture overview
- Deployment checklist
- **Status:** You are here!

### `.env.example` (Environment Template)
- Template for environment variables
- Comments explaining each variable
- Example values
- Copy to `.env.local` before running
- **Keep:** Reference for deployment

---

## ⚙️ Configuration Files

### `package.json`
```json
{
  "name": "solana-airdrop-tracker",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:setup": "node scripts/setupDb.js"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    // ... 20+ more dependencies
  }
}
```
- All npm dependencies
- Build and run scripts
- Package metadata
- **Usage:** `npm install`, `npm run dev`

### `next.config.js`
- Next.js configuration
- Image optimization settings
- Server runtime config
- Public runtime config
- **Purpose:** Controls Next.js behavior

### `tailwind.config.js`
- Tailwind CSS configuration
- Color scheme definition
- Font family settings
- Plugin configuration
- **Purpose:** Styling framework setup

### `postcss.config.js`
- PostCSS configuration
- Tailwind and autoprefixer plugins
- CSS processing
- **Purpose:** CSS compilation pipeline

### `jsconfig.json`
- JavaScript configuration
- Path aliases (@/*)
- Compiler options
- **Purpose:** Enables import shortcuts

### `vercel.json`
- Vercel-specific configuration
- Environment variables
- Function configuration
- CORS headers
- Cache settings
- **Purpose:** Vercel deployment config

### `.gitignore`
- Files/folders to ignore from Git
- Node modules, build files
- Environment files (.env.local)
- IDE files, OS files
- **Purpose:** Keep repo clean

### `docker-compose.yml`
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    ports: [5432:5432]
    volumes: [postgres_data]
```
- PostgreSQL Docker configuration
- Local database setup
- Volume persistence
- Health checks
- **Purpose:** Local development database

---

## 🎨 Frontend Pages

### `pages/_app.js`
- Next.js app wrapper
- Global Head configuration
- Metadata and favicon
- Import global styles
- **Purpose:** App initialization

### `pages/index.js` (Home Page)
- Landing page
- "Start Sync" button
- Feature cards
- Project overview
- Animated background
- **Route:** `/`
- **Features:** Sync trigger, animations

### `pages/dashboard.js`
- Main dashboard
- Key metrics (total recipients, percentages)
- Pie chart - wallet distribution
- Bar chart - behavior breakdown
- Top sellers list
- Diamond hands list
- **Route:** `/dashboard`
- **Features:** Charts, animations, real-time data

### `pages/recipients.js`
- Recipients listing page
- Searchable recipient list
- Sort by amount or status
- Mobile-responsive table
- Status badges
- **Route:** `/recipients`
- **Features:** Search, sort, filter, pagination

### `pages/analytics.js`
- Detailed analytics page
- Key metrics grid
- Bar chart - wallet count
- Pie chart - percentages
- Top 15 sellers list
- Top 15 diamond hands list
- Summary statistics
- **Route:** `/analytics`
- **Features:** Deep dive charts, rankings

### `pages/search.js`
- Wallet search page
- Address search input
- Search results list
- Wallet details panel
- Status classification
- Activity summary
- **Route:** `/search`
- **Features:** Search, details, status tracking

---

## 🔗 API Routes

### `pages/api/sync.js`
```
POST /api/sync
```
- Initiates full airdrop scan
- Fetches all recipients from blockchain
- Analyzes wallet behavior
- Stores results in database
- Returns analytics summary
- **Handler:** Serverless function
- **Duration:** 2-5 minutes
- **Response:** { success, data }

### `pages/api/data/[action].js`
Dynamic route handling multiple actions:

- **GET `/api/data/analytics`** → Overall analytics
- **GET `/api/data/recipients`** → Recipient list
- **GET `/api/data/wallet-search`** → Search wallets
- **GET `/api/data/wallet-airdrop-status`** → Wallet status

**Features:**
- Query parameters handling
- Database queries
- Error handling
- Response formatting

---

## 📚 Service Classes (Business Logic)

### `lib/solanaService.js`
Blockchain interaction service.

**Key Methods:**
- `getAirdropRecipients(tokenMint)` - Fetch all recipients
- `getWalletTransactions(walletAddress)` - Get transaction history
- `detectSwapEvents(transactionSig)` - Find DEX activity
- `getWalletTokenBalance(address, mint)` - Current balance
- `getWalletTokenTransfers(address, tokenMint)` - Token movements
- `getTokenMetadata(tokenMint)` - Token info

**Uses:**
- Solana Web3.js
- Helius RPC API
- SPL Token program

### `lib/databaseService.js`
Database operation service.

**Key Methods:**
- `upsertToken()` - Store/update token
- `upsertWallet()` - Store/update wallet
- `storeAirdropRecipient()` - Record recipient
- `getAirdropRecipients()` - Query recipients
- `updateWalletTokenState()` - Update status
- `getTokenAnalytics()` - Get statistics
- `getTopSellers()` - Query top sellers
- `getDiamondHands()` - Query long-term holders
- `searchWallet()` - Search functionality

**Uses:**
- PostgreSQL via pg library
- Parameterized queries
- Connection pooling

### `lib/analyticsService.js`
Analytics and classification service.

**Key Methods:**
- `classifyWalletBehavior()` - SOLD/HELD/ACCUMULATED
- `calculateTimeToSell()` - Hours to sell
- `generateDistribution()` - Statistical analysis
- `estimateProfitLoss()` - P&L calculation
- `generateWalletSummary()` - Wallet overview
- `calculateConcentration()` - Whale analysis
- `generateTimeToSellDistribution()` - Time buckets
- `getBehavioralSegments()` - Segment data

**Uses:**
- Statistical calculations
- Classification logic
- Data formatting

---

## 💄 Styles

### `styles/globals.css`
Global CSS stylesheet.

**Contains:**
- Tailwind directives (@tailwind)
- CSS reset and base styles
- Custom animations
- Scrollbar styling
- Loading spinner
- Glass morphism effect
- Font smoothing
- Custom utilities

**Usage:** Imported in `_app.js`

---

## 🔧 Scripts

### `scripts/setupDb.js`
Database initialization script.

**Functionality:**
- Creates database connection
- Executes schema SQL
- Creates all tables
- Establishes indexes
- Sets up relationships
- Error handling

**Usage:** `npm run db:setup`

**Tables Created:**
1. tokens
2. wallets
3. airdrop_recipients
4. token_transfers
5. swap_events
6. wallet_token_states
7. sync_metadata

### `scripts/setup.sh`
Automated setup script (bash).

**Automates:**
- Dependency checking (Node, Docker)
- npm install
- Docker Compose start
- Database setup
- .env.local creation
- Status messages

**Usage:** `bash scripts/setup.sh`

**Requirements:** Bash, Docker, Node.js

---

## 🗂️ Directory Structure

```
airdrop-tracker/
├── pages/                          # Next.js pages
│   ├── _app.js                    # App wrapper
│   ├── index.js                   # Home page
│   ├── dashboard.js               # Dashboard
│   ├── recipients.js              # Recipients list
│   ├── analytics.js               # Analytics
│   ├── search.js                  # Search page
│   └── api/                       # API routes
│       ├── sync.js
│       └── data/[action].js
│
├── lib/                           # Services
│   ├── solanaService.js           # Blockchain
│   ├── databaseService.js         # Database
│   └── analyticsService.js        # Analytics
│
├── styles/
│   └── globals.css                # Global styles
│
├── scripts/
│   ├── setupDb.js                 # DB setup
│   └── setup.sh                   # Quick setup
│
├── Configuration/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── jsconfig.json
│   ├── vercel.json
│   ├── docker-compose.yml
│   └── .env.example
│
├── Documentation/
│   ├── README.md
│   ├── DEPLOYMENT.md
│   ├── QUICK_START.md
│   ├── PROJECT_SUMMARY.md
│   └── FILE_INDEX.md (this file)
│
└── Git/
    └── .gitignore
```

---

## 🚀 File Dependencies

### Frontend → Backend
```
pages/dashboard.js
    ↓
/api/data/analytics
    ↓
databaseService.js
    ↓
PostgreSQL
```

### Backend → Blockchain
```
/api/sync
    ↓
solanaService.js
    ↓
Helius API / Solana RPC
    ↓
Blockchain Data
```

### Database → Storage
```
databaseService.js
    ↓
PostgreSQL Driver (pg)
    ↓
PostgreSQL Database
```

---

## 📦 File Sizes (Approximate)

| File | Size | Type |
|------|------|------|
| package.json | 1 KB | Config |
| README.md | 8 KB | Doc |
| pages/dashboard.js | 6 KB | Page |
| pages/index.js | 4 KB | Page |
| lib/solanaService.js | 5 KB | Service |
| lib/databaseService.js | 8 KB | Service |
| lib/analyticsService.js | 5 KB | Service |
| styles/globals.css | 3 KB | CSS |

**Total Project Size:** ~100 KB (without node_modules)

---

## 🔑 Critical Files

**Must Have Before Running:**
- ✅ `package.json` - Dependencies
- ✅ `docker-compose.yml` - Database
- ✅ `.env.example` → `.env.local` - Configuration
- ✅ `scripts/setupDb.js` - Database setup

**Must Read Before Deploying:**
- ✅ `README.md` - Overview
- ✅ `DEPLOYMENT.md` - Vercel guide
- ✅ `.env.example` - Variables needed

**Must Keep Secure:**
- 🔒 `.env.local` - Never commit!
- 🔒 Database credentials
- 🔒 API keys

---

## 📝 Editing Guide

### To Add New Page:
1. Create `pages/yourpage.js`
2. Use existing pages as template
3. Add navigation link in header
4. Test at `/yourpage`

### To Add New API Endpoint:
1. Create `pages/api/yourapi.js`
2. Export default handler function
3. Call from frontend: `/api/yourapi`
4. Test with browser or curl

### To Modify Database:
1. Edit `scripts/setupDb.js`
2. Run `npm run db:setup`
3. Update `databaseService.js` methods

### To Change Styles:
1. Edit `styles/globals.css` or use Tailwind classes
2. Modify `tailwind.config.js` for theme
3. Changes apply immediately in dev mode

---

## ✅ File Verification Checklist

Before deployment, verify:
- [ ] All 26 files present
- [ ] `package.json` has correct dependencies
- [ ] `.env.example` has all variables
- [ ] `README.md` is complete
- [ ] Database schema in `scripts/setupDb.js`
- [ ] API routes in `pages/api/`
- [ ] Services in `lib/`
- [ ] Pages in `pages/`
- [ ] Styles in `styles/`

---

## 🆘 File Troubleshooting

| File | Issue | Solution |
|------|-------|----------|
| `.env.local` | Not found | Run `cp .env.example .env.local` |
| `docker-compose.yml` | Build fails | Update Docker to latest version |
| `package.json` | Version conflicts | Run `npm install --legacy-peer-deps` |
| `scripts/setupDb.js` | Schema error | Check PostgreSQL is running |
| `pages/_app.js` | Styles missing | Verify `styles/globals.css` imported |

---

## 📊 Statistics

- **Total Files:** 27
- **Configuration Files:** 9
- **Documentation Files:** 4
- **Pages:** 6
- **API Routes:** 2
- **Services:** 3
- **Scripts:** 2
- **Style Files:** 1
- **Total Lines of Code:** 2,500+
- **Total Size:** ~100 KB

---

## 🎓 Learning Path

1. Read `README.md` (Overview)
2. Read `QUICK_START.md` (Quick reference)
3. Review `pages/index.js` (Simple page example)
4. Review `lib/databaseService.js` (Core logic)
5. Review `pages/api/sync.js` (API example)
6. Read `DEPLOYMENT.md` (Before deploying)

---

**Happy coding! 🚀**

All files are production-ready and documented.
