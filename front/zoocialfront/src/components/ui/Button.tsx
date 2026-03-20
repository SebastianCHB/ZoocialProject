import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent';
    fullWidth?: boolean;
}

export const Button = ({ 
    children, 
    variant = 'primary', 
    fullWidth = false, 
    className = '',
    ...props 
}: ButtonProps) => {
    
    let variantClass = 'btn-primary';
    if (variant === 'secondary') variantClass = 'btn-secondary';
    if (variant === 'accent') variantClass = 'btn-accent';

    const classes = `btn ${variantClass} ${fullWidth ? 'btn-full' : ''} ${className}`;

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};
