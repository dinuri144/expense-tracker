# 💰 Expense Tracker – AI-Powered Personal Finance Manager

A modern, AI-powered personal finance management application built with **Next.js**. Expense Tracker helps users manage their finances by tracking income and expenses, setting budgets, creating savings goals, and receiving intelligent financial recommendations powered by Google Gemini AI.

## ✨ Features

- **Interactive Dashboard** – Monitor total income, expenses, net balance, and budget usage.
- **Financial Analytics** – Visualize income and expense trends through interactive charts.
- **Transaction Management** – Create, view, update, and delete financial transactions.
- **Budget Management** – Set category-wise budgets and monitor spending progress.
- **Savings Goals** – Create savings goals, track progress, and add funds.
- **Custom Categories** – Organize transactions using personalized categories.
- **AI Financial Advisor** – Get smart financial insights and recommendations powered by Google Gemini.
- **Report Generation** – Export financial reports in PDF and CSV formats.
- **Dark & Light Mode** – Switch between different themes.
- **Multi-Currency Support** – Manage finances using USD, EUR, GBP, and LKR.
- **Secure Authentication** – User authentication using JWT and password hashing with bcryptjs.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js 14, React |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Next.js API Routes |
| Database | MongoDB |
| Authentication | JWT, bcryptjs |
| AI Integration | Google Gemini AI (`@google/genai`) |
| PDF Generation | jsPDF, jspdf-autotable |
| Data Export | PDF, CSV |

## 📸 Application Preview
<img width="1290" height="1520" alt="expense-tracker-seven-cyan-18 vercel app-dashboard" src="https://github.com/user-attachments/assets/ab09495f-b226-4172-b0bf-13695b5483c8" />
<img width="1290" height="1520" alt="expense-tracker-seven-cyan-18 vercel app-dashboard" src="https://github.com/user-attachments/assets/640fc854-6e64-4989-a88a-4fa76ea864d9" />



## ⚙️ Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Make sure you have the following installed:

- Node.js 18 or later
- npm
- MongoDB database
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/dinuri144/expense-tracker.git
```

### 2. Navigate to the Project Directory

```bash
cd expense-tracker
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder values with your own configuration.

**Important:** Never commit your `.env.local` file or expose your database credentials, JWT secret, or API keys.

### 5. Start the Development Server

```bash
npm run dev
```

### 6. Open the Application

Visit the following URL in your browser:

```text
http://localhost:3000
```

## 📊 Key Highlights

- Complete personal finance management in one application.
- Interactive financial dashboards and visual analytics.
- Personalized budget and savings goal tracking.
- AI-powered financial guidance using Google Gemini.
- Secure authentication and multi-currency support.

## 🔮 Future Improvements

- Enhanced financial analytics and insights.
- Additional financial planning tools.
- More personalized AI recommendations.
- Improved reporting and data visualization.

## 👩‍💻 Author

**Dinuri Thathsarani**

- GitHub: [@dinuri144](https://github.com/dinuri144)

---

⭐ If you find this project interesting, consider giving it a star!

*Built to make personal finance management smarter and simpler.*
