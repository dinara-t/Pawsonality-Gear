# Pawsonality Gear

## React + Firebase + Stripe (Test Mode)

Pawsonality Gear is e-commerce study project built to simulate a real-world online pet accessories store. The application demonstrates modern frontend architecture with React, cloud database integration using Firebase Firestore, and secure payment processing via Stripe Checkout through an Express backend.
This project was developed as a structured learning exercise to understand application architecture, state management, database transactions, and secure payment flows.

## Technology Stack

### Frontend

- React (Vite)
- React Router DOM
- Context API
- SCSS Modules

### Backend

- Node.js
- Express
- Stripe SDK

### Database

- Firebase Firestore

### Other

- Stripe Hosted Checkout
- localStorage (cart persistence)

## System Architecture

The application follows a clear separation of responsibilities:

Browser (React SPA)
→ Firestore (product and stock data)
→ Express server (Stripe session creation)
→ Stripe hosted checkout
→ Return to success page
→ Firestore transaction for stock reduction

Key principles:

- Stripe secret keys are never exposed to the frontend
- Stock updates are handled using Firestore transactions
- The cart is stored locally but validated against stock

## Project Structure

pawsonality-gear/
│
├── src/
│ ├── components/
│ ├── context/
│ ├── pages/
│ ├── services/
│ ├── App.jsx
│ └── main.jsx
│
├── server/
│ └── index.js
│
├── .env
└── package.json

## Routing

Route Responsibility
/ Home page with featured and random products
/shop Product listing with filtering
/product/:id Product detail and variant selection
/cart Cart management
/checkout Customer information and Stripe session creation
/checkout-success Post-payment stock update
/about Static informational page

-                 Fallback page

Each page has a single responsibility, keeping logic modular and maintainable.

## Cart System

The cart is variant-aware. A cart line represents:
Product + Specific Variant
Cart line IDs follow this pattern:
${productId}_${variantId}
This prevents merging different variants into a single cart line.

### Features

- Quantity clamping based on stock
- Immutable state updates
- Persistence using localStorage
- Subtotal and item count calculated using reduce()
- Defensive data handling

Example subtotal pattern:
items.reduce((sum, item) => sum + price \* qty, 0)

## Checkout Flow

The application uses Stripe Hosted Checkout.

### Flow

1. User fills in checkout form
2. Frontend sends cart data to Express server
3. Server creates Stripe Checkout Session
4. Browser redirects to Stripe payment page
5. Stripe redirects back to /checkout-success
6. Firestore transaction reduces variant stock
7. Cart is cleared

Stripe secret keys are stored only on the server.

## Firestore Stock Handling

Stock updates use Firestore runTransaction().

This ensures:

- Atomic updates
- Prevention of overselling
- Consistent state under concurrent purchases

The transaction:

- Reads affected product documents
- Validates stock
- Updates variant quantities
- Commits or aborts as one operation

## Installation and Setup

1. Clone the repository
   git clone <repository-url>
   cd pawsonality-gear

2. Install frontend dependencies
   npm install

3. Configure Firebase
   Create a .env file in the root directory:
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=

4. Configure Stripe backend
   Navigate to the server folder:
   cd server
   npm install
   Create a .env file inside /server:
   STRIPE*SECRET_KEY=sk_test*...
   CLIENT_URL=http://localhost:5173

5. Run backend server
   node index.js
   Default backend port: 4242

6. Run frontend
   From the project root:
   npm run dev
   Default frontend port: 5173

## Core Concepts Practiced

### React

- Functional components
- Hooks (useState, useEffect, useMemo)
- Controlled inputs
- Conditional rendering
- Context API for global state

### JavaScript

- Array.map
- Array.reduce
- Array.find
- Object spread
- Optional chaining
- Nullish coalescing
- Async/await

### Routing

- Client-side routing
- Dynamic route parameters

### Database

- Firestore queries
- Document modeling
- Transactions

### Backend

- Express routing
- Environment variables
- Secure secret management

### Payments

- Stripe Checkout session creation
- Redirect-based payment flow

## Learning Experience

This project evolved from a simple product listing into a structured application with transactional stock handling and secure payment integration.

Key areas of growth included:

- Designing a variant-aware cart system rather than treating products as flat items
- Implementing Firestore transactions to prevent race conditions and overselling
- Separating frontend responsibilities from backend security concerns
- Structuring the application by responsibility (pages, services, context, components)
- Moving from feature implementation to system-level thinking

The project reflects a transition from building React interfaces to designing complete application flows with attention to data integrity, security, and maintainability.
