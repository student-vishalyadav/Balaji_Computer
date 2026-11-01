const mongoose = require("mongoose");
const courseModel = require("../models/courseModel");

// Default initial courses for Balaji Computer
const DEFAULT_COURSES = [
    {
        title: "Advanced Diploma in Computer Applications (ADCA)",
        code: "ADCA",
        shortDescription: "Complete 1-year professional IT diploma covering MS Office, Tally Prime + GST, DTP & Web Basics.",
        description: "The Advanced Diploma in Computer Applications (ADCA) is a comprehensive one-year course designed for students seeking career-ready IT, accounting, and computer application skills. Covers Computer Fundamentals, Windows, MS Office Suite (Word, Excel, PowerPoint, Access), Tally Prime with complete GST filing, Desktop Publishing (Photoshop, PageMaker, CorelDRAW), and internet technologies.",
        duration: "12 Months",
        fee: 12000,
        discountFee: 9999,
        level: "All Levels",
        category: "Diploma Courses",
        badge: "Most Popular",
        syllabus: [
            "Module 1: Computer Fundamentals & Operating Systems",
            "Module 2: Complete MS Office Suite with Advanced Excel",
            "Module 3: Computerized Accounting with Tally Prime & GST",
            "Module 4: Desktop Publishing (Photoshop & CorelDRAW)",
            "Module 5: Web Concepts, HTML & Cyber Safety",
            "Module 6: Live Project Work & Typing Practice"
        ],
        features: [
            "Government Recognized Certification",
            "100% Practical Computer Lab Sessions",
            "Free Hindi & English Typing Training",
            "Job Placement Assistance"
        ],
        isPopular: true,
        isActive: true,
        rating: 4.9,
        enrolledCount: 420
    },
    {
        title: "Diploma in Computer Applications (DCA)",
        code: "DCA",
        shortDescription: "6-month foundational computer course covering basic computing, office automation & typing.",
        description: "Diploma in Computer Applications (DCA) is a 6-month foundational program providing essential digital literacy and office automation skills. Ideal for job aspirants preparing for government exams, office administration, and clerical positions.",
        duration: "6 Months",
        fee: 6500,
        discountFee: 5499,
        level: "Beginner",
        category: "Diploma Courses",
        badge: "Job Oriented",
        syllabus: [
            "Module 1: Computer Hardware & Software Fundamentals",
            "Module 2: Windows Operating System & Utilities",
            "Module 3: MS Word, MS Excel & MS PowerPoint",
            "Module 4: Internet, Email, Cyber Security & Government Portals",
            "Module 5: Hindi & English Typing Proficiency"
        ],
        features: [
            "Comprehensive Study Material Included",
            "Daily 1-hour Lab Practice",
            "Preparation for Competitive Exam Typing"
        ],
        isPopular: true,
        isActive: true,
        rating: 4.8,
        enrolledCount: 380
    },
    {
        title: "Tally Prime with GST & Financial Accounting",
        code: "TALLY-GST",
        shortDescription: "Master computerized accounting, inventory management, e-Way bills & GST return filing.",
        description: "A specialized 3-month course for commerce and non-commerce students aiming to build a career in accounting and taxation. Learn double-entry bookkeeping, voucher entries, GST billing, inventory, payroll, TDS, and balance sheet preparation.",
        duration: "3 Months",
        fee: 5000,
        discountFee: 3999,
        level: "Intermediate",
        category: "Accounting",
        badge: "High Demand",
        syllabus: [
            "Module 1: Accounting Principles & Rules of Journalizing",
            "Module 2: Company Creation & Master Ledger Setup in Tally Prime",
            "Module 3: Inventory Management & Stock Groups",
            "Module 4: GST Configuration (CGST, SGST, IGST), e-Way Bill & Invoicing",
            "Module 5: Payroll, TDS & Financial Statements (P&L, Balance Sheet)"
        ],
        features: [
            "Real Industry Invoice Practice",
            "GST Return Filing Simulation",
            "Accounting Voucher Training"
        ],
        isPopular: true,
        isActive: true,
        rating: 4.9,
        enrolledCount: 310
    },
    {
        title: "Full Stack Web Development (MERN)",
        code: "MERN-STACK",
        shortDescription: "Build modern, responsive full-stack web applications with React, Node.js, Express & MongoDB.",
        description: "Step into modern software development with hands-on training in full stack web development. Learn frontend architecture with React.js, Tailwind CSS, backend REST APIs with Node.js & Express, and database modeling with MongoDB.",
        duration: "6 Months",
        fee: 16000,
        discountFee: 12999,
        level: "Intermediate",
        category: "Programming",
        badge: "Career Booster",
        syllabus: [
            "Module 1: HTML5, Modern CSS3, Flexbox & Tailwind CSS",
            "Module 2: JavaScript ES6+ & DOM Manipulation",
            "Module 3: React.js Component Architecture, Hooks & Routing",
            "Module 4: Backend RESTful APIs with Node.js & Express",
            "Module 5: MongoDB, Mongoose, JWT Authentication",
            "Module 6: Cloud Deployment & Portfolio Projects"
        ],
        features: [
            "3 Real-World Portfolio Projects",
            "Git & GitHub Version Control",
            "Interview & Resume Preparation"
        ],
        isPopular: true,
        isActive: true,
        rating: 4.95,
        enrolledCount: 195
    },
    {
        title: "Python Programming & Data Analytics",
        code: "PYTHON-DATA",
        shortDescription: "Learn core Python programming, data structures, automation, and analytics with Pandas.",
        description: "Master one of the world's most versatile programming languages. From basic syntax and OOP principles to working with libraries like NumPy, Pandas, and Matplotlib for data processing and analysis.",
        duration: "4 Months",
        fee: 8500,
        discountFee: 6999,
        level: "Beginner",
        category: "Programming",
        badge: "Trending",
        syllabus: [
            "Module 1: Python Fundamentals, Data Types & Flow Control",
            "Module 2: Functions, Modules & File Handling",
            "Module 3: Object-Oriented Programming (OOP)",
            "Module 4: Data Analysis with NumPy & Pandas",
            "Module 5: Data Visualization with Matplotlib & Seaborn"
        ],
        features: [
            "Code Quizzes & Coding Assignments",
            "Capstone Data Analytics Project",
            "Certificate of Completion"
        ],
        isPopular: false,
        isActive: true,
        rating: 4.75,
        enrolledCount: 160
    },
    {
        title: "Graphic Design & Desktop Publishing (DTP)",
        code: "GRAPHIC-DTP",
        shortDescription: "Create stunning banners, logos, social media graphics with Photoshop & CorelDRAW.",
        description: "Unleash your creativity with professional design tools. Learn photo editing, social media graphic creation, vector illustration, brochure layouts, and print-ready publishing.",
        duration: "3 Months",
        fee: 6000,
        discountFee: 4999,
        level: "Beginner",
        category: "Design",
        badge: "Creative",
        syllabus: [
            "Module 1: Design Fundamentals, Color Theory & Typography",
            "Module 2: Adobe Photoshop for Image Retouching & Compositing",
            "Module 3: CorelDRAW for Vector Logos, Flyers & Banners",
            "Module 4: Print Media Standards & Digital Export Formats"
        ],
        features: [
            "Design Portfolio Building",
            "Practical Printing Lab Exposure",
            "Freelancing Guidance"
        ],
        isPopular: false,
        isActive: true,
        rating: 4.8,
        enrolledCount: 210
    },
    {
        title: "CCC & Basic Computer Course (BCC)",
        code: "CCC-BCC",
        shortDescription: "Government recognized course for computer literacy, typing skills, and digital empowerment.",
        description: "Official NIELIT pattern curriculum covering computer fundamentals, LibreOffice/MS Office, internet tools, digital financial services, and cyber ethics for competitive government exams.",
        duration: "3 Months",
        fee: 3000,
        discountFee: 2499,
        level: "Beginner",
        category: "Certification",
        badge: "Govt Certified",
        syllabus: [
            "Module 1: Introduction to Computer & Operating System",
            "Module 2: Word Processing & Spreadsheet Calculation",
            "Module 3: Presentation Creation",
            "Module 4: Internet, WWW & Web Browsers",
            "Module 5: Digital Financial Services & Cyber Security"
        ],
        features: [
            "Online Mock Test Series",
            "Previous Year Question Solving",
            "Typing Test Practice"
        ],
        isPopular: false,
        isActive: true,
        rating: 4.85,
        enrolledCount: 520
    },
    {
        title: "C & C++ Programming Fundamentals",
        code: "CPP-LANG",
        shortDescription: "Build a rock-solid programming foundation, algorithms, and logic building for BCA/B.Tech.",
        description: "Ideal for college students in BCA, B.Sc. IT, and B.Tech. Master procedural and object-oriented programming concepts, pointers, memory management, and data structures.",
        duration: "3 Months",
        fee: 5000,
        discountFee: 3999,
        level: "Beginner",
        category: "Programming",
        badge: "Foundational",
        syllabus: [
            "Module 1: C Syntax, Data Types & Control Structures",
            "Module 2: Arrays, Strings, Functions & Pointers in C",
            "Module 3: File Handling & Dynamic Memory Allocation",
            "Module 4: C++ OOP: Classes, Objects, Inheritance & Polymorphism"
        ],
        features: [
            "Extensive Lab Coding Sessions",
            "College Syllabus Aligned",
            "Problem Solving Exercises"
        ],
        isPopular: false,
        isActive: true,
        rating: 4.7,
        enrolledCount: 140
    }
];

