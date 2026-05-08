# RentBridge

**Security Deposit Finance Platform for Urban Professionals**

RentBridge is a full-stack web application that helps urban professionals in Pakistan finance their rental security deposits and repay over the lease term. It operates as a licensed NBFC (Non-Banking Financial Company) platform with built-in compliance, fraud detection, and admin oversight.

---

## Features

### For Users
- **Deposit Financing** — Apply for a loan to cover your rental advance and security deposit. RentBridge disburses the deposit on your behalf.
- **Repayment Scheduling** — Loan repayments are spread across your lease tenure with a clear monthly installment schedule.
- **Digital Wallet** — Each user gets a PKR-denominated wallet for deposits, withdrawals, and peer-to-peer transfers.
- **Credit Score Dashboard** — View your credit profile and score metrics.
- **Transaction History** — Full log of all wallet activity.
- **Deposit Calculator** — Estimate your financing costs before applying.

### For Admins
- **Compliance Hub** — Review all loan applications and user activity.
- **Fraud Detection** — Transactions are automatically evaluated against suspicious activity rules and flagged for review.
- **User Management** — View, block, and manage user accounts.
- **Transaction Oversight** — Monitor flagged and high-risk transactions across the platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Tailwind CSS v4, Recharts, Lucide React, Motion |
| Backend | Node.js, Express.js |
| Database | Firebase Firestore |
| Authentication | JWT (JSON Web Tokens), bcryptjs |
| Security | Helmet, CORS, express-rate-limit |
| Dev Server | Vite 6 (via `tsx` for unified dev mode) |
| AI | Google Gemini API (`@google/genai`) |

---

## Project Structure

```
rentbridge1/
├── server.js                        # Express server entry point (serves API + Vite)
├── vite.config.js                   # Vite build configuration
├── index.html                       # HTML entry point
├── firebase-blueprint.json          # Firestore data model / schema reference
├── firebase-applet-config.json      # Firebase project configuration
├── firestore.rules                  # Firestore security rules
├── .env.example                     # Environment variable template
└── src/
    ├── App.jsx                      # Root component, routing, auth state
    ├── main.jsx                     # React entry point
    ├── index.css                    # Global styles
    ├── frontend/
    │   ├── components/
    │   │   ├── Navbar.jsx           # Guest navigation bar
    │   │   └── Calculator.jsx       # Deposit cost calculator widget
    │   └── pages/
    │       ├── LandingPage.jsx      # Public marketing page
    │       ├── AuthPage.jsx         # Login / Register
    │       ├── DashboardPage.jsx    # User dashboard (wallet, applications, repayments)
    │       └── AdminDashboardPage.jsx  # Admin compliance dashboard
    └── backend/
        ├── config/
        │   └── firebase.js          # Firebase/Firestore client initialisation
        ├── middlewares/
        │   └── auth.js              # JWT authentication middleware
        ├── controllers/
        │   ├── authController.js    # Register, login, get current user
        │   ├── walletController.js  # Deposit, withdraw, transfer
        │   ├── loanController.js    # Loan applications, repayment schedule, payments
        │   └── adminController.js   # Admin user/transaction management
        ├── routes/
        │   ├── authRoutes.js
        │   ├── walletRoutes.js
        │   ├── loanRoutes.js
        │   ├── transactionRoutes.js
        │   ├── expenseRoutes.js
        │   └── adminRoutes.js
        └── utils/
            ├── suspiciousRules.js   # Rule-based fraud detection engine
            └── errorHandlers.js     # Standardised Firestore error handling
```

---

## Data Model

The Firestore database has the following core collections:

| Collection | Description |
|---|---|
| `users` | User accounts with role (`user` / `admin`) and status (`active` / `blocked`) |
| `wallets` | One wallet per user, tracking balance and transaction aggregates (PKR) |
| `transactions` | All financial events: deposits, withdrawals, transfers. Includes `suspiciousFlag` |
| `loan_applications` | Loan requests with amount, tenure, and approval status |
| `repayments` | Monthly installment records linked to a loan application |

The full schema is documented in [`firebase-blueprint.json`](firebase-blueprint.json).

---

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- A Firebase project with Firestore enabled
- A Google Gemini API key

### Installation

1. **Clone or unzip the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   APP_URL=http://localhost:3000

   # Firebase config (add these from your Firebase project settings)
   FIREBASE_API_KEY=...
   FIREBASE_AUTH_DOMAIN=...
   FIREBASE_PROJECT_ID=...
   FIREBASE_STORAGE_BUCKET=...
   FIREBASE_MESSAGING_SENDER_ID=...
   FIREBASE_APP_ID=...

   # JWT
   JWT_SECRET=your_jwt_secret
   ```

4. **Deploy Firestore security rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the unified development server (Express + Vite HMR) |
| `npm run build` | Build the frontend for production (`dist/`) |
| `npm start` | Run the production server (serves built `dist/`) |
| `npm run lint` | Run ESLint across JS/JSX files |
| `npm run clean` | Remove the `dist/` build output |

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| `POST` | `/register` | Create a new user account and wallet |
| `POST` | `/login` | Authenticate and receive a JWT |
| `GET` | `/me` | Get current authenticated user |

### Wallet — `/api/wallet`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Get wallet balance and stats |
| `POST` | `/deposit` | Deposit funds |
| `POST` | `/withdraw` | Withdraw funds |
| `POST` | `/transfer` | Transfer funds to another user by email |

### Loans — `/api/loans`
| Method | Path | Description |
|---|---|---|
| `POST` | `/apply` | Submit a new deposit financing application |
| `GET` | `/` | Get all loan applications for the current user |
| `GET` | `/repayments` | Get all repayment installments |
| `POST` | `/repayments/:id/pay` | Make a repayment from wallet balance |

### Admin — `/api/admin`
| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/users` | List all users | Admin only |
| `POST` | `/users/:id/block` | Block a user account | Admin only |
| `GET` | `/transactions` | View all transactions | Admin only |

### Health
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check |

---

## Loan Calculation

When a user applies for deposit financing, the cost is calculated as:

```
Total Deposit  = Rent Amount × (Advance Months + Security Months)
Markup         = Total Deposit × 12%
Total Loan     = Total Deposit + Markup
Monthly Payment = Total Loan ÷ Tenure (months)
```

---

## Fraud Detection

Every deposit and transfer is automatically evaluated by the rule-based engine in `suspiciousRules.js`. Transactions that trigger rules are marked `status: "flagged"` and surfaced in the Admin Compliance Hub for manual review. Clean transactions are marked `status: "successful"`.

---

## Roles & Access

| Role | Access |
|---|---|
| `user` | Dashboard, wallet, loan applications, repayments |
| `admin` | All user pages + Compliance Hub (`/admin`) |

Role is assigned at registration (`user` by default). Admin accounts must be promoted directly in Firestore.

---

## Deployment

For production, build the frontend first and then start the server:

```bash
npm run build
npm start
```

The Express server will serve the built React app from the `dist/` folder and handle all API routes.

For cloud deployment (e.g., Google Cloud Run), set `NODE_ENV=production` and ensure all environment variables are configured in your hosting environment.

---

## License

Apache-2.0 — see source file headers for details.
