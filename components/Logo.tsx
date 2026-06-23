import React from 'react';
import whitelogo from './imgg/whitelogo.png';

interface LogoProps {
  className?: string;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", alt = "JobCrafting Logo" }) => {
  return (
    <img
      className={className}
      src={whitelogo}
      alt={alt}
    />
  );
};

export default Logo;
