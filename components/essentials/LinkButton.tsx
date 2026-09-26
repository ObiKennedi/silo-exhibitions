"use client"

export const RedirectButton = (
    { children, href, className, onClick }: { children: React.ReactNode, href: string, className?: string, onClick?: () => void }
) => {
    return (
        <button
            className={className}
            onClick={() => {
                if (onClick) onClick();
                window.location.href = href;
            }}
        >
            {children}
        </button>
    )
}