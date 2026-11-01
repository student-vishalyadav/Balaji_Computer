import React from "react";
import PageHeader from "../components/common/PageHeader";
import CourseList from "../features/courses/CourseList";

export const CoursesPage = () => {
    return (
        <div className="space-y-12 pb-20">
            <PageHeader
                title="Explore Professional Computer Courses"
                subtitle="From beginner computing and office automation to computerized accounting and software engineering."
                badge="All Available Programs"
                breadcrumbs={[{ label: "Courses" }]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <CourseList showSearch={true} popularOnly={false} />
            </div>
        </div>
    );
};

export default CoursesPage;

