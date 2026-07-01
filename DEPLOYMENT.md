# Deployment Guide - Vercel 🚀

This guide will walk you through deploying the Solana Airdrop Tracker to Vercel in minutes.

## Prerequisites

✅ GitHub account (free)  
✅ Vercel account (free)  
✅ Helius API key (free from https://dev.helius.xyz)  

## Step-by-Step Deployment

### 1. Prepare for GitHub

Make sure your code is ready:

```bash
# From project root
git init
git add .
git commit -m "Initial commit: Solana Airdrop Tracker"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Name: `solana-airdrop-tracker`
3. Description: "Solana token airdrop tracker and wallet behavior analyzer"
4. Make it **Public** (required for Vercel free tier)
5. Click "Create repository"

### 3. Push Code to GitHub

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/solana-airdrop-tracker.git
git push -u origin main
```

### 4. Connect to Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/new
2. Sign in with GitHub (or create account)
3. Click "Import Git Repository"
4. Paste: `https://github.com/YOUR_USERNAME/solana-airdrop-tracker.git`
5. Click "Import"

**Option B: Using Vercel CLI**

```bash
npm install -g vercel
vercel --prod
```

### 5. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add these variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | See below for setup |
| `HELIUS_API_KEY` | Your API key | From https://dev.helius.xyz |
| `TOKEN_MINT` | `9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump` | Can change to different token |
| `NODE_ENV` | `production` | Always use production |

### 6. Setup Vercel Postgres (Recommended)

This is the easiest way to get a production database:

**In Vercel Dashboard:**

1. Go to Storage tab → Create Database → Select Postgres
2. Choose region closest to you
3. Click Create
4. Copy the `POSTGRES_PRISMA_URL` (full connection string)
5. Paste as `DATABASE_URL` environment variable

**Initialize Database:**

After setting environment variables, run migrations:

```bash
# Connect to Vercel
vercel env pull

# Or manually set DATABASE_URL and run:
npm run db:setup
```

### 7. Deploy

**Automatic (Recommended):**
```bash
git push origin main
```
Vercel automatically deploys on push!

**Manual:**
```bash
vercel --prod
```

Your app is now live at: `your-project-name.vercel.app` 🎉

## Database Setup Options

### Option 1: Vercel Postgres (⭐ Recommended)
- **Cost:** Free tier included
- **Setup:** 5 minutes via Vercel Dashboard
- **Management:** Via Vercel UI
- **Best for:** Production use

### Option 2: Railway.app
- **Cost:** Free tier: $5/month credit
- **Setup:** Connect GitHub to Railway
- **Management:** Railway dashboard
- **Link:** https://railway.app/new/postgres

### Option 3: Neon.tech
- **Cost:** Free tier included
- **Setup:** Create project, get connection string
- **Management:** Neon dashboard
- **Link:** https://console.neon.tech

### Option 4: Heroku Postgres
- **Cost:** ~$9-15/month
- **Setup:** Via Heroku add-ons
- **Management:** Heroku dashboard

## Syncing Data on Vercel

After deployment, sync airdrop data:

1. Visit your deployed app: `https://your-project.vercel.app`
2. Click "🚀 Start Sync" button
3. Wait for completion (2-5 minutes depending on recipient count)
4. View results in Dashboard, Recipients, Analytics

**Note:** First sync may take time. Subsequent syncs pull from cache.

## Monitoring & Troubleshooting

### Check Deployment Status
- Vercel Dashboard → Deployments tab
- Look for green checkmark

### View Logs
```bash
# Tail logs in real-time
vercel logs your-project-name

# Or via Vercel Dashboard → Deployments → Logs
```

### Common Issues

**❌ Database Connection Failed**
```
Solution: Check DATABASE_URL environment variable in Vercel
- Copy exact connection string
- Verify no typos
- Test locally first
```

**❌ Build Failed**
```
Solution: Check build logs in Vercel Dashboard
- npm dependencies correct?
- Environment variables set?
- Node version compatible?
```

**❌ API Errors After Deployment**
```
Solution: 
1. Check DATABASE_URL is set
2. Verify HELIUS_API_KEY is valid
3. Check Vercel logs for errors
4. Try running sync again
```

**❌ Sync Takes Too Long**
```
Solution:
- Large number of recipients? Expected behavior
- Check Vercel logs for progress
- Helius rate limit? Try later
- Increase SYNC_BATCH_SIZE in env vars
```

## Performance Optimization

### Enable Caching
```env
CACHE_DURATION=3600  # 1 hour
```

### Optimize Database
- Use Vercel Postgres with connection pooling
- Database indexes auto-created by setup script

### CDN Configuration
- Vercel Edge Network handles CDN automatically
- Static assets cached globally

## Security Checklist

✅ Environment variables secured (not in code)  
✅ Database credentials in Vercel secrets  
✅ API keys never exposed  
✅ HTTPS enabled (automatic with Vercel)  
✅ CORS configured properly  

## Custom Domain

Add your own domain to Vercel:

1. Dashboard → Settings → Domains
2. Add your domain (e.g., tracker.mysite.com)
3. Update DNS records per Vercel instructions
4. DNS validation completes in ~5 minutes

## Auto-Deployments

Every push to main branch auto-deploys:

```bash
git add .
git commit -m "Update airdrop token"
git push origin main
# Vercel automatically deploys! ✅
```

Disable auto-deploy: Vercel Dashboard → Settings → Git

## Rollback Previous Deploy

If something breaks:

```bash
# Via CLI
vercel rollback

# Or Dashboard → Deployments → Select version → Promote to Production
```

## Environment Variable Rotation

**Update API Key:**

1. Get new Helius API key
2. Update in Vercel Dashboard
3. No redeploy needed (uses immediately)

**Update Database URL:**

1. Get new connection string
2. Update DATABASE_URL in Vercel
3. Test with sync button
4. Redeploy if needed

## Scaling Considerations

**Free Tier Limits:**
- 12 serverless function invocations per second
- 60 seconds function execution time
- 50 concurrent connections

**For Higher Volume:**
- Upgrade to Vercel Pro ($20/month)
- Increase function timeout to 5 minutes
- Add database read replicas

## Monitoring

### Vercel Analytics
- Dashboard → Analytics
- Monitor deployment frequency
- Track function execution times

### Database Monitoring
- Vercel Postgres Dashboard
- Monitor connection count
- Check query performance

## Troubleshooting Checklist

- [ ] Environment variables set in Vercel
- [ ] GitHub repository is public
- [ ] Database URL connection verified
- [ ] Helius API key valid and active
- [ ] TOKEN_MINT address correct
- [ ] Build logs show no errors
- [ ] First sync completed successfully
- [ ] Dashboard loads without errors

## Getting Help

1. **Vercel Docs:** https://vercel.com/docs
2. **Solana Docs:** https://docs.solana.com
3. **Helius API:** https://docs.helius.xyz
4. **Next.js Docs:** https://nextjs.org/docs

## Monitoring Real-time Updates

After deployment, sync runs can be monitored via:

1. Vercel function logs
2. Database query logs
3. Frontend loading state

Monitor production analytics:
```bash
vercel logs your-project-name --follow
```

---

**Your app is now live! 🎉**

Next step: Share your tracker with the Solana community!
