import React from "react";
import { Loader2 } from "lucide-react";

export const Loader = ({ fullPage = false, text = "Loading Balaji Computer...", size = "md" }) => {
    const sizeMap = {
        sm: "w-5 h-5",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    const content = (
        <div className="flex flex-col items-center justify-center gap-3 text-center p-6">
            <div className="relative">
                <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-blue-600`} />
            </div>
            {text && <p className="text-sm font-medium text-slate-600 animate-pulse">{text}</p>}
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-xs">
                {content}
            </div>
        );
    }

    return content;
};

export default Loader;

