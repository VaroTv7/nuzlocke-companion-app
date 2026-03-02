import React, { useState } from 'react';

interface CustomInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    type?: 'text' | 'number' | 'password' | 'email';
    icon?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    id?: string;
    min?: number;
    max?: number;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const CustomInput: React.FC<CustomInputProps> = ({
    value,
    onChange,
    label,
    placeholder = '',
    type = 'text',
    icon,
    className = '',
    disabled = false,
    id,
    min,
    max,
    onKeyDown,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label
                    className={`
            block text-xs font-semibold uppercase tracking-wider mb-1.5 transition-colors duration-200
            ${isFocused ? 'text-cyber-primary' : 'text-gray-400'}
          `}
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-cyber-primary' : 'text-gray-500'}`}>
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    min={min}
                    max={max}
                    className={`
            w-full px-3 py-2.5 rounded-xl bg-black/40 border text-sm text-white
            placeholder-gray-500 transition-all duration-200
            focus:outline-none
            ${icon ? 'pl-10' : ''}
            ${isFocused
                            ? 'border-cyber-primary/60 shadow-[0_0_12px_rgba(0,243,255,0.15)] ring-1 ring-cyber-primary/30'
                            : 'border-white/10 hover:border-white/25'
                        }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                />
                {/* Focus bar animation */}
                <div
                    className={`
            absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-cyber-primary rounded-full
            transition-all duration-300 ease-out
            ${isFocused ? 'w-[calc(100%-1.5rem)] opacity-100' : 'w-0 opacity-0'}
          `}
                />
            </div>
        </div>
    );
};
