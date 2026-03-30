import { useRef, useEffect, Children, cloneElement } from 'react';

export default function AutoCarousel({ children, speed = 0.5, gap = 16 }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const setWidthRef = useRef(0);

  // Renderizar multiplicar items apenas se for necessário para preencher scroll (ex: > 4 itens)
  const childArray = Children.toArray(children);
  const shouldTriple = childArray.length > 4;
  const renderItems = shouldTriple ? [...childArray, ...childArray, ...childArray] : childArray;

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || childArray.length === 0 || !shouldTriple) return;

    // Calcular largura de 1 set (original)
    const itemCount = childArray.length;
    let totalWidth = 0;
    for (let i = 0; i < itemCount; i++) {
      if (inner.children[i]) {
        totalWidth += inner.children[i].offsetWidth + gap;
      }
    }
    setWidthRef.current = totalWidth;

    const animate = () => {
      if (!pausedRef.current && setWidthRef.current > 0) {
        posRef.current += speed;
        if (posRef.current >= setWidthRef.current) {
          posRef.current -= setWidthRef.current;
        }
        inner.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [speed, gap, childArray.length, shouldTriple]);

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  return (
    <div 
      ref={outerRef} 
      className="overflow-hidden"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      <div
        ref={innerRef}
        className="flex will-change-transform"
        style={{ gap: `${gap}px` }}
      >
        {renderItems}
      </div>
    </div>
  );
}
