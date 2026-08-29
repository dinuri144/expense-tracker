import "./globals.css";

export const metadata = {
  title: "ExpenseTracker - Personal Finance Management",
  description: "Manage your expenses, budgets, and savings goals easily.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}