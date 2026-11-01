import React from "react";
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

// Auth Pages
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ForgotPassword from "../features/auth/ForgotPassword";

// Protected & Dashboard
import ProtectedRoute from "./ProtectedRoute";
import DashboardRedirect from "../features/dashboard/DashboardRedirect";
import Dashboard from "../features/dashboard/Dashboard";

// Admin Management Modules (Phases 1-12)
import AdminDashboard from "../features/admin/dashboard/AdminDashboard";
import StudentList from "../features/students/StudentList";
import AddStudent from "../features/students/AddStudent";
import StudentDetails from "../features/students/StudentDetails";
import FacultyList from "../features/faculty/FacultyList";
import CourseManagement from "../features/admin/courses/CourseManagement";
import BatchList from "../features/batches/BatchList";
import Attendance from "../features/attendance/Attendance";
import FeeManagement from "../features/fees/FeeManagement";
import ExamList from "../features/examinations/ExamList";
import StudyMaterials from "../features/study-materials/StudyMaterials";
import NoticeList from "../features/notices/NoticeList";
import Reports from "../features/admin/reports/Reports";
import InstituteSettings from "../features/admin/settings/InstituteSettings";

// 404 Page
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

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
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<StudentList />} />
                <Route path="students/new" element={<AddStudent />} />
                <Route path="students/:id" element={<StudentDetails />} />
                <Route path="faculty" element={<FacultyList />} />
                <Route path="courses" element={<CourseManagement />} />
                <Route path="batches" element={<BatchList />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="fees" element={<FeeManagement />} />
                <Route path="examinations" element={<ExamList />} />
                <Route path="materials" element={<StudyMaterials />} />
                <Route path="notices" element={<NoticeList />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<InstituteSettings />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
