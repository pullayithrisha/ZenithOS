# ZenithOS

ZenithOS is a production-ready, premium habit tracker and coding productivity dashboard. It combines standard habit tracking with developer-focused integrations (GitHub, LeetCode) to provide a unified overview of your daily productivity.

Built with **Next.js 15, React 19, Tailwind CSS, Supabase, and Framer Motion**, featuring a fully responsive dark-glassmorphism aesthetic.

## Features
- **Authentication**: Secure Google OAuth powered by Supabase Auth.
- **Interactive Dashboard**: Track your daily habits, streaks, and XP progression with Realtime PostgreSQL subscriptions.
- **Developer Integrations**: Live GitHub repository and LeetCode problem-solving statistics via highly-cached Next.js Route Handlers (100% free API tier compliance).
- **Gamification**: Earn XP, build streaks, and visualize your progress on an interactive GitHub-style heatmap.
- **Analytics**: Deep dive into your data with pie charts, line graphs, and completion trends powered by Recharts.
- **Data Portability**: Instantly export your tracked habits as JSON or CSV.
- **Progressive Web App (PWA)**: Installable on Mobile and Desktop with offline caching support.

---

## 🚀 Setup Guide

### Prerequisites
1. **Node.js**: v18+ (v20 recommended)
2. **Supabase Account**: (Free tier)
3. **Google Cloud Console**: For OAuth Credentials

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Navigate to **Authentication > Providers** and enable **Google**.
   - Input your Google Client ID and Secret (from Google Cloud Console).
   - Add your Supabase Callback URL (`https://<project>.supabase.co/auth/v1/callback`) to your Google Cloud OAuth Client ID configuration.
3. Navigate to **SQL Editor** in Supabase and run the migration script located at `supabase/migrations/20260615000000_initial_schema.sql` to generate all tables, triggers, and Row Level Security policies.

### 2. Environment Variables
Create a `.env.local` file in the root directory by duplicating `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Local Development
Install dependencies and run the local development server:

```bash
npm install
npm run dev
```

ZenithOS will be available at `http://localhost:3000`.

---

## 🌐 Vercel Deployment

Deploying to Vercel is highly recommended and 100% free.

1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your GitHub repository.
4. Expand the **Environment Variables** section and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (Set this to your Vercel production URL, e.g., `https://zenithos.vercel.app`)
5. **IMPORTANT**: In your Supabase Dashboard, go to **Authentication > URL Configuration**, and add your Vercel production URL to the **Site URL** and **Redirect URLs** list.
6. Click **Deploy**.

## 🛠️ Architecture

- **Framework**: Next.js App Router
- **Database & Auth**: Supabase SSR
- **State Management**: Zustand (Client-side fast optimistic updates)
- **Styling**: Tailwind CSS (Native nested styling via `@tailwindcss/postcss`)
- **Charts**: Recharts & React Calendar Heatmap
- **Icons**: Lucide React
- **Notifications**: Sonner & Standard Browser Notification API
