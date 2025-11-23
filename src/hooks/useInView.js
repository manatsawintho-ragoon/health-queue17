// src/hooks/useInView.js
import { useEffect, useRef, useState } from "react";

/*
  useInView
  - ref: attach to the element you want to observe
  - options: IntersectionObserver options { root, rootMargin, threshold }
  - returns: [ref, inView]
*/
export default function useInView(options = { root: null, rootMargin: "0px", threshold: 0.15 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let mounted = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!mounted) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            // optional: unobserve to only trigger once
            observer.unobserve(entry.target);
          }
        });
      },
      options
    );

    observer.observe(el);

    return () => {
      mounted = false;
      try {
        observer.disconnect();
      } catch (e) {}
    };
  }, [ref.current, JSON.stringify(options)]); // options serialized to re-run if changed

  return [ref, inView];
}
