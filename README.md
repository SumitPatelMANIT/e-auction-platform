# 🔨 E-Auction Management System

![E-Auction Banner](frontend/public/logo.png)

The **E-Auction Management System** is a robust, real-time, full-stack application built to facilitate seamless online bidding. It bridges the gap between sellers wanting to auction off inventory and bidders looking to compete in live, real-time auctions. 

---

## ✨ Key Features

The system uses **Role-Based Access Control (RBAC)** to serve three distinct types of users:

### 🛡️ Admin Features
*   **Auction Lifecycle Management:** Review seller items and manually schedule, activate, or close auctions.
*   **System Dashboard:** View high-level analytics, active users, total bid volume, and revenue.
*   **Support & Ticketing:** Manage and resolve support tickets submitted by users.
*   **Automated Jobs:** Background workers automatically close expired auctions and generate winning orders.

### 📦 Seller Features
*   **Inventory Management:** Add new items with descriptions, base prices, and images.
*   **Catalogue Tracking:** Track which items are pending, currently in an active auction, or sold.
*   **Revenue Dashboard:** View analytics on sold items and total revenue generated.

### 🏷️ Bidder Features
*   **Real-Time Live Bidding:** Participate in active auctions with millisecond-latency bid updates powered by WebSockets.
*   **Catalogue Browsing:** Search, filter, and view upcoming and active auction catalogues.
*   **Bid History & Wins:** Track personal bid history, monitor outbid alerts, and view won items to proceed to checkout.

---

## 🛠️ Technology Stack

This project is built using modern, industry-standard tools:

### Frontend
*   **React 18** - UI Library
*   **Vite** - Blazing fast frontend build tool
*   **Tailwind CSS** - Utility-first styling framework
*   **Socket.io-client** - Real-time WebSocket connections

### Backend
*   **Node.js & Express.js** - RESTful API architecture
*   **Prisma ORM** - Type-safe database interactions
*   **PostgreSQL** - Primary relational database
*   **Socket.io** - WebSocket server for live broadcasting
*   **JSON Web Tokens (JWT) & bcryptjs** - Secure authentication

---

## 🏗️ Architecture & Core Modules

### 1. Real-Time Bidding Engine (Socket.io)
When a bidder joins an active auction, a persistent WebSocket connection is established. When a bid is placed, the backend validates it against the minimum increment and the current highest bid. If valid, the bid is saved to PostgreSQL via Prisma, and a broadcast is instantly fired to all connected clients updating the UI simultaneously without page reloads.

### 2. Background Task Scheduler (node-cron)
The backend runs continuous cron jobs that poll the database. If an active auction surpasses its `end_time`, the system automatically shifts its status to `Closed`, evaluates the highest bid, generates a final `Order` for the winning user, and dispatches a notification.

---

## 📁 Folder Structure

```text
E-Auction/
├── backend/
│   ├── prisma/             # Database schema and migration history
│   ├── src/
│   │   ├── controllers/    # API Business logic (admin, seller, bidder)
│   │   ├── middleware/     # JWT verification and Role-checks
│   │   ├── routes/         # Express API endpoint definitions
│   │   └── utils/          # Background cron jobs and helpers
│   └── index.js            # Express & Socket.io server entry point
│
└── frontend/
    ├── public/             # Static assets (Favicons, Logos)
    ├── src/
    │   ├── components/     # Reusable UI (Navbars, Buttons, Modals)
    │   ├── context/        # Global State (Live Socket Data)
    │   └── pages/          # Full screen views based on Roles
    ├── App.jsx             # React Router setup
    └── main.jsx            # React DOM mounting point
```

---

## 🚀 Local Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL database (Running locally or via a cloud provider like Supabase/Neon)

### 1. Database Setup
Create a `.env` file inside the `backend/` directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/eauction?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
PORT=5000
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
*The backend will start running on `http://localhost:5000`*

### 3. Frontend Setup
Create a `.env` file inside the `frontend/` directory (if required by the codebase to target the backend):
```env
VITE_API_URL="http://localhost:5000"
```

```bash
cd frontend
npm install
npm run dev
```
*The frontend will start running on `http://localhost:5173`*

---

## 🌐 Deployment Guide (Production)

To host this project live on the internet:

1.  **Database:** Host your PostgreSQL database on [Neon.tech](https://neon.tech/) or [Supabase](https://supabase.com/).
2.  **Backend:** Deploy the `backend/` folder to [Render](https://render.com/) or [Railway](https://railway.app/). Make sure to set your `DATABASE_URL` and `JWT_SECRET` environment variables. Ensure the build command runs `npx prisma migrate deploy` before starting the server.
3.  **Frontend:** Update your frontend API endpoints to point to your newly deployed live backend URL. Then deploy the `frontend/` folder to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) using the build command `npm run build`.
