# Estate Finance - Backend (NestJS)

This is the central API and business logic engine for the **Estate Finance - Transaction Management System**. Built on top of **NestJS** and **MongoDB (Mongoose)**, this backend enforces strict financial formulas, state transitions, and database integrity.

## 🚀 Tech Stack

- **Framework:** NestJS (Node.js/TypeScript)
- **Database Layer:** MongoDB Atlas with Mongoose ODM (`@nestjs/mongoose`)
- **Data Validation:** `class-validator`, `class-transformer`
- **Documentation:** Swagger (`@nestjs/swagger`)
- **Export capabilities:** ExcelJS, PDFKit
- **Testing:** Jest

---

## 🛠 Setup & Installation

### 1. Prerequisites
- Node.js (LTS version)
- A running instance of MongoDB (Local or Atlas)

### 2. Environment Variables
Create a `.env` file at the root of the `backend` folder:
```env
MONGODB_URI=mongodb://localhost:27017/estate-finance  # Replace with your actual URI
PORT=3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the Application

```bash
# development
npm run start

# watch mode (Standard for active development)
npm run start:dev

# production mode
npm run start:prod
```

### 5. Interacting with the API
Once the server is running (default `http://localhost:3000`), you can access the automatically generated interactive API documentation and testing interface:
- **Swagger API Docs:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🏗 Core Modules & Philosophy

The code strictly adheres to NestJS's modular structure. Operations are broken down into isolated components.

### Transaction Management (`src/transactions`)
This is the core module holding almost all the financial weight of the application.
- **Data Integrity via Embedded Documents:** Commission variables and exact financial breakdowns are calculated dynamically and embedded strictly inside the transaction document at creation time. Historic policy snapshots `appliedPolicy` preserve exact configurations.
- **Commission Split Rules SSoT:** All percentages run through a centralized `CommissionPolicy` constant ensuring zero magic numbers.
- **Input Normalization & Partial Regex Finding:** Incoming names and addresses are strictly mapped through `string.utils.ts` to `Title Case`. Searches implement robust MongoDB `$regexp` partial scans configured to correctly identify specific language accents (e.g. Turkish `i` / `I`).
- **Enforced Lifecycle & Immutability:** Transactions must flow `agreement` ➔ `earnest_money` ➔ `title_deed` ➔ `completed`. Transition endpoints act as guards. Extremely rigid checks prevent ANY modifications / transitions once a transaction reaches the `completed` state ensuring bulletproof traceability.

### Global Validation
We use NestJS `ValidationPipe` globally. Data Transfer Objects (DTOs) with `class-validator` decorators ensure that malformed data yields automatic `400 Bad Request` errors, stopping bad input at the network edge.

---

## 🧪 Testing

Ensuring the automated calculations remain accurate is critical. The backend utilizes Jest for testing:

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate code coverage
npm run test:cov

# Run End-to-End (e2e) tests
npm run test:e2e
```

---

## 📁 Directory Structure
```text
backend/
├── src/
│   ├── common/             # Global pipes, filters, utility functions
│   ├── fonts/              # Custom fonts for PDF generation
│   ├── transactions/       # Core domain (Controllers, Services, Schemas)
│   ├── app.module.ts       # Root module linking all functional modules
│   └── main.ts             # Application bootstrap & Swagger config
├── test/                   # E2E test files
├── .env                    # Environment configuration
├── nest-cli.json           # NestJS CLI build configurations
└── package.json            # Script definitions and dependency mapping
```
