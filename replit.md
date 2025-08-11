# DataSync - Team Data Integration Platform

## Overview

DataSync is a collaborative data integration platform built with a modern full-stack architecture. It enables teams to connect multiple data sources (PostgreSQL, APIs, CSV files), create reports, and collaborate in real-time. The application features a dashboard for monitoring data metrics, team activity tracking, and comprehensive data source management with visual reporting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite for development and building
- **Routing**: Wouter for client-side routing with file-based route organization
- **UI Components**: Shadcn/ui component library with Radix UI primitives and Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes
- **Layout**: Responsive design with sidebar navigation and collaboration panel

### Backend Architecture
- **Framework**: Express.js server with TypeScript
- **API Design**: RESTful API structure with modular route organization
- **Middleware**: Custom logging middleware for request tracking and error handling
- **Development**: Hot module replacement with Vite integration for seamless development experience
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations for database versioning and updates
- **Connection**: Neon Database serverless PostgreSQL for cloud hosting
- **Data Models**: Comprehensive schema including users, data sources, reports, team activities, and comments

### Authentication and Authorization
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **User System**: Role-based user management with online status tracking
- **Security**: Environment-based configuration for database credentials

### External Service Integrations
- **Database Provider**: Neon Database serverless PostgreSQL
- **Development Tools**: Replit-specific plugins for development environment integration
- **Data Sources**: Support for multiple external data source types (PostgreSQL, REST APIs, CSV files)

### Key Design Patterns
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Type Safety**: End-to-end TypeScript with shared types between frontend and backend
- **Component Architecture**: Modular React components with shadcn/ui design system
- **API Abstraction**: Centralized API client with error handling and request/response interceptors
- **Real-time Collaboration**: Team activity tracking and comment system for collaborative features