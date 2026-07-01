# Quick Reference Guide 📚

## Common Commands

### Local Development

```bash
# Install dependencies
npm install

# Start PostgreSQL (first time only)
docker-compose up -d

# Initialize database
npm run db:setup

# Start development server
npm run dev

# Production build
npm run build
npm start

# Stop PostgreSQL
docker-compose down
```

### Database

```bash
# Connect to local PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/airdrop_tracker

# View all tables
\dt

# Exit psql
\q

# Reset database (WARNING: Deletes all data)
npm run db:setup
```

### Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to staging
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs your-project-name

# Pull environment variables
vercel env pull
```

### Git

```bash
# Initial commit
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Push to GitHub
git remote add origin https://github.com/USERNAME/solana-airdrop-tracker.git
git push -u origin main

# Update code
git add .
git commit -m "Your message"
git push origin main
```

## File Locations

| File | Purpose |
|------|---------|
| `.env.local` | Environment variables (LOCAL ONLY) |
| `.env.example` | Template for environment variables |
| `pages/` | Next.js pages and API routes |
| `lib/` | Reusable service classes |
| `styles/` | CSS and Tailwind styles |
| `scripts/` | Utility scripts |
| `docker-compose.yml` | PostgreSQL configuration |
| `vercel.json` | Vercel deployment config |

## API Endpoints Quick Reference

```
GET  /api/data/analytics              → Get all analytics
GET  /api/data/recipients             → Get recipient list
GET  /api/data/wallet-search          → Search wallet
GET  /api/data/wallet-airdrop-status  → Get wallet status
POST /api/sync                        → Start sync process
```

## Environment Variables Quick Reference

```env
DATABASE_URL=postgresql://...              # Required
HELIUS_API_KEY=...                        # Required
TOKEN_MINT=9cRCn9rGT8V2...                # Required
NODE_ENV=development|production           # Optional
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Database not found | Run `docker-compose up -d` then `npm run db:setup` |
| API errors | Check `.env.local` variables are set |
| Slow sync | Large airdrop? Normal. Check Helius rate limits |
| Port 3000 in use | `kill -9 $(lsof -t -i:3000)` or use `npm run dev -- -p 3001` |
| Build fails on Vercel | Check env vars, clear cache, redeploy |

## Performance Tips

✅ Enable caching: Set `CACHE_DURATION=3600`  
✅ Use batch processing: `SYNC_BATCH_SIZE=100`  
✅ Index database tables (auto-created)  
✅ Use Vercel Postgres connection pooling  
✅ Monitor logs: `vercel logs --follow`  

## Security Checklist

- [ ] Never commit `.env.local` or secrets
- [ ] Use Vercel Environment Variables for sensitive data
- [ ] Keep dependencies updated: `npm audit`
- [ ] Verify API keys are working but not exposed
- [ ] Use HTTPS in production (automatic with Vercel)
- [ ] Sanitize user input in searches

## Vercel Environment Variables Setup

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add variables one by one:
   - `DATABASE_URL` (Vercel Postgres connection string)
   - `HELIUS_API_KEY` (your API key)
   - `TOKEN_MINT` (token address to track)
   - `NODE_ENV` (set to "production")

## First Time Sync Checklist

Before clicking "Start Sync":

- [ ] `.env.local` or Vercel env vars set
- [ ] `DATABASE_URL` points to valid database
- [ ] `HELIUS_API_KEY` is valid and active
- [ ] `TOKEN_MINT` is correct Solana address
- [ ] Database schema created (`npm run db:setup`)
- [ ] App is running (local or deployed)

## Mobile Testing

```bash
# Test on mobile device
# 1. Find your computer's IP
ifconfig | grep inet

# 2. On mobile, visit
http://YOUR_COMPUTER_IP:3000
```

## Docker Basics

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres

# Reset database
docker-compose down -v
docker-compose up -d
npm run db:setup
```

## Performance Metrics

**Target Metrics:**
- Page load: < 2s
- Dashboard render: < 1s
- Sync speed: 50-100 recipients/minute
- Database query: < 100ms
- API response: < 500ms

## Monitoring in Production

```bash
# Check deployment status
vercel status

# View live logs
vercel logs your-project-name --follow

# Monitor database
# Via Vercel Postgres dashboard
```

## Common Error Messages

**"DATABASE_URL not configured"**
→ Set environment variables

**"Token not found on Solana"**
→ Verify TOKEN_MINT address is correct

**"No airdrop recipients found"**
→ Token may not have been distributed yet

**"HELIUS_API_KEY not configured"**
→ Add API key to environment variables

## Helpful Links

🔗 [Vercel Docs](https://vercel.com/docs)  
🔗 [Next.js Docs](https://nextjs.org/docs)  
🔗 [Solana Docs](https://docs.solana.com)  
🔗 [Helius API](https://docs.helius.xyz)  
🔗 [Tailwind CSS](https://tailwindcss.com/docs)  
🔗 [Recharts](https://recharts.org/)  

## Support

For issues:
1. Check this guide first
2. Review README.md
3. Check DEPLOYMENT.md for Vercel issues
4. Look at error messages in browser console
5. Check Vercel logs: `vercel logs`

---

**Save this guide as a bookmark! You'll reference it often.** 🚀
