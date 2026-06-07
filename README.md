# 🌾 CropShield — Crop Insurance & Farmer Risk Intelligence Platform

![CropShield](https://img.shields.io/badge/CropShield-v1.0.0-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.0-purple?style=for-the-badge&logo=vite)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?style=for-the-badge&logo=githubactions)

---

## 📌 Overview

**CropShield** is a full-stack Crop Insurance and Farmer Risk Intelligence Platform designed to help farmers register, manage their farms, file insurance claims, and receive AI-powered risk assessments. Admins and agents can monitor farmers, handle claims, and view dashboards with real-time analytics.

---

## ✨ Features

### 👨‍🌾 Farmer

- Register & manage farm profile
- Add crops and farm details
- File and track insurance claims
- View AI-powered risk summary for their farm
- Real-time crop inspection status

### 🛡️ Agent

- View and manage assigned farmer claims
- Conduct crop inspections
- Update claim statuses

### 🏛️ Admin

- Full dashboard with farmer & agent analytics
- Manage farmers and agents list
- Monitor all claims across the platform
- AI risk analysis overview

---

## 🛠️ Tech Stack

| Category         | Technology              |
| ---------------- | ----------------------- |
| Framework        | React 19                |
| Language         | TypeScript 6            |
| Build Tool       | Vite 8                  |
| Styling          | Tailwind CSS v3         |
| UI Components    | Shadcn/UI + Radix UI    |
| State Management | Redux Toolkit           |
| Server State     | TanStack React Query v5 |
| Forms            | React Hook Form + Zod   |
| HTTP Client      | Axios                   |
| Charts           | Recharts                |
| Animations       | Framer Motion           |
| Routing          | React Router DOM v7     |
| Deployment       | Vercel                  |
| CI/CD            | GitHub Actions          |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/ganeshPund7787/Crop-Insurance-Frontend.git

# Navigate to project
cd Crop-Insurance-Frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root (never commit this):

```env
VITE_API_BASE_URL=https://your-backend-api-url
VITE_APP_NAME=CropShield
VITE_APP_VERSION=1.0.0
```

### Run Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/
│   └── ui/               # Reusable Shadcn UI components
├── features/
│   ├── admin/            # Admin dashboard, farmers list, agents list
│   ├── agent/            # Agent claim management, inspections
│   ├── auth/             # Login, Register, Change Password
│   └── farmer/           # Farm management, claims, AI risk summary
├── hooks/                # Custom React hooks
├── lib/                  # Axios instance, query client, utilities
├── store/                # Redux store and slices
└── routes/               # React Router route definitions
```

---

## 🔄 CI/CD Pipeline

This project uses **GitHub Actions** for automated CI/CD with **Vercel** deployment.

```
Push to develop  →  Lint + Build  →  Deploy Preview URL
Push to main     →  Lint + Build  →  Deploy Production URL
```

### Pipeline Jobs

| Job               | Trigger           | Action                |
| ----------------- | ----------------- | --------------------- |
| Lint & Build      | All pushes & PRs  | ESLint + Vite Build   |
| Deploy Preview    | Push to `develop` | Vercel Preview URL    |
| Deploy Production | Push to `main`    | Vercel Production URL |

---

## 🐳 Docker Support

```bash
# Build Docker image
docker build \
  --build-arg VITE_API_BASE_URL=https://your-api-url \
  -t cropshield-frontend .

# Run container
docker run -p 80:80 cropshield-frontend
```

---

## 🌿 Branch Strategy

| Branch      | Purpose                           |
| ----------- | --------------------------------- |
| `main`      | Production — stable releases only |
| `develop`   | Development — feature integration |
| `feature/*` | Individual feature branches       |

---

## 🔗 Related Repositories

| Repo                                                                                 | Description                  |
| ------------------------------------------------------------------------------------ | ---------------------------- |
| [Crop-Insurance-Frontend](https://github.com/ganeshPund7787/Crop-Insurance-Frontend) | This repo — React Frontend   |
| Crop-Insurance-Backend                                                               | ASP.NET Core Web API Backend |

---

## 👨‍💻 Author

**Ganesh Pund**

- GitHub: [@ganeshPund7787](https://github.com/ganeshPund7787)
- LinkedIn: [linkedin.com/in/ganeshpund](https://linkedin.com/in/ganeshpund)

---

## 📄 License

This project is for educational and portfolio purposes.
