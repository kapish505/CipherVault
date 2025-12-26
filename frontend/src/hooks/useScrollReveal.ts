/**
 * useScrollReveal Hook
 * 
 * Detects when elements enter viewport for scroll-driven animations
 */

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
    const {
        threshold = 0.1,
        rootMargin = '0px',
        triggerOnce = false, // Changed default to false per user request
    } = options;

    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else {
                    // Always reset visibility if not triggerOnce
                    if (!triggerOnce) {
                        setIsVisible(false);
                    }
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isVisible };
}
