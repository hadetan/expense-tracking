# Expense Tracker

Team expense tracking web application where employees submit expenses for approval and admins manage team expenses with analytics.

## Tech Stack

- **Frontend**: React + TypeScript + Redux + Material-UI
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma

## Project Structure

```
expense-tracker/
├── FE/                    # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store, slices
│   │   ├── services/      # API calls
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Helper functions
│   └── package.json
└── BE/                    # Backend Express API
    ├── src/
    │   ├── routes/        # API endpoints
    │   ├── controllers/   # Route handlers
    │   ├── middleware/    # Auth, validation
    │   ├── services/      # Business logic
    │   ├── types/         # TypeScript interfaces
    │   └── utils/         # Helper functions
    ├── prisma/
    │   ├── schema.prisma  # Database schema
    │   └── seed.ts        # Seed data
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd BE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

6. Seed the database (optional):
   ```bash
   npx prisma db seed
   ```

7. Start development server:
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd FE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_API_BASE_URL`: Backend API URL (default: `http://localhost:3000/api`)

4. Start development server:
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

## Development Commands

### Backend (BE/)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma migrate dev` - Create and apply migration
- `npx prisma generate` - Generate Prisma client
- `npx prisma db seed` - Seed database
- `npx prisma studio` - Open Prisma Studio GUI

### Frontend (FE/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

- **Authentication**: Email/password login with Supabase Auth
- **Expense Management**: Submit, view, edit, and resubmit expenses
- **Role-Based Access**: Employee and Admin roles with different permissions
- **Approval Workflow**: Admins can approve or reject pending expenses
- **Analytics Dashboard**: View team expense trends and category breakdowns
- **Filtering**: Filter expenses by date, category, and status
- **Redux Persistence**: Cached data persists across sessions
- **Bulk Upload**: Upload multiple expenses via CSV/Excel file
- **CI/CD Pipeline**: Automated testing, building

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployments:

- **Automated Linting**: ESLint for frontend, TypeScript checking for backend
- **Automated Testing**: Jest tests run on every commit and pull request
- **Pull Request Checks**: Automated checks ensure code quality before merging

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get expenses (filtered by role)
- `PATCH /api/expenses/:id` - Edit expense
- `PATCH /api/expenses/:id/approve` - Approve expense (Admin)
- `PATCH /api/expenses/:id/reject` - Reject expense (Admin)
- `GET /api/analytics` - Get team analytics (Admin)
- `POST /api/categories` - Create category
- `GET /api/categories` - Get all categories

## Database Schema

- **User**: User account information
- **Admin**: Admin role assignments
- **Category**: Expense categories
- **Expense**: Expense records with approval status
