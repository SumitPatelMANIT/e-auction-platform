# E-Auction Management System - Technology Stack

This document outlines the core technologies, libraries, and tools used to build the E-Auction Management System.

## 🎨 Frontend (User Interface)

The frontend is a Single Page Application (SPA) built for high performance and real-time updates.

*   **React (v18):** Core JavaScript library for building the user interface using functional components and hooks.
*   **Vite:** A blazing-fast frontend build tool and development server.
*   **Tailwind CSS:** A utility-first CSS framework used for responsive, modern, and rapid UI styling (customized with a teal/cyan theme).
*   **React Router DOM:** Handles client-side routing to navigate between Admin, Bidder, and Seller dashboards without page reloads.
*   **Socket.io-client:** Enables real-time bidirectional communication with the backend to receive live bid updates and auction status changes instantly.
*   **Lucide React:** A beautiful, consistent icon library used throughout the UI.
*   **clsx & tailwind-merge:** Utilities for conditionally joining and merging Tailwind CSS class names efficiently.

## ⚙️ Backend (Server & API)

The backend is a robust RESTful API paired with a WebSocket server for real-time auction synchronization.

*   **Node.js:** JavaScript runtime environment executing the server-side code.
*   **Express.js:** Fast, unopinionated web framework for Node.js used to build the REST API endpoints.
*   **Prisma ORM:** Next-generation Node.js and TypeScript Object-Relational Mapper used to interact with the database using a type-safe schema.
*   **PostgreSQL:** The primary relational database used to store users, items, auctions, bids, and transactions securely.
*   **Socket.io:** Powers the real-time websocket connections to broadcast bids and live auction timers to all connected clients.
*   **Redis:** An in-memory data structure store, used here likely for caching or as a pub/sub adapter for scaling Socket.io across multiple nodes.
*   **JSON Web Tokens (JWT):** Used for stateless, secure user authentication and authorization (Role-based access for Admins, Sellers, and Bidders).
*   **bcryptjs:** A cryptographic library used to salt and hash user passwords before storing them in the database.
*   **node-cron:** A task scheduler used to run background jobs (e.g., automatically closing auctions when their end time is reached).

## 🛠️ Development & Tooling

*   **Nodemon:** Development utility that automatically restarts the Node.js server when file changes are detected.
*   **ESLint:** Linter used to maintain code quality and consistency in the frontend.
*   **PostCSS & Autoprefixer:** Used alongside Tailwind CSS to parse CSS and add vendor prefixes.
