import React from "react";
import Link from "next/link";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">ByteCrew</span>
        </Link>
      </div>
    );
  }
);

Logo.displayName = "Logo";
