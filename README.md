# BALAJI COMPUTER - Premier Computer Coaching Institute

> **Branding:** BALAJI COMPUTER  
> **Tagline:** *Learn Today, Lead Tomorrow.*  
> **Architecture:** Full Stack MERN (React.js + Tailwind CSS + Node.js + Express.js + MongoDB)

---

## 1. Overview

**Balaji Computer** is a modern, responsive, production-ready educational web platform for a professional computer coaching institute. It offers complete information about institute certification courses (ADCA, DCA, Tally Prime + GST, MERN Stack, Python, DTP), dynamic enrollment statistics, real-time course filtering, verified student testimonials, and a secure role-based student and admin authentication system.

---

## 2. Completed Modules & Features

### Module 1: Design System & UI/UX
- **Color Palette:**
  - Primary: `#2563EB` (Tailwind `blue-600`)
  - Secondary: `#0F172A` (Tailwind `slate-900`)
  - Accent: `#F59E0B` (Tailwind `amber-500`)
  - Background: `#F8FAFC` (Tailwind `slate-50`)
  - Surface: `#FFFFFF` (White)
  - Success: `#16A34A` (Tailwind `emerald-600`)
  - Danger: `#DC2626` (Tailwind `red-600`)
- **Typography:** Inter (Body) & Poppins (Headings) via Google Fonts.
- **Component System:** Reusable UI components (`Button`, `Input`, `PasswordInput`, `Card`, `Badge`, `Modal`).
- **Responsive Layout:** Tested across mobile (375px, 430px), tablet (768px), laptop (1024px), and desktop (1440px).

### Module 2: Professional Home Page
- **Sticky Responsive Navbar:** Logo with custom SVG emblem, institute title & tagline, desktop navigation, mobile drawer menu, active link highlighting, dynamic authentication status with user avatar, name, and role-based dashboard shortcuts.
- **Hero Section:** "Build Your Future With Practical Computer Education", value proposition, "Explore Courses" and "Join Our Institute" action buttons, trust indicators (100% practical lab, 96.5% certification success, 4.9★ rating), and admission batch card.
- **Dynamic Statistics Section:** Total students (3,250+), available courses (12+), expert faculty (18+), successful students (2,900+). Powered by `GET /api/stats` with instant fallback and skeleton loaders.
- **Why Choose Us Section:** 4 feature cards: Experienced Faculty, Practical Learning, Affordable Education, and Career-Oriented Courses with hover animations.
- **Popular Courses Section:** Dynamic course cards displaying duration, fee, level, badge, and interactive "View Details" modal with full syllabus and features. Powered by `GET /api/courses`.
- **Why Learn With Us Section:** Practical lab methodology, real-world projects, daily batch timings breakdown, and lab schedule tips.
- **Student Testimonials:** Interactive slider with forward/backward navigation, dot indicators, star ratings, and verified student markers (`GET /api/testimonials`).
- **Call to Action (CTA):** "Start Your Computer Learning Journey Today!" with registration and course catalog links.
- **Multi-Column Footer:** Institute mission, configurable contact details, quick links, popular courses, social media links, privacy policy, and terms of service.

### Module 3: Authentication & Security Architecture
- **JWT + HTTP-Only Cookies:** Secure cookie issuance (`token`) along with Bearer token header compatibility.
- **Server-Enforced Role-Based Authorization:**
  - Users are strictly registered with `role: "student"` on the server.
  - Role-based redirects:
    - `admin` → `/admin/dashboard`
    - `faculty` → `/faculty/dashboard`
    - `student` → `/student/dashboard`
- **Password Security:** Salted hashing with `bcrypt` (10 rounds). Passwords never stored in plaintext or sent to the client.
- **Session Persistence:** Verified automatically on page mount / reload via `GET /api/auth/me`.
- **Protected Routes:** `ProtectedRoute.jsx` guards student and admin panels, redirecting unauthorized or unauthenticated visits.
- **Logout:** Server cookie revocation (`res.clearCookie`) and client state cleanup with success notifications.

### Module 4: Student Registration & Login Pages
- **Login Page (`/login`):** Two-column desktop layout with branding & trust indicators on the left, accessible form on the right, email/password validation, show/hide password toggle, remember me checkbox, and forgot password modal.
- **Registration Page (`/signup`):** Full name, email, 10-digit mobile number, course dropdown dynamically fetched from backend API, optional gender selector, password strength indicator, confirm password matching, and terms acceptance.

---

## 3. Project Structure

