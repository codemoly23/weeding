# LLCPad Demo Credentials & Local Setup Guide

## Local Setup (PostgreSQL - No Docker)

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 17+ (locally installed)
- **npm** or **pnpm**

### Step 1: Install PostgreSQL

**Windows:**
```bash
# Using winget
winget install PostgreSQL.PostgreSQL.17

# Or download from: https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
brew install postgresql@17
brew services start postgresql@17
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database & User

PostgreSQL ইনস্টল হলে, database এবং user তৈরি করুন:

```bash
# PostgreSQL shell এ যান (Windows)
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres

# macOS/Linux
psql -U postgres
```

SQL commands:
```sql
-- User তৈরি করুন
CREATE USER llcpad WITH PASSWORD 'llcpad123';

-- Database তৈরি করুন
CREATE DATABASE llcpad OWNER llcpad;

-- Privileges দিন
GRANT ALL PRIVILEGES ON DATABASE llcpad TO llcpad;

-- Exit
\q
```

### Step 3: Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/sajeebce/llcpad.git
cd llcpad

# Install dependencies
npm install
```

### Step 4: Configure Environment Variables

`.env.example` থেকে `.env` ফাইল তৈরি করুন:

```bash
cp .env.example .env
```

`.env` ফাইলে DATABASE_URL update করুন:
```env
DATABASE_URL="postgresql://llcpad:llcpad123@localhost:5432/llcpad?schema=public"
AUTH_SECRET="your-secret-key-here-generate-with-openssl"
```

### Step 5: Database Migration & Seeding

```bash
# Prisma client generate করুন
npm run db:generate

# Database schema push করুন
npm run db:push

# Demo data seed করুন (users, services, etc.)
npm run db:seed
```

### Step 6: Start Development Server

```bash
npm run dev
```

Server চালু হলে: **http://localhost:3000**

---

## Login URLs

| Portal | URL |
|--------|-----|
| **Login Page** | http://localhost:3000/login |
| **Admin Dashboard** | http://localhost:3000/admin |
| **Customer Dashboard** | http://localhost:3000/dashboard |

## Demo Users

All demo users have the same password: `Demo@123`

| Role | Email | Password | Login URL |
|------|-------|----------|-----------|
| **Admin** | admin@llcpad.com | Demo@123 | /login → /admin |
| **Customer** | customer@llcpad.com | Demo@123 | /login → /dashboard |
| **Content Manager** | content@llcpad.com | Demo@123 | /login → /admin |
| **Sales Agent** | sales@llcpad.com | Demo@123 | /login → /admin |
| **Support Agent** | support@llcpad.com | Demo@123 | /login → /admin |

## Role Permissions

### Admin (admin@llcpad.com)
- Full dashboard access
- User management (create, edit, delete users)
- All order management
- Service & package configuration
- System settings
- Financial reports
- Content management

### Customer (customer@llcpad.com)
- Browse services
- Place orders
- Track order status
- View/download documents
- Create support tickets
- Manage profile

### Content Manager (content@llcpad.com)
- Blog post management
- FAQ management
- Testimonial management
- Service descriptions
- SEO settings

### Sales Agent (sales@llcpad.com)
- View and manage orders
- Customer communication
- Lead tracking
- Sales reports

### Support Agent (support@llcpad.com)
- Support ticket management
- Customer communication
- Order status updates
- Document requests

## Database Connection

```
Host: localhost
Port: 5432
Database: llcpad
User: llcpad
Password: llcpad123

# Full Connection URL:
DATABASE_URL="postgresql://llcpad:llcpad123@localhost:5432/llcpad?schema=public"
```

## Useful Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Database commands
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run migrations
npm run db:studio      # Open Prisma Studio (GUI)
npm run db:seed        # Seed demo data
```

## Troubleshooting

### PostgreSQL Connection Failed
```bash
# Check if PostgreSQL is running (Windows)
"C:\Program Files\PostgreSQL\17\bin\pg_isready.exe" -h localhost -p 5432

# macOS/Linux
pg_isready -h localhost -p 5432
```

### Permission Denied Errors
```sql
-- PostgreSQL shell এ যান এবং run করুন:
GRANT ALL ON SCHEMA public TO llcpad;
ALTER DATABASE llcpad OWNER TO llcpad;
```

### Port Already in Use
```bash
# Windows - find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

---

> **Note:** These are demo credentials for development only. Change all passwords before deploying to production.
