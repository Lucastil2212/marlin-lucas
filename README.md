# Marlín Lucas Music Player

A beautiful, interactive music player website with SVG animations, Stripe payment integration, and download functionality.

## Features

- 🎵 Full music player with playlist functionality
- 🎨 Stunning SVG animations for each song
- 💳 Stripe payment integration for downloads ($5 single / $10 full package)
- ❤️ Donation button to support the artist directly
- 📧 Email signup for lyrics & stems updates
- 🔗 Shareable song links
- 🎯 Payment issue support form

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from https://dashboard.stripe.com/apikeys
3. Create a `.env` file (copy from `env.example`):

```bash
cp env.example .env
```

4. Add your Stripe keys to `.env`:

```
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**For Testing:**
- Use test keys (they start with `sk_test_` and `pk_test_`)
- Test card: `4242 4242 4242 4242`
- Any future expiry date, any CVC

### 3. Set Up Stripe Webhooks (Important!)

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `https://yourdomain.com/api/webhook`
4. Select events: `payment_intent.succeeded`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in your `.env`

**For Local Testing:**
- Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook`
- Copy the webhook secret from the CLI output

### 4. Configure Payment Prices (Optional)

Edit prices in `.env` (amounts in cents):

```
SINGLE_SONG_PRICE=500  # $5.00
FULL_PACKAGE_PRICE=1000  # $10.00
MIN_DONATION_AMOUNT=100  # $1.00
```

### 5. Start the Server

```bash
npm start
```

The server will run at `http://localhost:3000`

## File Structure

- `index.html` - Main HTML structure
- `styles.css` - All styling and animations
- `script.js` - Music player logic and Stripe integration
- `server.js` - Express server with Stripe API endpoints
- `env.example` - Example environment variables
- `data/` - Stores payment records and email signups (created automatically)

## Payment Flow

1. User clicks download button
2. Payment modal opens with Stripe card input
3. Payment processed via Stripe
4. On success, file downloads automatically
5. Payment record stored in `data/payments.json`

## Donations

Users can donate any amount (minimum $1.00) directly to support the artist. All donations are processed securely through Stripe.

## Payment Issues

If a user paid but didn't receive their files, they can:
1. Enter their email in the "Payment Issue" form
2. Their email is stored in `data/payment-issues.json`
3. You can manually send them the files

## Email Signups

Email addresses are stored in:
- Lyrics/stems signup: `localStorage` (frontend)
- Payment issues: `data/payment-issues.json` (backend)

**To integrate with email service:**
- Uncomment email sending code in `server.js`
- Add your email service API key to `.env`
- Configure `FROM_EMAIL` and `TO_EMAIL`

## Production Deployment

1. Set up environment variables on your hosting platform
2. Update webhook URL in Stripe dashboard
3. Switch to live Stripe keys (`sk_live_` and `pk_live_`)
4. Set up SSL certificate (required for Stripe)
5. Ensure `data/` directory is writable

## Support

For issues or questions, check:
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Docs: https://stripe.com/docs
- Payment records: `data/payments.json`
- Donation records: `data/donations.json`

## License

ISC
