# OctoOps - Command & Control Dashboard

OctoOps is an AI-powered project coordination hub designed for elite mission specialists and quality assurance agents. It provides real-time task synchronization, automated risk detection, and a high-performance circular mission workstation.

## 🚀 Key Features

- **Circular Mission Interface**: High-visibility workstation with persistent AI-synced countdown timers.
- **AI Task Orchestration**: Automated task assignment and priority re-syncing using semantic agent logic.
- **QA Hub**: Specialized review queue with artifact inspection and rejection feedback loops.
- **Risk Agent**: Automated background scanner that identifies overdue missions, unassigned critical path units, and deadline bottlenecks.
- **Timeline Horizon**: Dynamic roadmap derivation from task milestones and statuses.

## 🛠️ Technical Stack

- **Frontend**: Next.js, React, Zustand (State Management), Tailwind CSS.
- **UI Components**: Lucide Icons, Shadcn/UI (Dialogs, Tabs, Toasts).
- **Persistence**: Hybrid local-hydration with REST API synchronization.

## 🏗️ Getting Started

1.  **Clone the repository**.
2.  **Install dependencies**: `npm install`.
3.  **Configure environment**: Ensure `NEXT_PUBLIC_API_URL` points to the OctoOps backend (default: `http://localhost:5000/api`).
4.  **Launch Dashboard**: `npm run dev`.

## 📂 Project Structure

- `/src/components/dashboard`: Core workstation and analytical components.
- `/src/components/dashboard/pages`: Tab-based views (Risks, Team, Tasks).
- `/src/lib/store.ts`: Central project intelligence and state orchestrator.
