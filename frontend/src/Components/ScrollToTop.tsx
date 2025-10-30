import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { animateScrollToTop } from "../utils/scroll/animateScrollToTop";

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    setTimeout(() => {
      animateScrollToTop(window, 700);
    }, 10);

    return () => {
      html.style.scrollBehavior = prev;
    };
  }, [pathname, search]);

  return null;
}
