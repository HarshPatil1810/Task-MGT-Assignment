# LendAHand Task Management System

A full-stack task allocation and workflow optimization platform built using the MERN architecture with an **MS SQL Server (MSSQL)** relational database tracking layer. The system enables Administrators to deploy tasks with live attachments to designated Employees, tracks milestones safely, keeps live long-polling navbar notifications active, and exports granular analytical reports directly into **Excel worksheets** and structured **CSV ledgers**.

---

## 🚀 Key Architectural Features

* **Secure Administration Pipeline:** Separate dashboard structures mapping data access levels between `Admin` clearances and `Employee` operational views.
* **Multi-Part File Uploads:** Administrators can instantly upload workflow documents, templates, or references (`multer`) that flow securely down into custom local disk storage streams.
* **Granular System Reporting:** One-click compiling dashboards capable of extracting **Completed Tasks**, **Pending Backlogs**, and **Employee-specific assignment histories** straight into native Excel sheets (`exceljs`) and clean comma-separated values (CSV).
* **Live Long-Polling Notifications:** Background polling matrix updates the user interface instantly when a new project assignment drops down the system line.
* **Responsive Framework Grid:** Front-end built with **React**, **TypeScript**, and styled using utility layout classes from **Bootstrap** and iconography from **Lucide-React**.

---

## ✨ Implemented Features & Core Workflows

The platform has been fully engineered with the following working features:

### 1. User Authentication & Session Security
* **Secure Login Matrix:** JWT-based user authentication that securely issues role-based tokens upon verified login credentials. Includes built-in **"Remember Me"** functionality at login for persistent sessions.
* **Smart Navigation Filter:** An adaptive Navbar layout built with clean conditional logic (`user?.role === 'Admin'`) ensuring that sensitive management controls like employee registers and system reports are strictly hidden from general employees.

### 2. Task Allocation with Document Attachments
* **Multi-Part Form Parsing:** Configured a secure backend ingestion pipeline combining form text data alongside raw binary file buffers (`FormData` format) seamlessly without payload collisions.
* **Local Storage Storage:** Programmatic file system routing using `multer` that automatically renames, formats, and references document tracks securely in the local server instance database columns.

### 3. Native Report Generation Engine
* **Completed Tasks Log:** One-click automated report compiling completed project milestones, assignees, and closeout dates.
* **Pending Backlog Tracker:** Deep query filters aggregating overdue or upcoming assignments sorted cleanly by urgency and priority weights.
* **Employee-Specific Allocation Ledger:** Dropdown filtering interface enabling admins to choose any team member to compile and evaluate an individual's specific task history instantly.
* **Multi-Format Export Pipeline:** Built native converters using `exceljs` and structured string stream arrays to deliver dynamic downloads in both formatted Excel sheets (with stylized header blocks) and lightweight CSV files.

### 4. Direct Tab File Download Protection
* **Dual-Channel Token Extraction:** Modified standard route guard middleware to safely intercept authentication credentials from both traditional HTTP Request Headers and browser URL query string fallbacks (`?token=...`). This safely secures background context window exports (`window.open`) without breaking state.

### 5. Live Notifications System
* **Automated Client Long-Polling:** Front-end hook that checks the system background database threads securely every 10 seconds for newly dropped assignments.
* **Instant UI Toasts & Badging:** Triggers persistent interactive UI popup banners and dynamically updates navbar counts until cleared out manually by the active operator.

---

## 🛠️ Technology Stack Matrix

* **Frontend:** React (Vite / CRA), JavaScript, Bootstrap, Lucide React, Axios
* **Backend:** Node.js, Express.js, JWT Authentication Middleware, Multer File Handler
* **Database:** Microsoft SQL Server (MSSQL / `mssql` pool drivers)
* **Reports Compiler:** ExcelJS

---

## 📁 Repository Directory Map

```text
lendahand-task/
├── Backend/
│   ├── config/             # Database connection setups
│   ├── controllers/        # Operational logic (auth, tasks, employees, reports)
│   ├── middelware/         # JWT Verification & payload boundary filters
│   ├── uploads/            # Local disk storage destination for attachments
│   ├── server.js           # Server application core entrypoint
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/     # UI Shell layouts (Navbar, Sidebar)
│   │   ├── pages/          # View blocks (Dashboard, Tasks, Employees, Reports)
│   │   └── App.jsx         # Primary router config mapping links
│   └── package.json
└── README.md


Complete Setup & Installation Guide
Prerequisites
Make sure you have the following software infrastructure running locally:
Node.js (v18.x or above)
npm (v9.x or above)
Microsoft SQL Server (Express or Developer edition)
SQL Server Management Studio (SSMS)

Environment Setup
Create a configuration file named .env inside the Backend/ directory and configure your local server environment parameters:
PORT=5000
DB_CONNECTION_STRING=Driver={SQL Server};Server=Servername;Database=EmployeeTaskDB;Trusted_Connection=Yes;
JWT_SECRET=your_secure_hexadecimal_system_hash
