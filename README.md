# Eternal Backend API

Express + TypeScript + Prisma 기반 Node.js 백엔드 애플리케이션

## 🚀 Tech Stack

- **Runtime**: Node.js (LTS >=18)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Code Quality**: ESLint + Prettier

## 📁 Project Structure

```
BE/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access layer
│   ├── routes/          # Route definitions
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Prisma schema
├── dist/                # Compiled JavaScript (generated)
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
├── .eslintrc.json       # ESLint configuration
├── .prettierrc.json     # Prettier configuration
└── package.json
```

## 🛠️ Setup

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL (running locally or remote)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ChoiTheCreator/Eternal-BE.git
   cd Eternal-BE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `PORT`: Server port (default: 3000)
   - `NODE_ENV`: Environment (development/production)

4. **Setup Prisma**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations (creates database tables)
   npm run prisma:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Server will start at `http://localhost:3000`

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server with hot-reload (tsx watch)
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server (requires build first)
- `npm run type-check` - Type check without emitting files

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Database (Prisma)
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migrations (dev)
- `npm run prisma:migrate:deploy` - Apply migrations (production)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 🌐 API Endpoints

### Health Check
- `GET /health` - Check server and database health status

### Root
- `GET /` - API information

## 🏗️ Architecture

This project follows a layered architecture:

1. **Routes** (`src/routes/`) - Define API endpoints
2. **Controllers** (`src/controllers/`) - Handle HTTP requests/responses
3. **Services** (`src/services/`) - Business logic
4. **Repositories** (`src/repositories/`) - Database operations (optional layer)
5. **Middleware** (`src/middleware/`) - Express middleware (auth, error handling, etc.)

## 🔧 Configuration

### TypeScript
Configuration in `tsconfig.json` - strict mode enabled, path aliases configured (`@/*`)

### Prisma
Database schema defined in `prisma/schema.prisma`. Modify and run migrations to update.

### Environment Variables
Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (optional, default: 3000)
- `NODE_ENV` - Environment (development/production)

## 📝 Development Workflow

1. Make changes to TypeScript files in `src/`
2. Development server auto-reloads on file changes
3. Use `npm run lint` and `npm run format` before committing
4. Create Prisma migrations when schema changes: `npm run prisma:migrate`

## 🔒 Cross-Platform Compatibility

All scripts are cross-platform compatible (Windows/macOS/Linux):
- Uses `tsx` for TypeScript execution (no compilation step needed for dev)
- Path separators handled correctly
- No OS-specific commands in scripts

## 📦 Production Build

```bash
# Build TypeScript
npm run build

# Apply database migrations
npm run prisma:migrate:deploy
npm run prisma:generate

# Start production server
npm start
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists (Prisma will create schema automatically via migrations)

### Port Already in Use
- Change `PORT` in `.env` or kill the process using the port

### Prisma Client Not Generated
- Run `npm run prisma:generate` after schema changes

## 📄 License

ISC

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run format`
4. Test your changes
5. Submit a pull request