// Seed courses if collection is empty
const seedCoursesIfEmpty = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            const count = await courseModel.countDocuments();
            if (count === 0) {
                await courseModel.insertMany(DEFAULT_COURSES);
                console.log("Seeded default courses for Balaji Computer.");
            }
        }
    } catch (err) {
        // Safe fail-safe
    }
};

// Seed on startup when DB opens
mongoose.connection.on("connected", () => {
    seedCoursesIfEmpty();
});

// GET all courses
const getAllCourses = async (req, res) => {
    try {
        const { popular, category, level } = req.query;
        let query = { isActive: true };

        if (popular === "true") {
            query.isPopular = true;
        }
        if (category) {
            query.category = category;
        }
        if (level) {
            query.level = level;
        }

        let courses = null;
        if (mongoose.connection.readyState === 1) {
            try {
                courses = await courseModel.find(query).sort({ isPopular: -1, createdAt: -1 });
            } catch (err) {
                // fall through
            }
        }

        // Fallback to default courses if DB is empty, loading, or offline
        if (!courses || courses.length === 0) {
            courses = DEFAULT_COURSES.filter((c) => {
                if (popular === "true" && !c.isPopular) return false;
                if (category && c.category !== category) return false;
                if (level && c.level !== level) return false;
                return true;
            });
        }

        return res.status(200).json({
            success: true,
            count: courses.length,
            courses,
        });
    } catch (error) {
        console.error("Error fetching courses:", error.message);
        return res.status(200).json({
            success: true,
            count: DEFAULT_COURSES.length,
            courses: DEFAULT_COURSES,
        });
    }
};

