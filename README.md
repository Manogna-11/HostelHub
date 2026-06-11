# 🏨 HostelHub AI — Intelligent Hostel Management System

A modern, full-stack hostel management platform for **students** and **administrators**, supercharged with AI. Manage complaints, rooms, notices, mess menus and feedback — with artificial intelligence working behind every feature.

> Built with TanStack Start (React 19) + Tailwind CSS + Lovable Cloud (Postgres, Auth, Server Functions) + Lovable AI.

---

## 📋 Project Overview

HostelHub AI digitizes day-to-day hostel operations into a single, role-aware dashboard. Students can file maintenance complaints, track their status, read notices, view the weekly mess menu, submit feedback and chat with an AI assistant. Administrators get a full operations cockpit: student & room management, complaint resolution, notice publishing, mess scheduling and a rich analytics dashboard.

## ✨ Features

### 👨‍🎓 Student
- Register / login / forgot-password / profile management
- View assigned room & full room details
- Submit and track maintenance complaints
- Read & search hostel notices
- View the weekly mess menu (today highlighted)
- Submit star-rated feedback
- Chat with the **HostelHub Assistant** (AI)

### 🛡️ Admin
- Secure role-based dashboard
- Manage students & assign rooms
- Full room CRUD (add / edit / delete)
- Create, edit & delete notices
- Update the weekly mess menu
- Resolve complaints (status workflow)
- Review feedback with sentiment
- Analytics dashboard with live charts
- One-click demo data generator

## 🤖 AI Features (powered by Lovable AI)

1. **Complaint Classification** — auto-detects category, assigns priority and writes a concise maintenance summary for every complaint.
2. **HostelHub Assistant** — a conversational chatbot for hostel rules, complaint procedures, room allocation, mess timings and portal navigation. Includes chat history, typing animation and suggested questions.
3. **Notice Summarizer** — generates a short summary, key points and important deadlines for each notice.
4. **Feedback Sentiment Analysis** — classifies feedback as positive / neutral / negative with a sentiment score and summary, surfaced in admin analytics.

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────┐
│  React 19 + TanStack Router (file-based)       │
│  Tailwind CSS design system · Recharts         │
└───────────────┬───────────────┬───────────────┘
                │ supabase-js    │ server functions (RPC)
                ▼                ▼
        ┌───────────────┐  ┌──────────────────────┐
        │ Postgres + RLS │  │  AI Server Functions  │
        │ Auth · Storage │  │  → Lovable AI Gateway │
        └───────────────┘  └──────────────────────┘
```

- **Frontend:** TanStack Start (SSR-capable), React 19, Tailwind v4 semantic tokens, shadcn/ui, Recharts, light/dark mode.
- **Backend:** Lovable Cloud (Supabase) — Postgres with Row-Level Security, email/password auth, role table.
- **AI:** `createServerFn` endpoints call the Lovable AI Gateway (Gemini) for classification, summarization, sentiment and chat. Keys stay server-side.

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | Student/admin info (student ID, name, phone, gender, department, year, room) |
| `user_roles` | Role assignment (`admin` / `student`) — kept separate for security |
| `rooms` | Room number, capacity, occupied count, floor, type, status |
| `complaints` | Title, description, category, priority, status, AI summary |
| `notices` | Title, description, priority, AI summary |
| `feedback` | Rating, text, sentiment, score, AI summary |
| `mess_menu` | Per-day breakfast / lunch / snacks / dinner |
| `chat_history` | Per-user AI assistant conversation |

All tables enforce RLS: students access only their own complaints/feedback/chat; everyone signed in reads rooms/notices/menu; admins manage everything via a security-definer `has_role` check.

## 🚀 Installation / Running

This project runs on **Lovable Cloud** — no manual backend setup required.

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

### First run / demo setup
1. Register a student account from the **Register** tab.
2. To explore the admin experience, open the dashboard and click **Claim admin** (promotes the first user when no admin exists yet).
3. Click **Generate demo data** to seed demo students, complaints and feedback, then explore **Analytics**.

Demo student logins created by the seeder use password `Demo@12345`.

## 🎨 UI

- Blue / white / dark-gray professional theme
- Sidebar navigation, dashboard cards, tables, charts and modal forms
- Fully responsive & mobile-friendly
- Light & dark mode toggle

## 📸 Screenshots

> Add screenshots here:
> - Landing page
> - Student dashboard
> - Admin analytics
> - AI assistant chat
> - Complaint with AI classification

---

Built with ❤️ using Lovable — suitable for software engineering portfolios, GitHub showcases and campus placements.
