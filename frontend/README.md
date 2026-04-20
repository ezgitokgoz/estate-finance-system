# Estate Finance - Frontend (Nuxt 3)

This is the frontend application for the **Estate Finance - Transaction Management System**. It is a modern Single Page Application (SPA) built using **Nuxt 3** and **Vue 3**. It provides a sleek, responsive, and highly functional dashboard for real estate agents to manage their deals, track financials, and monitor transaction stages.

## 🚀 Tech Stack

- **Framework:** Nuxt 3 (built on Vue 3 Composition API)
- **State Management:** Pinia
- **Styling:** Tailwind CSS
- **Network Requests:** Axios
- **Icons & UI:** Heroicons / Tailwind UI (implicit)

---

## 🛠 Setup & Installation

Make sure your backend is running before testing full API integrations.

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Server
Start the frontend in development mode with Hot Module Replacement (HMR).
```bash
npm run dev
```
The application will be available at [http://localhost:3001](http://localhost:3001). 

**API Configuration:**
The app leverages Nuxt's `runtimeConfig`. By default, it targets `http://localhost:3000` for the backend. In production or custom environments, inject your backend URL by setting the `NUXT_PUBLIC_API_BASE` environment variable.

### 3. Production Build
To create a production-ready bundle:
```bash
npm run build
```
You can locally preview the built production app by running:
```bash
npm run preview
```

---

## 🏗 Architecture & Core Concepts

### Component Modularity
To avoid complex "God Components", the UI is strictly divided into functional pieces inside the `components/` directory:
- **`TransactionForm.vue`:** A dynamic form for creating and updating transactions. It validates inputs and utilizes native HTML `<datalist>` to provide automatic contextual autocompletion for Agency/Agent names queried from the database.
- **`TransactionTable.vue`:** Displays the core data grid. Implements **Infinite Scrolling** intersecting with the viewport to fetch subsequent pages automatically.
- **`TransactionFilters.vue`:** A reusable search and filter bar that emits query parameters mapping to backend indices.
- **`AppNotifications.vue`:** A floating global toast notification UI.
- **`AppHeader.vue`:** The main navigation bar with completely synced Server-to-Client Global counts.

### State Management (`stores/`)
We use **Pinia** for centralized, type-safe state logic:
- **`stores/transaction.ts`:** The single source of truth for all transaction data. It handles all async API requests (using Axios) such as `fetchTransactions`, `createTransaction`, `transitionStage`, and fetches `uniqueAgents`. It delegates sorting operations safely to the backend API ensuring true global temporal mapping rather than limited memory sorting.
- **`stores/notification.ts`:** Manages global application states like success/error popups.

### Infinite Scroll & Pagination
Instead of classic pagination numbers, the application uses an infinite scrolling UX. When the user scrolls to the bottom of `TransactionTable.vue`, it triggers Pinia to fetch the next chunk of data from the NestJS backend and appends it natively to the DOM without requiring a full page refresh. Backend integration controls data integrity for searching and sorting across partial batches.

---

## 📁 Project Structure

```text
frontend/
├── app.vue                 # The root Vue component for the app shell
├── components/             # Reusable UI elements (Form, Table, Filters)
├── stores/                 # Pinia stores (Transaction logic, network calls)
├── public/                 # Static assets (images, icons)
├── nuxt.config.ts          # Core Nuxt engine and module configuration
├── package.json            # Node.js dependencies and run scripts
└── README.md               # This documentation file
```

---

## 🔗 Useful Links
- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Pinia State Management](https://pinia.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
