import React, { useState, useEffect } from "react";
import { Search, Filter, RefreshCw, AlertCircle, BookOpen } from "lucide-react";
import { courseAPI } from "../../services/api";
import CourseCard from "./CourseCard";
import { CourseCardSkeleton } from "../../components/common/Skeleton";
import Button from "../../components/ui/Button";

export const CourseList = ({ limit, showSearch = true, popularOnly = false }) => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedLevel, setSelectedLevel] = useState("all");

    const fetchCourses = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {};
            if (popularOnly) params.popular = "true";
            const response = await courseAPI.getAll(params);
            if (response?.success && response.courses) {
                setCourses(response.courses);
            } else {
                setCourses([]);
            }
        } catch (err) {
            setError(err.message || "Failed to load courses. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [popularOnly]);

    // Categories available
    const categories = ["all", "Diploma Courses", "Accounting", "Programming", "Design", "Certification"];

    // Filter courses
    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            selectedCategory === "all" ||
            course.category?.toLowerCase() === selectedCategory.toLowerCase();

        const matchesLevel =
            selectedLevel === "all" ||
            course.level?.toLowerCase() === selectedLevel.toLowerCase();

        return matchesSearch && matchesCategory && matchesLevel;
    });

    const displayCourses = limit ? filteredCourses.slice(0, limit) : filteredCourses;

    return (
        <div className="space-y-8">
            {/* Search and Filters Bar (when showSearch is true) */}
            {showSearch && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-6 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search courses by name or code (e.g. ADCA, Tally, Python)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Level Filter */}
                        <div className="md:col-span-3">
                            <select
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
                            >
                                <option value="all">All Difficulty Levels</option>
                                <option value="beginner">Beginner Level</option>
                                <option value="intermediate">Intermediate Level</option>
                                <option value="advanced">Advanced Level</option>
                            </select>
                        </div>

                        {/* Reset Filter Button */}
                        <div className="md:col-span-3 flex items-center justify-end">
                            {(searchTerm || selectedCategory !== "all" || selectedLevel !== "all") && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedCategory("all");
                                        setSelectedLevel("all");
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
                        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5" /> Filter:
                        </span>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
                                    selectedCategory === cat
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {cat === "all" ? "All Categories" : cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                    <p className="text-sm font-semibold text-red-800">{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchCourses} icon={RefreshCw}>
                        Retry Loading Courses
                    </Button>
                </div>
            )}

            {/* Loading Skeletons */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                        <CourseCardSkeleton key={idx} />
                    ))}
                </div>
            )}

            {/* Course Grid */}
            {!isLoading && !error && displayCourses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {displayCourses.map((course) => (
                        <CourseCard key={course._id || course.code} course={course} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && displayCourses.length === 0 && (
                <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No courses match your criteria</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Try adjusting your search terms or clearing filters to see all available programs at Balaji Computer.
                    </p>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("all");
                            setSelectedLevel("all");
                        }}
                    >
                        Show All Courses
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CourseList;

