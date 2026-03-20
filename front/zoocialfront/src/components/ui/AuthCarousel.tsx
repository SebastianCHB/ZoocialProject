import { useEffect, useState } from 'react';

const images = [
  '/perrowbp.webp',
  '/gatowbp.webp',
  '/hamsterwbp.webp'
];

export const AuthCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="auth-carousel-container">
            {/* Overlay to blend with primary color slightly */}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--color-primary)', mixBlendMode: 'multiply', opacity: 0.3, zIndex: 1 }}></div>
            
            {images.map((src, idx) => (
                <img 
                    key={src}
                    src={src}
                    alt="Pet adoption background"
                    className={`auth-carousel-img ${idx === currentIndex ? 'active' : ''}`}
                />
            ))}
        </div>
    );
};
