import { useRef, useEffect } from 'react';

export default function AutoCarousel({ children, speed = 0.5, gap = 16 }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // Medir largura do conteúdo original (sem clones)
    const items = inner.children;
    const originalCount = items.length;

    // Clonar todos os itens pra criar o loop infinito
    for (let i = 0; i < originalCount; i++) {
      const clone = items[i].cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      inner.appendChild(clone);
    }

    // Calcular largura de 1 set completo (original)
    let setWidth = 0;
    for (let i = 0; i < originalCount; i++) {
      setWidth += items[i].offsetWidth + gap;
    }

    const animate = () => {
      if (!pausedRef.current) {
        posRef.current += speed;
        if (posRef.current >= setWidth) {
          posRef.current = 0;
        }
        inner.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    const pause = () => { pausedRef.current = true; };
    const resume = () => { pausedRef.current = false; };

    outer.addEventListener('mouseenter', pause);
    outer.addEventListener('mouseleave', resume);
    outer.addEventListener('touchstart', pause, { passive: true });
    outer.addEventListener('touchend', resume);

    return () => {
      cancelAnimationFrame(animRef.current);
      outer.removeEventListener('mouseenter', pause);
      outer.removeEventListener('mouseleave', resume);
      outer.removeEventListener('touchstart', pause);
      outer.removeEventListener('touchend', resume);
    };
  }, [speed, gap]);

  return (
    <div ref={outerRef} className="overflow-hidden">
      <div
        ref={innerRef}
        className="flex will-change-transform"
        style={{ gap: `${gap}px` }}
      >
        {children}
      </div>
    </div>
  );
}
