import React from "react";

export const Card = ({
    children,
    className = "",
    hoverable = false,
    padding = "p-6",
    bordered = true,
    shadow = "shadow-sm",
    ...props
}) => {
    return (
        <div
            className={`bg-white rounded-2xl transition-all duration-300 ${
                bordered ? "border border-slate-200/80" : ""
            } ${shadow} ${
                hoverable
                    ? "hover:shadow-xl hover:-translate-y-1 hover:border-blue-200/80 transition-transform"
                    : ""
            } ${padding} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;

