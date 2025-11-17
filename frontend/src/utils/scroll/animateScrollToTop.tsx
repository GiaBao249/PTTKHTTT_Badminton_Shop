export function easeOutExpo(x: number) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function animateScrollTo(
  target: Window | Element,
  toY: number,
  duration = 700,
  easing: (x: number) => number = easeOutExpo
) {
  const getY = () =>
    target instanceof Window
      ? window.scrollY || document.documentElement.scrollTop || 0
      : (target as Element).scrollTop;

  const setY = (y: number) => {
    if (target instanceof Window) window.scrollTo(0, y);
    else (target as Element).scrollTop = y;
  };

  const startY = getY();
  if (startY === toY) return;

  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const y = Math.round(startY + (toY - startY) * easing(t));
    setY(y);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function animateScrollToTop(
  target: Window | Element = window,
  duration = 700
) {
  animateScrollTo(target, 0, duration);
}
