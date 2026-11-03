import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";

// Public Pages
import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import CoursesPage from "../pages/CoursesPage";
import FacultyList from "../features/faculty/FacultyList";

// Auth Pages
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ForgotPassword from "../features/auth/ForgotPassword";
import ResetPassword from "../features/auth/ResetPassword";

// Protected & Dashboard
import ProtectedRoute from "./ProtectedRoute";
import DashboardRedirect from "../features/dashboard/DashboardRedirect";
import Dashboard from "../features/dashboard/Dashboard";

// Lazy-Loaded Admin Modules (Code-Splitting for Production Performance)
const AdminDashboard = lazy(() => import("../features/admin/dashboard/AdminDashboard"));
const StudentList = lazy(() => import("../features/students/StudentList"));
const AddStudent = lazy(() => import("../features/students/AddStudent"));
const StudentDetails = lazy(() => import("../features/students/StudentDetails"));
const CourseManagement = lazy(() => import("../features/admin/courses/CourseManagement"));
const BatchList = lazy(() => import("../features/batches/BatchList"));
const Attendance = lazy(() => import("../features/attendance/Attendance"));
const FeeManagement = lazy(() => import("../features/fees/FeeManagement"));
const ExamList = lazy(() => import("../features/examinations/ExamList"));
const StudyMaterials = lazy(() => import("../features/study-materials/StudyMaterials"));
const NoticeList = lazy(() => import("../features/notices/NoticeList"));
const Reports = lazy(() => import("../features/admin/reports/Reports"));
const InstituteSettings = lazy(() => import("../features/admin/settings/InstituteSettings"));

// Loading & UI Fallbacks
import Loader from "../components/common/Loader";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

const SuspenseWrapper = ({ children }) => (
    <Suspense fallback={<Loader fullPage={false} text="Loading module..." />}>
        {children}
    </Suspense>
);

const NotFound = () => (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md w-full space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900">404 - Page Not Found</h1>
            <p className="text-sm text-slate-500">
                The page you are looking for does not exist or has been moved.
            </p>
            <div>
                <Link to="/">
                    <Button variant="primary" size="md">
                        Back to Homepage
                    </Button>
                </Link>
            </div>
        </div>
    </div>
);

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Layout Routes with Sticky Navbar and Footer */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/faculty" element={<FacultyList />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
            </Route>

            {/* Standalone Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Unified Dashboard Smart Redirect */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardRedirect />
                    </ProtectedRoute>
                }
            />

            {/* Protected Student Portal */}
            <Route
                path="/student"
                element={
                    <ProtectedRoute allowedRoles={["student", "admin"]}>
                        <StudentLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
            </Route>

            {/* Protected Faculty Portal */}
            <Route
                path="/faculty/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["faculty", "admin"]}>
                        <StudentLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
            </Route>

            {/* Complete Production-Ready Admin Portal (Phases 1 - 12) */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
                <Route path="students" element={<SuspenseWrapper><StudentList /></SuspenseWrapper>} />
                <Route path="students/new" element={<SuspenseWrapper><AddStudent /></SuspenseWrapper>} />
                <Route path="students/:id" element={<SuspenseWrapper><StudentDetails /></SuspenseWrapper>} />
                <Route path="faculty" element={<FacultyList />} />
                <Route path="courses" element={<SuspenseWrapper><CourseManagement /></SuspenseWrapper>} />
                <Route path="batches" element={<SuspenseWrapper><BatchList /></SuspenseWrapper>} />
                <Route path="attendance" element={<SuspenseWrapper><Attendance /></SuspenseWrapper>} />
                <Route path="fees" element={<SuspenseWrapper><FeeManagement /></SuspenseWrapper>} />
                <Route path="examinations" element={<SuspenseWrapper><ExamList /></SuspenseWrapper>} />
                <Route path="materials" element={<SuspenseWrapper><StudyMaterials /></SuspenseWrapper>} />
                <Route path="notices" element={<SuspenseWrapper><NoticeList /></SuspenseWrapper>} />
                <Route path="reports" element={<SuspenseWrapper><Reports /></SuspenseWrapper>} />
                <Route path="settings" element={<SuspenseWrapper><InstituteSettings /></SuspenseWrapper>} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
