**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Production Persistence Requirements**

Before production writes are considered permanent, configure Supabase/Postgres.

Required for sign-in:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Required for server-side durable writes:
- `DATABASE_URL`

or:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Without these variables, the app must run in demo/temporary mode. Sign-in is disabled in production until the Supabase frontend auth variables are present, and write flows must show demo-session status instead of implying permanent account, CRM, campaign, checkout, registration, event, perk, or workspace records.

For the map to load locally and in Vercel, set:
- `VITE_GOOGLE_MAPS_API_KEY`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
