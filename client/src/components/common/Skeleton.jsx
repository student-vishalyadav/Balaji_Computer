import React from "react";

export const Skeleton = ({ className = "" }) => {
    return <div className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`} />;
};

export const CourseCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 shadow-xs">
            <Skeleton className="h-44 w-full rounded-xl" />
            <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-12 w-full" />
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
        </div>
    );
};

export const StatCardSkeleton = () => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
    );
};

export default Skeleton;