```
Balaji_Computer/
├── package.json                 # Unified workspace scripts
├── README.md                    # Project documentation
│
├── server/                      # Express.js Backend
│   ├── .env                     # Server environment configuration
│   ├── .env.example             # Example environment variables
│   ├── app.js                   # Express configuration, CORS, routes & error handling
│   ├── server.js                # Database connection & server listener
│   ├── config/
│   │   └── db.js                # MongoDB connection with resilient timeout
│   ├── controllers/
│   │   ├── auth.controller.js   # Signup, login, logout, getMe profile
│   │   ├── course.controller.js # Course CRUD & default seed data
│   │   └── institute.controller.js # Dynamic statistics, testimonials & faculty
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification (cookie + Bearer)
│   │   ├── role.middleware.js   # Role-based access control
│   │   └── error.middleware.js  # Global 404 & error handler
│   ├── models/
│   │   ├── userModel.js         # User schema (fullName, email, password, role, etc.)
│   │   └── courseModel.js       # Course schema (title, code, fee, syllabus, etc.)
│   └── routes/
│       ├── auth.routes.js       # /api/auth endpoints
│       ├── course.routes.js     # /api/courses endpoints
│       └── institute.routes.js  # /api/stats, /api/testimonials, /api/faculty
│
└── client/                      # React.js + Vite Frontend
    ├── vite.config.js           # Vite config with @tailwindcss/vite & API proxy
    ├── index.html               # Head metadata, Google Fonts (Inter, Poppins)
    └── src/
        ├── App.jsx              # BrowserRouter, AuthProvider, Toaster, AppRoutes
        ├── index.css            # Tailwind v4 configuration & theme tokens
        ├── context/
        │   └── AuthContext.jsx  # Centralized authentication state & methods
        ├── hooks/
        │   └── useAuth.js       # Custom auth hook
        ├── services/
        │   └── api.js           # Fetch wrapper with credentials and typed API endpoints
        ├── routes/
        │   ├── AppRoutes.jsx    # Complete application routing table
        │   └── ProtectedRoute.jsx # Role-based route guard
        ├── layouts/
        │   ├── PublicLayout.jsx # Public wrapper (Navbar + Footer)
        │   ├── StudentLayout.jsx# Student Portal sidebar & header
        │   └── AdminLayout.jsx  # Admin portal sidebar & header
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.jsx   # Sticky responsive navbar with dynamic auth state
        │   │   ├── Footer.jsx   # 4-column footer
        │   │   ├── Logo.jsx     # Stylized vector brand logo & tagline
        │   │   ├── Loader.jsx   # Branded loading spinner
        │   │   ├── Skeleton.jsx # Course & stat skeleton placeholders
        │   │   └── PageHeader.jsx # Breadcrumbs & gradient header
        │   └── ui/
        │       ├── Button.jsx   # Primary, secondary, outline, ghost, accent
        │       ├── Input.jsx    # Accessible form input with icons & validation
        │       ├── PasswordInput.jsx # Show/hide toggle & strength meter
        │       ├── Card.jsx     # Elevated cards with subtle shadows
        │       ├── Badge.jsx    # Status badges
        │       └── Modal.jsx    # Accessible dialog modal
        ├── features/
        │   ├── auth/
        │   │   ├── Login.jsx    # Login interface
        │   │   ├── Register.jsx # Registration form
        │   │   └── ForgotPassword.jsx # Password recovery
        │   ├── courses/
        │   │   ├── CourseCard.jsx # Course card with details modal
        │   │   └── CourseList.jsx # Filterable course catalog
        │   └── dashboard/
        │       ├── Dashboard.jsx # Interactive student portal
        │       └── DashboardRedirect.jsx # Smart role-based redirector
        └── pages/
            ├── Home.jsx         # Full conversion-focused homepage
            ├── About.jsx        # About Us page
            ├── Contact.jsx      # Contact & Admissions desk page
            └── CoursesPage.jsx  # All courses catalog page
```

---

## 4. Environment Variables

### Backend (`server/.env`):
```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/Balajicomputer
JWT_SECRET=haikayatadaphaiyekaisisajajo
NODE_ENV=development
```

### Frontend (`client/.env` - optional in dev due to Vite proxy):
```env
VITE_API_URL=/api
```

---

## 5. How to Run the Application

### Option A: Run Both Client & Server from Root
```bash
# Terminal 1: Run Backend Server
npm run dev:server

# Terminal 2: Run Frontend Client
npm run dev:client
```

### Option B: Run Individually

**Backend Server:**
```bash
cd server
npm start
# Server runs at http://localhost:8080
```

**Frontend Client:**
```bash
cd client
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 6. API Endpoints Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server health status check |
| `POST` | `/api/auth/signup` | Public | Register new student (`role: student`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue cookie/token |
| `POST` | `/api/auth/logout` | Public | Revoke session cookie |
| `GET` | `/api/auth/me` | Protected | Get authenticated profile |
| `GET` | `/api/courses` | Public | List courses (supports `?popular=true`, `?category=...`) |
| `GET` | `/api/courses/:id` | Public | Get course by ID or code |
| `POST` | `/api/courses` | Admin | Create a new course |
| `GET` | `/api/stats` | Public | Institute student & course metrics |
| `GET` | `/api/testimonials` | Public | Verified student review cards |
| `GET` | `/api/faculty` | Public | Faculty mentors list |

