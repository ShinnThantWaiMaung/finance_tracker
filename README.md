# 📱 Cashbook PWA

A powerful, mobile-first **Progressive Web App (PWA)** designed for personal finance tracking. Manage your income, expenses, and budgets across multiple accounts with beautiful analytics and offline support.


## ✨ Features

### 💰 Core Tracking
- **Transaction Management**: Quickly log income and expenses with descriptions, categories, and timestamps.
- **Multiple Accounts**: Separate your finances into "Personal", "Work", "Business", or create your own custom accounts with unique colors and icons.
- **Dynamic Categories**: Fully customizable categories. Choose from a rich set of icons and colors when creating new tags.

### 📊 Advanced Analytics
- **7-Day Trend Chart**: Visualize your spending patterns over the last week with an elegant line chart.
- **Category Breakdown**: See exactly where your money goes with interactive doughnut charts.
- **Time-based Filtering**: View data by Week, Month, Year, or All Time.

### 🎯 Monthly Budgeting
- **Month-Specific Limits**: Set spending targets for each category on a month-by-month basis.
- **Visual Progress Bars**: Real-time progress tracking that changes color (Green → Amber → Red) as you approach your limit.
- **Historical Comparison**: Switch between months to see how your budgeting held up in previous periods.

### 🔍 Search & Management
- **Instant Search**: Find any transaction by description, category, or amount range.
- **Excel Import/Export**: Back up your data or move it to a spreadsheet with full `.xlsx` support.
- **Bulk Operations**: Intelligent duplicate detection for imports and bulk delete tools for data cleanup.

### 📱 PWA & UX
- **Installable**: Add to your mobile home screen for a native app experience.
- **Offline Mode**: Works without an internet connection using Service Workers.
- **Dark Mode**: Beautifully optimized dark theme for night usage.
- **Custom Scrollbars**: Modern, theme-aware thin scrollbars for smooth desktop navigation.

## 🛠️ Tech Stack
- **Frontend**: Vanilla JavaScript (SPA Architecture)
- **Styling**: Tailwind CSS & Lucide Icons
- **Charts**: Chart.js
- **Data Engine**: SheetJS (XLSX) & LocalStorage (Persistence)
- **Deployment**: PWA Service Workers

## 🚀 Getting Started

To run the application locally:

1. Clone or download the project files.
2. Open a terminal in the project directory.
3. Start a local server (required for Service Workers):
   ```bash
   # Using Python
   python -m http.server 8000
   python -m http.server 8000 --bind 127.0.0.1
   ```
4. Open your browser to `http://localhost:8000`.

## ⚙️ Development Note
The application is entirely client-side. All your financial data is stored securely in your browser's **LocalStorage**. No data ever leaves your device unless you manually export it to Excel.
