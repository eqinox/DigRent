# Excavator System Management

A comprehensive equipment management system for tracking and organizing excavators and related equipment. This application provides a structured way to manage equipment inventory through categories and subcategories, with full CRUD operations and user authentication.

## Features

- **Equipment Management**: Create, read, update, and delete equipment records with detailed information
- **Category Organization**: Organize equipment into categories and subcategories for better inventory management
- **User Authentication**: Secure login system with role-based access control (admin/user roles)
- **Responsive UI**: Modern, mobile-friendly interface built with Tailwind CSS
- **Real-time Updates**: Optimistic UI updates with Redux state management
- **Image Management**: Upload and manage equipment and category images

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16.0.7 (App Router)
- **UI Library**: React 19.2.0
- **State Management**: Redux Toolkit 2.11.1
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives
- **Language**: TypeScript
- **Notifications**: Sonner

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
