# EduSpace - Online Learning Platform

A full-stack online learning platform built with MERN stack (MongoDB, Express, React, Node.js) deployed on Vercel.

## Features

### Authentication
- Gmail OTP-based registration and login
- Password change functionality
- Forgot password with email reset
- JWT-based session management
- Role-based access control (Admin/Student)

### Course Management
- Create, edit, and delete courses (Admin)
- Video-based chapter content
- PDF notes upload for each chapter (multiple files supported)
- Course enrollment system

### Student Features
- Browse and enroll in courses
- Watch video lessons
- Download PDF notes
- Track enrollment status
- View enrolled courses

### Admin Dashboard
- User management
- Course creation and editing
- Student enrollment tracking
- Pending enrollment approvals
- Responsive admin interface

### Additional Features
- Fully responsive design (mobile, tablet, desktop)
- Clean, modern UI
- Security enhancements (rate limiting, input validation, secure headers)

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, Gmail OTP (Nodemailer)
- **File Storage**: Cloudinary (for videos and PDFs)
- **Deployment**: Vercel

## Project Structure

```
/home/alamin/OC1/
├── api/                    # Vercel Serverless Functions
│   ├── auth/              # Authentication endpoints
│   ├── models/            # Mongoose models
│   ├── middleware/        # Auth middleware
│   └── lib/               # Database connection
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   └── context/       # React context
│   └── index.html
├── .env.example           # Environment variables template
└── vercel.json            # Vercel configuration
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```
3. Create `.env` file (copy from `.env.example`):
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_gmail_email
   EMAIL_PASS=your_gmail_app_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

## Deployment

The project is configured for Vercel deployment. Push to GitHub and connect to Vercel for automatic deployments.

Live demo: https://bipulsclassroom.com

## License

MIT
