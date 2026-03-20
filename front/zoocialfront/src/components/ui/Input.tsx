import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="input-group">
                {label && <label className="input-label">{label}</label>}
                <input 
                    ref={ref}
                    className={`input-field ${className}`} 
                    {...props} 
                />
                {error && <span className="text-error">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
