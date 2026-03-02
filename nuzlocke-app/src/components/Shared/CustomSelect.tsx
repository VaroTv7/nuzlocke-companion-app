import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    searchable?: boolean;
    className?: string;
    disabled?: boolean;
    id?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    label,
    searchable = false,
    className = '',
    disabled = false,
    id,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(o => o.value === value);

    const filtered = searchable && search
        ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
        : options;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus search when opened
    useEffect(() => {
        if (isOpen && searchable && searchRef.current) {
            searchRef.current.focus();
        }
    }, [isOpen, searchable]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && (
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
            )}
            <button
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
          w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl
          bg-black/40 border transition-all duration-200
          text-sm text-left font-medium
          ${isOpen
                        ? 'border-cyber-primary/60 shadow-[0_0_12px_rgba(0,243,255,0.15)] ring-1 ring-cyber-primary/30'
                        : 'border-white/10 hover:border-white/25'
                    }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
            >
                <span className={`flex items-center gap-2 truncate ${selectedOption ? 'text-white' : 'text-gray-500'}`}>
                    {selectedOption?.icon}
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute z-50 mt-1.5 w-full bg-cyber-panel border border-white/15 rounded-xl shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl"
                    >
                        {searchable && (
                            <div className="p-2 border-b border-white/10">
                                <div className="relative">
                                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Buscar..."
                                        className="w-full pl-8 pr-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-primary/50"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="max-h-52 overflow-y-auto custom-scrollbar">
                            {filtered.length === 0 ? (
                                <div className="px-3 py-4 text-center text-sm text-gray-500">Sin resultados</div>
                            ) : (
                                filtered.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`
                      w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors
                      ${option.value === value
                                                ? 'bg-cyber-primary/15 text-cyber-primary font-semibold'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                            }
                    `}
                                    >
                                        {option.icon}
                                        {option.label}
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
