import React, { useEffect, useRef } from 'react'

interface IProps {
    onIntercept: () => void,
}

export default function Observer({ onIntercept }: IProps) {
    const intersectRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    onIntercept();
                }
            })
        }, { threshold: 0, rootMargin: '500px' })

        if (intersectRef.current) {
            observer.observe(intersectRef.current);
        }

        return () => {
            if (intersectRef.current) {
                observer.unobserve(intersectRef.current);
            }
        }


    }, [onIntercept]);

    return (
        <div ref={intersectRef} />
    )
}
