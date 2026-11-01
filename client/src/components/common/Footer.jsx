import React from "react";
import { Link } from "react-router-dom";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    ArrowUpRight,
    Heart,
} from "lucide-react";
import Logo from "./Logo";

export const Footer = () => {
    // Configurable contact details
    const contactConfig = {
        address: "Near Main Market, Coaching Center Hub, Main Road",
        phone: "+91 98765 43210 / +91 91234 56789",
        email: "admissions@balajicomputer.edu",
        timings: "Mon - Sat: 8:00 AM - 7:00 PM (Sunday Closed)",
    };

    const popularCourses = [
        { name: "ADCA (Advanced Diploma)", to: "/courses?code=ADCA" },
        { name: "DCA (Diploma in Computer Apps)", to: "/courses?code=DCA" },
        { name: "Tally Prime with GST", to: "/courses?code=TALLY-GST" },
        { name: "Full Stack Web Development", to: "/courses?code=MERN-STACK" },
        { name: "Python Programming", to: "/courses?code=PYTHON-DATA" },
        { name: "Graphic Design & DTP", to: "/courses?code=GRAPHIC-DTP" },
    ];

    const quickLinks = [
        { name: "Home", to: "/" },
        { name: "About Institute", to: "/about" },
        { name: "All Courses", to: "/courses" },
        { name: "Faculty Team", to: "/faculty" },
        { name: "Student Verification", to: "/contact" },
        { name: "Student Registration", to: "/signup" },
        { name: "Student Login", to: "/login" },
    ];

    return (
        <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main 4-column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
                    {/* Col 1: Institute Info */}
                    <div className="lg:col-span-4 space-y-5">
                        <Logo light={true} size="md" showTagline={true} />
                        <p className="text-sm text-slate-400 leading-relaxed pr-4">
                            Balaji Computer is a premier computer coaching and technical skill development institute.
                            We empower students and job seekers with high-quality practical IT, accounting, and software skills
                            for government, corporate, and freelance careers.
                        </p>

                        {/* Social Links with clean SVG icons */}
                        <div className="flex items-center gap-3 pt-2">
                            {/* Facebook */}
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noreferrer"
                                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-blue-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 border border-slate-800"
                                aria-label="Facebook"
                            >
                                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                </svg>
                            </a>
                            {/* Instagram */}
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noreferrer"
                                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-pink-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 border border-slate-800"
                                aria-label="Instagram"
                            >
                                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            {/* YouTube */}
                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noreferrer"
                                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-red-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 border border-slate-800"
                                aria-label="YouTube"
                            >
                                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                            {/* LinkedIn */}
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noreferrer"
                                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-blue-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 border border-slate-800"
                                aria-label="LinkedIn"
                            >
                                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Col 2: Quick Links */}
                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                            Quick Links
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.to}
                                        className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 3: Popular Courses */}
                    <div className="lg:col-span-3 space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                            Popular Courses
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            {popularCourses.map((c) => (
                                <li key={c.name}>
                                    <Link
                                        to={c.to}
                                        className="text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-between group"
                                    >
                                        <span>{c.name}</span>
                                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-400" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 4: Contact Info */}
                    <div className="lg:col-span-3 space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                            Institute Contact
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <span>{contactConfig.address}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <span>{contactConfig.phone}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <span>{contactConfig.email}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <span>{contactConfig.timings}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar: Copyright & Legal */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p className="flex items-center gap-1 text-center md:text-left">
                        © {new Date().getFullYear()} Balaji Computer. All rights reserved. Made for excellence in education.
                    </p>

                    <div className="flex items-center gap-6">
                        <Link to="/about" className="hover:text-slate-400 transition-colors">
                            About Us
                        </Link>
                        <Link to="/contact" className="hover:text-slate-400 transition-colors">
                            Contact
                        </Link>
                        <a
                            href="#privacy"
                            onClick={(e) => {
                                e.preventDefault();
                                alert("Balaji Computer Privacy Policy: We respect student privacy and do not disclose student contact data to unauthorized third parties.");
                            }}
                            className="hover:text-slate-400 transition-colors"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#terms"
                            onClick={(e) => {
                                e.preventDefault();
                                alert("Balaji Computer Terms of Service: Course enrollment requires adherence to institute code of conduct and lab safety rules.");
                            }}
                            className="hover:text-slate-400 transition-colors"
                        >
                            Terms & Conditions
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
