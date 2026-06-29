import React from 'react';

interface HMLogoProps {
  className?: string;
  size?: number;
  textColor?: string;
  showText?: boolean;
}

export const HMLogo: React.FC<HMLogoProps> = ({
  className = '',
  size = 48,
  textColor = 'text-white',
  showText = false,
}) => {
  // Exact high-contrast corporate colors from the attachment
  const goldColor = '#B58A00'; // Rich polished gold
  const grayColor = '#8E9294'; // Metallic gray

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 1000 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* UPPER ORBIT ARCS */}
        {/* Top-Right Golden Sweep */}
        <path
          d="M 320 80 C 470 -10, 710 40, 770 250 L 666 250 C 610 110, 450 80, 320 80 Z"
          fill={goldColor}
        />
        {/* Top-Left Inner Gray Sweep */}
        <path
          d="M 130 250 C 180 110, 420 50, 640 180 L 610 210 C 430 110, 240 150, 130 250 Z"
          fill={grayColor}
        />

        {/* LOWER ORBIT ARCS */}
        {/* Bottom-Right Golden Sweep */}
        <path
          d="M 680 550 C 600 690, 410 750, 100 640 L 125 610 C 400 710, 560 650, 680 550 Z"
          fill={goldColor}
        />
        {/* Bottom-Left Inner Gray Sweep */}
        <path
          d="M 76 550 C 110 670, 310 710, 500 710 L 500 680 C 310 680, 150 640, 76 550 Z"
          fill={grayColor}
        />
        {/* Extra Bottom Thin Golden Sweep */}
        <path
          d="M 90 640 C 140 730, 260 785, 390 785 C 260 760, 150 690, 90 640 Z"
          fill={goldColor}
        />

        {/* LETTER 'H' (Gold) */}
        {/* Left vertical post, wavy crossbar, right vertical post in a single continuous path */}
        <path
          d="M 20 270 
             L 108 270 
             L 108 365 
             C 170 365, 200 425, 262 425 
             L 262 270 
             L 350 270 
             L 350 530 
             L 262 530 
             L 262 495 
             C 200 495, 170 435, 108 435 
             L 108 530 
             L 20 530 
             Z"
          fill={goldColor}
        />

        {/* LETTER 'M' (Metallic Gray) */}
        {/* Rounded arches, rounded valley, and long horizontal footer line with slanted edge */}
        <path
          d="M 368 530 
             L 412 530 
             L 468 375 
             C 485 325, 515 325, 532 375 
             L 568 480 
             C 585 530, 615 530, 632 480 
             L 668 375 
             C 685 325, 715 325, 732 375 
             L 795 530 
             L 990 530 
             L 970 450 
             L 820 450 
             L 755 290 
             C 720 200, 660 200, 625 290 
             L 590 395 
             C 575 440, 545 440, 530 395 
             L 495 290 
             C 460 200, 400 200, 365 290 
             Z"
          fill={grayColor}
        />
      </svg>
      {showText && (
        <div className="flex flex-col text-left">
          <span className={`text-sm font-extrabold tracking-tight ${textColor}`}>HMGeomatics</span>
          <span className="text-[8px] text-[#F2EFEB]/50 font-mono uppercase tracking-widest leading-none">Negeri Sembilan Portal</span>
        </div>
      )}
    </div>
  );
};
