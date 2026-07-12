# TransitOps — Smart Transport Operations Platform

## What is TransitOps?
Many logistics companies still rely on spreadsheets and manual logbooks to manage their transport operations. This often leads to scheduling conflicts, underutilized vehicles, missed maintenance, expired driver licenses, inaccurate expense tracking, and poor operational visibility.

**TransitOps** is a centralized, end-to-end transport operations platform designed to solve these issues. It allows organizations to digitize and manage the complete lifecycle of their transport operations—from vehicle registration and driver management to dispatching, maintenance, fuel logging, and analytics.

The platform is built on a strict **Role-Based Access Control (RBAC)** architecture that wires together several entity state machines (Vehicle, Driver, Trip, and Maintenance). This means that every operational action has a secure, transactional side effect (e.g., dispatching a trip safely locks both the vehicle and driver out of the dispatch pool until the trip is completed).

---

## The Four Roles
TransitOps serves four distinct personas, all collaborating within a unified dashboard:

1. **Fleet Manager**: Oversees the entire fleet lifecycle. Can register vehicles, add drivers, open/close maintenance records, and log fleet expenses.
2. **Dispatcher**: Handles the core operational workflow. Drafts, dispatches, completes, and cancels trips. The system strictly guards their actions (e.g., preventing a dispatch if the driver's license is expired or if the cargo is too heavy).
3. **Safety Officer**: Focuses on compliance. Can monitor driver safety scores and suspend/reinstate drivers to immediately block them from the dispatch pool.
4. **Financial Analyst**: Focuses on the bottom line. Logs fuel costs and toll/miscellaneous expenses, and monitors Fleet ROI, operational costs, and fuel efficiency reports.

---

## Core System Workflow
The best way to understand TransitOps is to trace the lifecycle of a standard trip assignment. The platform strictly enforces business rules at every step:

1. **Asset Registration**: The *Fleet Manager* logs in and registers a new vehicle (e.g., a Van with a 500kg capacity) and a new driver with a valid license. Both default to the `AVAILABLE` status.
2. **Trip Drafting**: The *Dispatcher* logs in and drafts a new route assignment. The system actively validates the inputs: if the Dispatcher attempts to load 600kg of cargo into the 500kg Van, the system blocks the draft.
3. **Dispatch Execution**: Once a valid trip is drafted, the Dispatcher clicks "Dispatch". Atomically, the system locks the Vehicle and the Driver, changing their statuses to `ON_TRIP`.
4. **Concurrency Guard**: If another Dispatcher attempts to assign that same driver or vehicle to a different trip, they will find those assets completely hidden from the available dropdowns.
5. **Trip Completion**: Upon arrival, the Dispatcher completes the trip by entering the final odometer reading and the fuel consumed. The system updates the vehicle's total mileage, generates expense/fuel logs, and releases both the driver and vehicle back to `AVAILABLE`.
6. **Maintenance & Retirement**: If the *Fleet Manager* opens a maintenance record for a vehicle, it is immediately moved to `IN_SHOP` and pulled from the dispatch pool. If a vehicle is manually `RETIRED`, it permanently exits the ecosystem.
7. **Real-time Analytics**: At any point, the *Financial Analyst* or Fleet Manager can open the Reports tab to see real-time, live-recalculated metrics on Fleet Utilization, Average Fuel Efficiency, Total Operational Costs, and Vehicle ROI based on the live trip data.

---

## Technical Stack
Optimized for speed, consistency, and a beautiful dark-mode aesthetic:
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Framer Motion (for buttery-smooth page transitions), Recharts (for analytics), and Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL (using `mysql2/promise`), ensuring multi-row updates (like trip dispatching) run safely inside ACID-compliant SQL transactions.
- **Security**: JWT-based stateless authentication. Middleware rigorously re-verifies the user's role on every single `POST/PATCH/DELETE` request.

## How to Run Locally

### Prerequisites
- Node.js (v18+)
- MySQL Server

### 1. Database Setup
Ensure MySQL is running. Rename `.env.example` to `.env` and fill in your connection details:
```env
MYSQL_HOST="localhost"
MYSQL_PORT="3306"
MYSQL_USER="root"
MYSQL_PASSWORD="yourpassword"
MYSQL_DATABASE="transitops"
```
Run the seed script to automatically build the database schema and populate it with a comprehensive set of test data (vehicles, drivers, users, and trips):
```bash
node seed.cjs
```

### 2. Start the Application
Run the Vite development server (which also proxies backend requests):
```bash
npm run dev
```

### 3. Demo Accounts
The database is seeded with four users. They all share the same password: `password123`.
- `fleet.manager@transitops.dev`
- `dispatcher@transitops.dev`
- `safety.officer@transitops.dev`
- `finance.analyst@transitops.dev`
