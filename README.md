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
3. Copy the Stripe settings from [.env.example](.env.example) into your environment and set `STRIPE_SECRET_KEY` to a Stripe test or live secret key. Set `APP_URL` to the public URL where customers return after checkout. Enable PayPal and Apple Pay in Stripe Dashboard under Payment methods. Register and verify the production domain under Payment method domains for Apple Pay.
4. Run the app:
   `npm run dev`

For GitHub Pages project hosting, this repository uses `/Komse-Design/` as its production base path. Set `VITE_API_URL` to the deployed Express backend URL before building. GitHub Pages can host the Vite frontend only; the Express server must run on a separate backend host. Set that backend's `FRONTEND_URL` to `https://dronegodone2022-netizen.github.io`.

For password reset links to work locally, add `http://localhost:3000/?reset_password=1` to Supabase **Authentication → URL Configuration → Redirect URLs**. Add the equivalent production URL before deploying.

To enable Google signup, configure Google under Supabase **Authentication → Providers → Google** with a Google OAuth client ID and secret. Add `http://localhost:3000/?auth=google` to Supabase **Redirect URLs**, and add the Supabase callback URL shown in the provider settings to the Google Cloud OAuth client's authorized redirect URIs.

Checkout uses Stripe-hosted payment pages with Stripe Dashboard-managed payment methods. Orders are added to the admin dashboard only after the returned Checkout Session is verified as paid. For production reliability, configure a Stripe webhook to repeat order fulfillment server-side rather than relying only on the browser return.
