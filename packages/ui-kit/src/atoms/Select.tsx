import React, { useState, useRef, useEffect, forwardRef, ButtonHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

type SelectVariant = 'default' | 'error' | 'ghost';
type SelectSize = 'sm' | 'default' | 'lg';

export interface SelectProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'size'> {
    variant?: SelectVariant;
    size?: SelectSize;
    fullWidth?: boolean;
    label?: string;
    error?: string;
    helperText?: string;
    value?: string | number;
    onChange?: (e: { target: { value: string } }) => void; // Mimic native event for compatibility
    options?: { value: string | number; label: string }[];
    placeholder?: string;
}

/**
 * Select Atom
 * 
 * Replaces native <select> with a stylable custom dropdown.
 * Uses React Portal to avoid overflow clipping issues in cards/modals.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
    ({
        className = '',
        variant = 'default',
        size = 'default',
        fullWidth = true,
        label,
        error,
        helperText,
        value,
        onChange,
        options = [],
        placeholder = 'Select an option',
        disabled,
        ...props
    }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
        const containerRef = useRef<HTMLDivElement>(null);
        const buttonRef = useRef<HTMLButtonElement | null>(null);

        // Update coordinates for the portal
        const updateCoords = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.bottom + window.scrollY + 8, // 8px gap
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        };

        // Handle scroll/resize to update position or close
        useEffect(() => {
            if (!isOpen) return;

            updateCoords();

            const handleResize = () => setIsOpen(false); // Close on resize for simplicity
            const handleScroll = () => updateCoords(); // Update on scroll (or close if preferred)

            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', handleScroll, true); // Capture phase to catch all scrolls

            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('scroll', handleScroll, true);
            };
        }, [isOpen]);

        // Close on click outside
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                // Check if click is inside the button
                if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
                    return;
                }

                // Note: The portal content click check would be tricky since it's in body, 
                // but we handle "click inside dropdown" via the option onClick.
                // For clicking *outside* completely:

                const portalElement = document.getElementById(`select-portal-${label || 'dropdown'}`);
                if (portalElement && portalElement.contains(event.target as Node)) {
                    return;
                }

                setIsOpen(false);
            };

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside);
            }
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [isOpen, label]);


        const handleSelect = (newValue: string | number) => {
            setIsOpen(false);
            if (onChange) {
                onChange({ target: { value: String(newValue) } });
            }
        };

        const selectedOption = options.find(opt => String(opt.value) === String(value));

        // Styles
        const baseStyles = "relative flex items-center justify-between text-left rounded-xl border bg-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200";

        const variants = {
            default: "border-slate-200 text-slate-700 bg-white hover:border-slate-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all duration-200",
            error: "border-red-300 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10",
            ghost: "border-transparent bg-transparent hover:bg-slate-50 text-slate-600 font-medium",
        };

        const sizes = {
            sm: "h-9 px-3 text-xs rounded-lg",
            default: "h-11 px-4 text-sm rounded-xl",
            lg: "h-14 px-5 text-base rounded-2xl",
        };

        const widthClass = fullWidth ? "w-full" : "w-auto";
        const variantClass = error ? variants.error : variants[variant];
        const sizeClass = sizes[size];

        // Define ref function to handle both forwarded ref and local ref
        const setRefs = (element: HTMLButtonElement) => {
            buttonRef.current = element;
            if (typeof ref === 'function') ref(element);
            else if (ref) ref.current = element;
        };

        return (
            <div className={`relative ${widthClass}`} ref={containerRef}>
                {label && (
                    <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {label}
                    </label>
                )}

                <button
                    type="button"
                    ref={setRefs}
                    onClick={() => {
                        if (!disabled) {
                            updateCoords();
                            setIsOpen(!isOpen);
                        }
                    }}
                    className={`
                        relative flex items-center justify-between text-left border outline-none disabled:cursor-not-allowed disabled:opacity-50 
                        ${variantClass} ${sizeClass} ${widthClass} ${className} 
                        ${isOpen ? 'border-[var(--primary)] ring-4 ring-[var(--primary)]/10' : ''}
                    `}
                    disabled={disabled}
                    {...props}
                >
                    <span className={`block truncate ${!selectedOption ? 'text-slate-400' : ''}`} style={{ fontSize: size === 'sm' ? '12px' : '13px' }}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown className={`ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--primary)]' : ''}`} />
                </button>

                {/* Portal Dropdown Menu */}
                {isOpen && typeof document !== 'undefined' && createPortal(
                    <div
                        id={`select-portal-${label || 'dropdown'}`}
                        className="absolute z-[9999] overflow-auto rounded-xl bg-white p-1 shadow-xl shadow-slate-200/50 border border-slate-100 focus:outline-none animate-in fade-in zoom-in-95 duration-150"
                        style={{
                            top: coords.top,
                            left: coords.left,
                            width: coords.width,
                            maxHeight: '250px' // Limit height
                        }}
                    >
                        {options.length === 0 ? (
                            <div className="relative cursor-default select-none px-3 py-2.5 text-slate-400 italic text-xs text-center">
                                No options available
                            </div>
                        ) : (
                            options.map((option) => {
                                const isSelected = String(option.value) === String(value);
                                return (
                                    <div
                                        key={option.value}
                                        className={`
                                            relative cursor-pointer select-none py-2 pl-3 pr-8 rounded-lg transition-all duration-150
                                            ${isSelected ? 'bg-[var(--primary)]/5 text-[var(--primary)] font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                        `}
                                        onClick={() => handleSelect(option.value)}
                                        role="option"
                                        aria-selected={isSelected}
                                    >
                                        <span className="block truncate" style={{ fontSize: size === 'sm' ? '12px' : '13px' }}>
                                            {option.label}
                                        </span>
                                        {isSelected && (
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-[var(--primary)]">
                                                <Check className="h-3.5 w-3.5" />
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>,
                    document.body
                )}

                {error && (
                    <p className="mt-1 text-xs text-red-500 animate-in slide-in-from-top-1">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-xs text-slate-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";
