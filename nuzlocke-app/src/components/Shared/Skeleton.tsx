import React from 'react';

interface SkeletonProps {
    variant?: 'card' | 'text' | 'avatar' | 'stat-bar' | 'badge';
    className?: string;
    count?: number;
}

const baseClasses = 'animate-skeleton-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded';

export const Skeleton: React.FC<SkeletonProps> = ({ variant = 'text', className = '', count = 1 }) => {
    const items = Array.from({ length: count });

    const getVariantClasses = () => {
        switch (variant) {
            case 'card':
                return 'h-48 w-full rounded-2xl';
            case 'avatar':
                return 'h-16 w-16 rounded-full';
            case 'stat-bar':
                return 'h-3 rounded-full';
            case 'badge':
                return 'h-8 w-20 rounded-full';
            case 'text':
            default:
                return 'h-4 w-full rounded';
        }
    };

    return (
        <>
            {items.map((_, i) => (
                <div
                    key={i}
                    className={`${baseClasses} ${getVariantClasses()} ${className}`}
                    style={{ animationDelay: `${i * 100}ms` }}
                />
            ))}
        </>
    );
};

/** Full card skeleton for Pokémon cards */
export const PokemonCardSkeleton: React.FC = () => (
    <div className="glass-card rounded-2xl p-4 space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
            <Skeleton variant="avatar" className="h-12 w-12 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="w-2/3" />
                <Skeleton className="w-1/3 h-3" />
            </div>
        </div>
        <div className="flex gap-2">
            <Skeleton variant="badge" />
            <Skeleton variant="badge" />
        </div>
        <div className="space-y-2">
            <Skeleton variant="stat-bar" className="w-full" />
            <Skeleton variant="stat-bar" className="w-4/5" />
            <Skeleton variant="stat-bar" className="w-3/5" />
        </div>
    </div>
);

/** Skeleton for a full page view */
export const PageSkeleton: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <PokemonCardSkeleton key={i} />
            ))}
        </div>
    </div>
);
