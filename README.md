# RT Direct - Radiologic Technologist Job Board

A modern job board platform connecting radiologic technologists with healthcare facilities. Built with Next.js 15, TypeScript, Supabase, and Tailwind CSS.

## ✨ Features

- **🔐 Role-based Authentication** - Separate flows for radiologic techs and employers
- **💼 Job Board** - Advanced search and filtering for radiology positions  
- **📱 Modern UI** - Responsive design with shadcn/ui components
- **🎭 GSAP Animations** - Smooth, engaging animations throughout the app
- **🚀 Real-time Database** - Powered by Supabase with Row Level Security
- **🔍 Advanced Filtering** - Search by location, work type, salary, and more
- **📋 Application Management** - Track applications and manage candidates

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Animation**: GSAP with ScrollTrigger
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account
- A Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd rt-direct
npm install
```

### 2. Environment Setup

Create `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Get your credentials:**
   - Go to Settings → API
   - Copy your Project URL and anon/public key
   - Add them to your `.env.local` file

3. **Set up the database:**
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase-schema.sql`
   - Run the SQL script to create all tables and policies

4. **Configure Authentication:**
   - Go to Authentication → Settings
   - Enable email authentication
   - Configure your site URL (for local development: `http://localhost:3000`)

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
/src
  /app
    /auth           # Authentication pages (sign in, sign up)
    /dashboard      # User dashboard (role-based)
    /jobs           # Job listings and details
    /employers      # Employer-specific pages
    layout.tsx      # Root layout
    page.tsx        # Home page with GSAP animations
  /components
    /ui             # shadcn/ui components
    /shared         # Reusable components
  /lib
    auth.ts         # Authentication utilities
    supabase.ts     # Supabase client configuration
    utils.ts        # Utility functions
  /types
    database.ts     # Database type definitions
    index.ts        # Exported types
```

## 🎯 Key Features Explained

### Authentication System
- **Role Selection**: Users choose between "Radiologic Tech" or "Employer" during signup
- **Profile Creation**: Automatic creation of role-specific profiles
- **Protected Routes**: Dashboard and application features require authentication

### Database Schema
- **Profiles**: Base user information with role designation
- **Tech Profiles**: Certifications, experience, specializations
- **Employer Profiles**: Company information and verification status
- **Jobs**: Full job postings with requirements and benefits
- **Applications**: Application tracking and status management

### Job Board Features
- **Advanced Filtering**: Location, work type, employment type, salary range
- **Real-time Search**: Instant filtering as users type
- **Responsive Cards**: Modern job listing cards with key information
- **Application Tracking**: Status updates from application to hire

### GSAP Animations
- **Hero Section**: Staggered text animations and floating elements
- **Scroll Triggers**: Elements animate as they enter the viewport
- **Micro-interactions**: Smooth hover effects and transitions

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy:**
   ```bash
   vercel login
   vercel --prod
   ```

3. **Environment Variables:**
   - Add your Supabase credentials in Vercel dashboard
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Update Supabase Settings:**
   - In Supabase Auth settings, add your production URL
   - Update any CORS settings if needed

### Alternative Deployment Options

- **Netlify**: Connect your GitHub repo and deploy
- **Railway**: One-click deployment with database included  
- **Self-hosted**: Use `npm run build && npm start`

## 🔧 Configuration Options

### Supabase Row Level Security (RLS)

The database includes comprehensive RLS policies:
- Users can only modify their own profiles
- Employers can only manage their own job postings
- Tech users can only view and manage their own applications
- Secure data access based on user roles

### Role-based Access Control

```typescript
// Example: Check user role
const userRole = await getUserRole(userId)
if (userRole === 'employer') {
  // Show employer features
} else if (userRole === 'tech') {
  // Show tech features
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Development Checklist

- [ ] Set up Supabase project and run schema
- [ ] Configure environment variables
- [ ] Test authentication flows (sign up/sign in)
- [ ] Test role-based dashboard access
- [ ] Verify job posting and application features
- [ ] Test responsive design on mobile devices
- [ ] Check GSAP animations performance
- [ ] Set up production deployment

## 🛡️ Security Considerations

- All database access is protected by RLS policies
- User authentication handled by Supabase Auth
- Environment variables properly configured
- Input validation on forms
- HTTPS enforced in production

## 📈 Performance Optimizations

- Next.js 15 with App Router for optimal performance
- Image optimization with Next.js Image component
- Lazy loading of heavy components
- Efficient database queries with proper indexing
- GSAP animations optimized for 60fps

## 🔍 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check your environment variables
   - Verify project URL and API keys
   - Ensure Supabase project is not paused

2. **Authentication Not Working**
   - Check site URL in Supabase Auth settings
   - Verify email confirmation settings
   - Check browser console for errors

3. **Database Policies Error**
   - Ensure RLS policies are properly set up
   - Check user has correct role assigned
   - Verify policy conditions match your use case

4. **GSAP Animations Not Working**
   - Check if ScrollTrigger plugin is registered
   - Verify GSAP is properly imported
   - Check for console errors

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check Next.js documentation
4. Open an issue in the repository

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**RT Direct** - Connecting radiologic technologists with their ideal career opportunities. 🏥✨
