import { useRef, useEffect } from 'react';

export default function AutoCarousel({ children, speed = 0.5, className = '' }) {
  const scrollRef = useRef(null);
  const animationRef = useRef(null);
  const isPaused = useRef(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Duplicar conteúdo para loop infinito
    const scrollContent = container.querySelector('[data-carousel-content]');
    if (!scrollContent) return;
    
    // Clona os filhos para criar efeito infinito
    const clone = scrollContent.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    container.appendChild(clone);

    let scrollPos = 0;
    const contentWidth = scrollContent.offsetWidth;

    const animate = () => {
      if (!isPaused.current) {
        scrollPos += speed;
        if (scrollPos >= contentWidth) {
          scrollPos = 0;
        }
        container.scrollLeft = scrollPos;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleEnter = () => { isPaused.current = true; };
    const handleLeave = () => { isPaused.current = false; };

    container.addEventListener('mouseenter', handleEnter);
    container.addEventListener('mouseleave', handleLeave);
    container.addEventListener('touchstart', handleEnter, { passive: true });
    container.addEventListener('touchend', handleLeave);

    return () => {
      cancelAnimationFrame(animationRef.current);
      container.removeEventListener('mouseenter', handleEnter);
      container.removeEventListener('mouseleave', handleLeave);
      container.removeEventListener('touchstart', handleEnter);
      container.removeEventListener('touchend', handleLeave);
    };
  }, [speed]);

  return (
    <div ref={scrollRef} className={`overflow-hidden no-scrollbar ${className}`}>
      <div data-carousel-content className="flex gap-4 w-max">
        {children}
      </div>
    </div>
  );
}
