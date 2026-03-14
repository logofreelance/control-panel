import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height, variant = 'rect' }) => {
    const baseClass = "bg-slate-100 animate-pulse";
    const variantClasses = {
        text: "rounded h-4 w-full",
        rect: "rounded-2xl",
        circle: "rounded-full"
    };

    const style: React.CSSProperties = {
        width: width,
        height: height
    };

    return (
        <div
            className={`${baseClass} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
};
