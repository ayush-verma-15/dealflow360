# DealFlow360 🚀

DealFlow360 is a full-stack sales and deal management platform built to manage the complete journey of a deal — starting from quotation creation and approval, all the way to inventory, fulfillment, billing, and customer interaction.

We built this project as a team to bring different business operations together in one platform instead of managing them separately.

---

## What is DealFlow360?

In a typical sales process, different teams handle different parts of a deal. Sales manages quotations, managers handle approvals, warehouse teams manage stock, finance handles billing, and customers need a way to interact with their quotations.

DealFlow360 connects these processes into a single system.

The main idea is simple:

**Create Deal → Check Pricing → Approval → Customer Negotiation → Inventory → Fulfillment → Billing**

---

## Features

### 🔐 Authentication & User Roles

* User registration and login
* JWT-based authentication
* Role-based access control
* Protected API routes
* Different access levels for Sales, Managers, Finance, Admin and Customers

### 💼 Deal & Quotation Management

* Create and manage quotations
* Product and pricing management
* Discount handling
* Deal risk checking
* Approval workflow
* Customer negotiation
* Deal status tracking

### 📦 Inventory & Warehouse

* Product catalog
* Stock management
* Warehouse management
* Inventory allocation
* Stock movement tracking
* Fulfillment management

### 💳 Billing & Subscriptions

* Invoice management
* Payment tracking
* Subscription management
* Subscription proration
* Billing integration with deals

### 📊 Deal Health

The system also helps identify deals that may need attention, such as:

* Stalled deals
* Potential deal anomalies
* Delivery-related risks
* Deal performance issues

### 🔔 Notifications

* User notifications
* Read/unread notification status
* Workflow-based notifications
* Real-time updates using Socket.IO

### 👤 Customer Portal

Customers have their own portal where they can:

* View their quotations
* Respond to quotations
* Participate in negotiations
* Access only the information related to their account

---

## Tech Stack

### Frontend

* React
* Vite
* React Router
* TanStack Query
* Axios
* Material UI
* Recharts

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Socket.IO

### Other Tools

* Jest
* Docker
* Docker Compose
* Nginx
* Git & GitHub

---

## Project Structure

```text
dealflow360/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── docker/
│   └── docker-compose.yml
│
├── docs/
│
├── .env.example
├── package.json
├── README.md
└── .gitignore
```

---

## How the System Works

The basic flow of a deal in DealFlow360 looks like this:

```text
Customer / Sales
       ↓
Quotation Created
       ↓
Pricing & Discount Check
       ↓
Risk Evaluation
       ↓
Approval Required?
    ↙       ↘
  Yes        No
   ↓          ↓
Manager    Continue
Approval      ↓
    ↘         ↙
     Customer Negotiation
              ↓
      Inventory Allocation
              ↓
          Fulfillment
              ↓
            Billing
              ↓
        Deal Completed
```

One important part of our approach is that **important business rules are handled on the backend**, rather than trusting the frontend. This includes pricing calculations, approvals, risk checks, inventory-related operations and customer authorization.

---

## API Modules

| Module               | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `/api/auth`          | Authentication and user management             |
| `/api/products`      | Products, stock and recommendations            |
| `/api/quotes`        | Quotations, pricing, approvals and negotiation |
| `/api/warehouses`    | Warehouse and inventory operations             |
| `/api/billing`       | Invoices, payments and subscriptions           |
| `/api/deal-health`   | Deal health and risk-related checks            |
| `/api/notifications` | Notifications                                  |
| `/api/reports`       | Sales reports                                  |

---

## Team

We divided the project into different areas so that everyone could work on a specific part of the system.

| Member         | Role                       | Main Work                                                         |
| -------------- | -------------------------- | ----------------------------------------------------------------- |
| 🧠 **Ayush**   | Team Leader / Backend Core | Project setup, architecture, approval logic and team coordination |
| ⚙️ **Nishank** | Backend / Inventory        | Warehouse logic, stock management and fulfillment                 |
| 🎨 **Vaibhav** | Frontend / UI              | React components, customer portal and dashboard                   |
| 🔗 **Rohan**   | Full Stack / Integration   | Billing, subscriptions, API integration and testing               |

---

## Getting Started

### Requirements

Before running the project, make sure you have:

* Node.js 20+
* MongoDB
* npm
* Git

### Clone the project

```bash
git clone https://github.com/ayush-verma-15/dealflow360.git

cd dealflow360
```

### Setup environment variables

Create a `.env` file using the example file:

```powershell
Copy-Item .env.example .env
```

Then add the required environment variables:

```env
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
PORT=
CLIENT_URL=
CORS_ORIGIN=
```

### Install dependencies

```bash
npm run install:all
```

### Run the project

Start the backend:

```bash
npm run dev:backend
```

In another terminal, start the frontend:

```bash
npm run dev:frontend
```

---

## Running with Docker

You can also run the application using Docker Compose:

```bash
docker compose -f docker/docker-compose.yml up --build
```

---

## Testing

To run the test suite:

```bash
npm run test
```

To build the project:

```bash
npm run build
```

---

## Demo Data

For local testing, demo data can be created using:

```bash
npm --prefix backend run seed:demo
```

To reset and recreate the demo data:

```bash
npm --prefix backend run seed:reset
```

Demo password:

```text
Test@123
```

---

## Future Improvements

There are several things we would like to improve further:

* PDF and CSV export
* More detailed reports and dashboards
* Better real-time workflows
* Improved administration screens
* AI-based deal recommendations
* Sales forecasting
* More advanced customer analytics
* CI/CD and cloud deployment

---

## Why We Built DealFlow360

The main reason behind DealFlow360 was to solve a common problem in sales operations: **different teams work on different parts of the same deal, but their workflows are often disconnected.**

Our goal was to create one platform where sales, management, inventory, fulfillment, finance and customers can work around the same deal.

This project also gave our team practical experience with **MERN stack development, REST APIs, authentication, role-based access, database design, real-time communication, Docker and team-based Git workflows.**

---

## GitHub

The complete source code is available here:

[DealFlow360 GitHub Repository](https://github.com/ayush-verma-15/dealflow360?utm_source=chatgpt.com)

---

## Team DealFlow360 ❤️

Built as a team project with **React, Node.js, Express, MongoDB and a lot of debugging.**
