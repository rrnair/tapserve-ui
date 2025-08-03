# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TapServe is a Next.js expense management application for restaurants, focusing on multi-outlet expense tracking with OCR bill processing and offline-first capabilities. The application is built with TypeScript, Tailwind CSS, and shadcn/ui components.

## Development Commands

```bash
# Development server
npm run dev

# Mock server for testing
npm run mock

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture & Structure

### Tech Stack
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom restaurant theme colors
- **Icons**: Lucide React
- **Theme**: next-themes with dark/light/system modes

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── categories/        # Category management
│   ├── expenses/          # Expense management (add, history, reports, scan)
│   ├── vendors/           # Vendor management
│   └── dashboard/         # Main dashboard
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utility functions
├── services/             # API service layer
├── stores/               # Zustand state management
└── types/                # TypeScript type definitions
```

### Key Features
- Multi-tenant restaurant expense management
- OCR bill processing and digitization
- Offline-first architecture with sync capabilities
- Role-based access control (cashier, manager, owner)
- Mobile-responsive PWA design
- Theme customization with restaurant branding

### Component Library
- Uses shadcn/ui components configured in `components.json`
- Custom theme with restaurant-specific colors defined in `tailwind.config.js`
- Path aliases configured for clean imports (@/components, @/lib, etc.)

### State Management
- Zustand stores for different concerns (auth, expenses, offline sync)
- Service layer in `src/services/` for API interactions
- Type definitions in `src/types/` for data models

### Development Notes
- The application supports theme switching (dark/light/system)
- Custom restaurant theme colors are defined in Tailwind config
- API services are centralized in the services directory
- Form validation using Zod schemas with React Hook Form
- Mobile-first responsive design approach