// GET course by ID or code
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        let course = null;

        if (mongoose.connection.readyState === 1) {
            try {
                if (id.match(/^[0-9a-fA-F]{24}$/)) {
                    course = await courseModel.findById(id);
                } else {
                    course = await courseModel.findOne({ code: id.toUpperCase() });
                }
            } catch (err) {
                // fall through
            }
        }

        if (!course) {
            course = DEFAULT_COURSES.find(
                (c) => c.code.toLowerCase() === id.toLowerCase() || c.title.toLowerCase().includes(id.toLowerCase())
            );
        }

        if (!course) {
            return res.status(404).json({ success: false, msg: "Course not found" });
        }

        return res.status(200).json({
            success: true,
            course,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Error fetching course details" });
    }
};

// Admin: Create course
const createCourse = async (req, res) => {
    try {
        const newCourse = await courseModel.create(req.body);
        return res.status(201).json({
            success: true,
            msg: "Course created successfully",
            course: newCourse,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message || "Failed to create course",
        });
    }
};

// Admin: Update course
const updateCourse = async (req, res) => {
    try {
        const updated = await courseModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) {
            return res.status(404).json({ success: false, msg: "Course not found" });
        }
        return res.status(200).json({
            success: true,
            msg: "Course updated successfully",
            course: updated,
        });
    } catch (error) {
        return res.status(400).json({ success: false, msg: error.message || "Failed to update course" });
    }
};

// Admin: Delete course
const deleteCourse = async (req, res) => {
    try {
        const deleted = await courseModel.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, msg: "Course not found" });
        }
        return res.status(200).json({
            success: true,
            msg: "Course deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to delete course" });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    DEFAULT_COURSES,
};
