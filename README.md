````markdown
# ExpenseTracker

A modern, AI-powered personal finance management application built with Next.js. Track your income & expenses, set budgets, create savings goals, and get smart financial recommendations powered by Google Gemini.

## Features

- Real-time Dashboard with income, expenses, net balance & budget usage
- Income vs Expenses trend charts
- Full Transaction management (Create, Read, Update, Delete)
- Category-wise Budgets with progress tracking
- Savings Goals with progress bars and "Add Funds"
- Custom Categories
- AI Financial Advisor (Google Gemini)
- PDF & CSV Report export
- Dark / Light mode
- Multi-currency support (USD, EUR, GBP, LKR)
- Secure JWT Authentication

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons, Recharts
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **Authentication:** JWT + bcryptjs
- **AI:** Google Gemini (`@google/genai`)
- **PDF Generation:** jsPDF + jspdf-autotable

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Google Gemini API Key

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd expense-tracker
````

2. Install dependencies

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add the following:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

```
```
