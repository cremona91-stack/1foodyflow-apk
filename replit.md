# FoodyFlow

## Overview

FoodyFlow is a comprehensive restaurant management system designed to help restaurant owners and kitchen staff track inventory, calculate food costs, manage recipes and dishes, and monitor waste and sales performance. The application provides real-time food cost calculations, inventory management, and detailed sales reporting to optimize restaurant profitability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in strict mode
- **Styling**: Tailwind CSS with custom restaurant-focused design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **Theme**: Next-themes for dark/light mode support with custom color palette optimized for restaurant environments

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with consistent error handling
- **Request Processing**: JSON and URL-encoded body parsing
- **Development**: Hot module replacement via Vite integration

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL via `@neondatabase/serverless`
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Drizzle-Zod integration for runtime type safety

### Database Schema Design
The system manages five core entities:
- **Products**: Raw ingredients and supplies with waste tracking, supplier information, and unit pricing
- **Recipes**: Ingredient combinations with cost calculations for preparation items
- **Dishes**: Complete menu items with ingredient lists, selling prices, and food cost percentages
- **Waste**: Tracking of product waste with cost implications
- **Personal Meals**: Staff meal tracking for accurate cost accounting

### Authentication and Authorization
Currently implements a simplified session-based system with:
- Basic request logging and error handling middleware
- Credential-based fetch requests for API security
- No complex user authentication (suitable for single-restaurant use)

## External Dependencies

### Database Services
- **Neon**: Serverless PostgreSQL hosting platform
- **Drizzle ORM**: Type-safe database queries and migrations
- **Connect-pg-simple**: PostgreSQL session storage (configured but not actively used)

### UI and Styling
- **Radix UI**: Accessible component primitives for complex interactions
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **Inter & JetBrains Mono**: Typography fonts for readability and data display

### Development and Build Tools
- **Vite**: Frontend build tool with hot module replacement
- **esbuild**: Backend bundling for production builds
- **TypeScript**: Static type checking across the entire stack
- **Replit**: Development platform integration with cartographer and error overlay plugins

### Form and Data Handling
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Integration between React Hook Form and Zod
- **Date-fns**: Date manipulation utilities

### Additional Libraries
- **Class Variance Authority**: Component variant management
- **clsx & tailwind-merge**: Conditional CSS class composition
- **cmdk**: Command palette functionality
- **Embla Carousel**: Carousel/slider components for UI enhancement