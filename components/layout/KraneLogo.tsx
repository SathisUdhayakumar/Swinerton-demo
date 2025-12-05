import Link from 'next/link';

interface KraneLogoProps {
  href?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function KraneLogo({ href = '/projects', showText = true, size = 'md' }: KraneLogoProps) {
  const sizeClasses = {
    sm: { container: 'w-6 h-6', icon: 'w-4 h-4', text: 'text-base' },
    md: { container: 'w-8 h-8', icon: 'w-6 h-6', text: 'text-xl' },
    lg: { container: 'w-10 h-10', icon: 'w-8 h-8', text: 'text-2xl' },
  };

  const classes = sizeClasses[size];

  const logoContent = (
    <>
      <div className={`${classes.container} bg-white rounded-lg flex items-center justify-center shadow-sm`}>
        {/* 3D Pyramid Icon with orange/yellow shading */}
        <svg className={classes.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left face (darker orange) */}
          <path d="M12 5L7 19L12 17L12 5Z" fill="#f59e0b"/>
          {/* Right face (brighter yellow) */}
          <path d="M12 5L17 19L12 17L12 5Z" fill="#fbbf24"/>
          {/* Base edge */}
          <path d="M7 19L17 19L12 17L7 19Z" fill="#fbbf24" opacity="0.6"/>
        </svg>
      </div>
      {showText && (
        <span className={`text-white font-bold tracking-tight ${classes.text}`}>KRANE</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2">
        {logoContent}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {logoContent}
    </div>
  );
}

