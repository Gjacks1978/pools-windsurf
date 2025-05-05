import React, { useState, ReactNode } from 'react';

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string;
  delay?: number;
};

export function Tooltip({ 
  content, 
  children, 
  position = 'top', 
  width = 'max-w-xs', 
  delay = 300 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-1',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-1',
    left: 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-1',
    right: 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-1',
  };

  const arrowClasses = {
    top: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-[#2a003f] border-x-transparent border-b-transparent',
    bottom: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-[#2a003f] border-x-transparent border-t-transparent',
    left: 'right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-l-[#2a003f] border-y-transparent border-r-transparent',
    right: 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-r-[#2a003f] border-y-transparent border-l-transparent',
  };

  return (
    <div className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip}>
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} ${width}`}>
          <div className="bg-white dark:bg-[#2a003f] text-black dark:text-white rounded-lg shadow-lg px-3 py-2 text-sm border border-gray-300 dark:border-[#4b206e]">
            {content}
            <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}></div>
          </div>
        </div>
      )}
    </div>
  );
}
