import React, { useState, useEffect, useRef } from 'react';

interface Props {
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
    onSelect?: (val: string) => void;
}

export const AutocompleteInput: React.FC<Props> = ({ value, onChange, options, placeholder, className, onSelect }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const userInput = e.target.value;
        onChange(userInput);

        if (userInput.length > 1) {
            const filtered = options.filter(
                (option) => option.toLowerCase().includes(userInput.toLowerCase())
            ).slice(0, 10); // Limit to 10 suggestions
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        onChange(suggestion);
        setSuggestions([]);
        setShowSuggestions(false);
        if (onSelect) onSelect(suggestion);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setShowSuggestions(false);
            if (onSelect) onSelect(value);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                type="text"
                className={className}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                value={value}
                placeholder={placeholder}
            />
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-black/90 border border-cyber-primary/30 rounded-b-lg mt-1 max-h-60 overflow-y-auto shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-4 py-2 hover:bg-cyber-primary/20 cursor-pointer text-gray-300 hover:text-white border-b border-white/5 last:border-0 capitalize"
                        >
                            {suggestion.replace(/-/g, ' ')}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
