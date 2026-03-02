import React from 'react';

interface CustomToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    size?: 'sm' | 'md';
    className?: string;
    disabled?: boolean;
    id?: string;
}

export const CustomToggle: React.FC<CustomToggleProps> = ({
    checked,
    onChange,
    label,
    size = 'md',
    className = '',
    disabled = false,
    id,
}) => {
    const sizes = {
        sm: { track: 'w-9 h-5', knob: 'w-3.5 h-3.5', translate: 'translate-x-4' },
        md: { track: 'w-11 h-6', knob: 'w-4.5 h-4.5', translate: 'translate-x-5' },
    };

    const s = sizes[size];

    return (
        <label
            className={`inline-flex items-center gap-2.5 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        >
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`
          relative ${s.track} rounded-full transition-all duration-300 ease-out
          ${checked
                        ? 'bg-cyber-primary/30 border-cyber-primary/60 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                        : 'bg-white/5 border-white/15'
                    }
          border focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-primary/50
        `}
            >
                <span
                    className={`
            absolute top-1/2 -translate-y-1/2 left-0.5
            ${s.knob} rounded-full transition-all duration-300 ease-out
            ${checked
                            ? `${s.translate} bg-cyber-primary shadow-[0_0_6px_rgba(0,243,255,0.4)]`
                            : 'translate-x-0 bg-gray-400'
                        }
          `}
                />
            </button>
            {label && (
                <span className="text-sm text-gray-300 font-medium">{label}</span>
            )}
        </label>
    );
};
