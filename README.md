<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/34cc0765-4c1f-4950-ba7a-900a64c2ba11

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Copy the Stripe settings from [.env.example](.env.example) into your environment and set `STRIPE_SECRET_KEY` to a Stripe test or live secret key. Set `STRIPE_WEBHOOK_SECRET` to the signing secret for `POST /api/stripe-webhook`, and set `APP_URL` to the public URL where customers return after checkout. Enable PayPal and Apple Pay in Stripe Dashboard under Payment methods. Register and verify the production domain under Payment method domains for Apple Pay.
4. Run the app:
   `npm run dev`

For GitHub Pages project hosting, this repository uses `/Komse-Design/` as its production base path. Set `VITE_API_URL` to the deployed Express backend URL before building. GitHub Pages can host the Vite frontend only; the Express server must run on a separate backend host. Set that backend's `FRONTEND_URL` to `https://dronegodone2022-netizen.github.io`.

GitHub Actions validates and deploys the frontend, but it cannot run an interactive Stripe checkout or host the payment webhook. For end-to-end payment testing, deploy the Node backend first (Render or a Hostinger Node.js service), configure its server-only environment variables, and point the GitHub Actions `VITE_API_URL` variable to that backend. When moving the frontend to Hostinger, keep the same backend URL or deploy the backend there as well; update Stripe's webhook endpoint and `APP_URL` to the final public URLs.

The Node backend starts with `npm start` and exposes `GET /health` for deployment health checks. Deploy the repository root to a Node host, set the server environment variables from `.env.example`, and use the resulting backend URL as the frontend `VITE_API_URL` value.

For password reset links to work locally, add `http://localhost:3000/?reset_password=1` to Supabase **Authentication → URL Configuration → Redirect URLs**. Add the equivalent production URL before deploying.

To enable Google signup, configure Google under Supabase **Authentication → Providers → Google** with a Google OAuth client ID and secret. Add `http://localhost:3000/?auth=google` to Supabase **Redirect URLs**, and add the Supabase callback URL shown in the provider settings to the Google Cloud OAuth client's authorized redirect URIs.

Checkout uses Stripe-hosted payment pages with Stripe Dashboard-managed payment methods. Configure a Stripe Dashboard webhook for `https://YOUR_API_HOST/api/stripe-webhook` with the `checkout.session.completed` event. The webhook persists paid orders server-side; the browser return also verifies and upserts the session so customers still see confirmation immediately.

### Supabase-only backend option

The payment path can run without Render using the Edge Functions in `supabase/functions/stripe-checkout` and `supabase/functions/stripe-webhook`. Deploy them with the Supabase CLI, set the function secrets (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`, and email settings), apply `supabase-migration.sql`, and configure Stripe's webhook URL as `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`. Set `VITE_SUPABASE_FUNCTIONS_URL` to `https://YOUR_PROJECT.supabase.co/functions/v1` or let the frontend derive it from `VITE_SUPABASE_URL`.
