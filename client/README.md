# Chat App Client

React frontend for the Chat Application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Features

- **Authentication**: Login and Register functionality
- **Protected Routes**: Root route checks for valid token
- **Welcome Page**: Displays username when logged in
- **Token Management**: Stores JWT token in localStorage

## Routes

- `/` - Welcome page (protected, requires valid token)
- `/auth` - Authentication page (login/register options)
- `/auth/login` - Redirects to /auth
- `/auth/register` - Redirects to /auth

## API Integration

The client communicates with the backend API:
- `POST /auth/login` - Login endpoint
- `POST /auth/register` - Register endpoint

Backend runs on `http://localhost:3000`
