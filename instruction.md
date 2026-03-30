## 📱 Cashbook Web App (Mobile-Installable) – Product Instruction

### **Objective**

Design and develop a **mobile-responsive web application (PWA)** for tracking personal cash flow (income and expenses), with structured data entry, filtering, analytics, and export functionality.

The app must behave like a **mobile app when installed** (Add to Home Screen), while remaining fully functional in browsers.

---

## **1. Core Requirements**

### **1.1 Platform**

* Type: **Progressive Web App (PWA)**
* Must support:

  * Mobile-first responsive design
  * Offline capability (basic usage)
  * Installable on Android/iOS home screen

---

## **2. Core Features**

### **2.1 Transaction Management**

Users must be able to **create, edit, and delete transactions**.

#### Required Fields:

* **Date** (required)
* **Time** (optional)
* **Amount** (required)

  * Positive → Income
  * Negative or tagged → Expense
* **Name / Description**
* **Category**

  * Select from predefined list
  * Option to **add custom categories dynamically**

---

### **2.2 Categories System**

* Default categories (editable):

  * Food, Transport, Rent, Utilities, Salary, Shopping, Entertainment, Health, Misc
* Features:

  * Add / Edit / Delete categories
  * Assign color or icon (optional for UI clarity)

---

### **2.3 Views & Filtering**

Provide flexible transaction viewing:

#### Filters:

* All Transactions
* Daily
* Weekly
* Monthly
* Yearly
* Custom date range (optional advanced)

#### Sorting:

* By Date (default)
* By Amount (optional)

---

### **2.4 Summary & Analytics Page**

A dedicated dashboard showing financial insights.

#### Monthly Summary:

* Total Income
* Total Expenses
* Net Balance

#### Category Breakdown:

* Expenses grouped by category
* Display:

  * Amount per category
  * Percentage of total expenses

#### Visualization:

* **Pie Chart or Donut Chart**

  * Title: `"Monthly Expense Breakdown"`
* Optional:

  * Bar chart for trends over time

---

### **2.5 Data Export**

* Export all transaction data into **Excel (.xlsx)**

#### Export Requirements:

* Include:

  * Date, Time, Description, Category, Amount
* Optional enhancements:

  * Separate sheets by month
  * Summary sheet with totals

---

## **3. UI/UX Requirements**

### **3.1 Design Principles**

* Mobile-first layout
* Clean, minimal UI
* Fast data entry (important for daily usage)

### **3.2 Key Screens**

1. **Home / Transactions List**

   * List of entries
   * Quick add button (FAB style)

2. **Add/Edit Transaction Screen**

   * Simple form
   * Category selector + add new option

3. **Summary Dashboard**

   * Charts + totals

4. **Settings**

   * Manage categories
   * Export data

---

## **4. Technical Requirements**

### **4.1 Frontend**

* Framework: React / Vue / Vanilla JS (flexible)
* Responsive CSS (Tailwind or similar recommended)

### **4.2 PWA Features**

* Service Worker (offline support)
* Web App Manifest (installable)
* Caching for performance

### **4.3 Data Storage**

* Option 1: LocalStorage / IndexedDB (offline-first)
* Option 2 (advanced): Backend API + database

---

## **5. Enhancements (Optional but Recommended)**

* Search transactions
* Recurring transactions
* Dark mode
* Budget limits per category
* Notifications/reminders
* Multi-currency support

---

## **6. Reference & Design Inspiration**

Research and take UX inspiration from apps like:

* Money Manager Expense & Budget
* Wallet: Budget Expense Tracker
* Spendee

Focus on:

* Simplicity of input
* Clear financial visualization
* Fast interaction flow

---

## **7. Expected Output**

A fully functional web app that:

* Works seamlessly on mobile and desktop
* Can be installed like a native app
* Allows efficient daily expense tracking
* Provides clear financial insights and export capability

---

