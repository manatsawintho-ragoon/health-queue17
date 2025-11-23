import React from "react";
import useInView from "../hooks/useInView";

export default function AnimateSection({
  children,
  className = "",
  animateClass = "animate-fadeIn",
  initialClass = "opacity-0 translate-y-6",
  options = { root: null, rootMargin: "0px", threshold: 0.15 },
}) {
  const [ref, inView] = useInView(options);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${
        inView ? animateClass + " opacity-100 translate-y-0" : initialClass
      }`}
      aria-hidden={!inView}
    >
      {children}
    </div>
  );
}
