import { useUserGuide } from '../contexts/UserGuideContext';

interface HelpTipProps {
  children: React.ReactNode;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string; // For custom positioning overrides
  tooltipClassName?: string; // Allows overriding tooltip width/appearance
}

export const HelpTip = ({
  children,
  text,
  position = 'top',
  className = '',
  tooltipClassName = '',
}: HelpTipProps) => {
  const { isHelpVisible } = useUserGuide();

  if (!isHelpVisible) return <>{children}</>;

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  const arrowClasses: Record<string, string> = {
    top: 'absolute w-2 h-2 bg-ireb-sky rotate-45 left-1/2 -translate-x-1/2 -bottom-1',
    bottom: 'absolute w-2 h-2 bg-ireb-sky rotate-45 left-1/2 -translate-x-1/2 -top-1',
    left: 'absolute w-2 h-2 bg-ireb-sky rotate-45 top-1/2 -translate-y-1/2 -right-1',
    right: 'absolute w-2 h-2 bg-ireb-sky rotate-45 top-1/2 -translate-y-1/2 -left-1',
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* The Highlighted Element */}
      <div className="relative z-20 ring-2 ring-ireb-sky ring-offset-2 rounded-sm">{children}</div>

      {/* The Tooltip */}
      <div
        className={`absolute z-50 ${tooltipClassName || 'w-48'} p-3 text-xs text-white bg-ireb-sky rounded shadow-lg font-mori animate-in fade-in zoom-in duration-300 ${positionClasses[position]}`}
      >
        {text}
        {/* Arrow */}
        <div className={arrowClasses[position]} />
      </div>
    </div>
  );
};
