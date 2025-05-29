# Quick Deploy Options for Your PWA

## Easiest Option: Deploy to Vercel (Free)

### 1. Deploy to Vercel First
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from painting-quote-app folder)
vercel

# Follow prompts, you'll get a URL like:
# https://painting-quote-app-abc123.vercel.app
```

### 2. Add Environment Variables in Vercel Dashboard
Go to your project settings and add:
- GEMINI_API_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

### 3. Link from Your Website
On your existing website, add a page or button:

```html
<!-- Simple link approach -->
<a href="https://painting-quote-app-abc123.vercel.app" target="_blank">
  Try Our Quote Tool (Beta)
</a>

<!-- Or a nice landing page -->
<div style="padding: 20px; text-align: center;">
  <h2>Try Our New Quote Tool!</h2>
  <p>Get instant painting quotes on your phone</p>
  <ol style="text-align: left; max-width: 400px; margin: 20px auto;">
    <li>Click the link below on your phone</li>
    <li>When prompted, "Add to Home Screen"</li>
    <li>Use it like a regular app!</li>
  </ol>
  <a href="https://painting-quote-app-abc123.vercel.app" 
     style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">
    Open Quote Tool
  </a>
</div>
```

## Even Simpler: Share Link Directly

Just share this with test users:
```
Hey, try our new quote tool!
1. Open this on your phone: [your-vercel-url]
2. Add to home screen when prompted
3. It works like an app!
```

## Custom Domain (Optional)

Later, you can:
1. Add a custom domain in Vercel (quotes.yoursite.com)
2. Point your domain's DNS to Vercel
3. Users visit: quotes.yoursite.com

## The Flow

1. You deploy to Vercel (free, takes 5 minutes)
2. You get a public URL
3. You share that URL with testers
4. They install it as a PWA on their phones
5. They test it and give feedback

No need to modify your existing website's hosting!