import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { animateScrollToTop } from "../utils/scroll/animateScrollToTop";
type Props = {
  containerSelector?: string;
  threshold?: number;
};

export default function BackToTopButton({
  containerSelector,
  threshold = 250,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerSelector
      ? (document.querySelector(containerSelector) as HTMLElement | null)
      : null;

    const getTop = () =>
      el
        ? el.scrollTop
        : window.scrollY || document.documentElement.scrollTop || 0;

    const onScroll = () => {
      setVisible(getTop() > threshold);
    };

    const target: any = el ?? window;
    target.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => target.removeEventListener("scroll", onScroll);
  }, [containerSelector, threshold]);

  const scrollToTop = () => {
    const el = containerSelector
      ? (document.querySelector(containerSelector) as HTMLElement | null)
      : null;
    animateScrollToTop(el ?? window, 700);
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-50 rounded-full bg-blue-600 text-white shadow-lg
        hover:bg-blue-700 hover:shadow-xl transition-all duration-300
        p-3 md:p-3.5 ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 pointer-events-none translate-y-3"
        }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
