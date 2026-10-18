import { useEffect, useRef, useState } from "react";

const reducedMotion =
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Aparición suave al hacer scroll (antes: initReveals de main.js).
   <Reveal as="section" className="page-hero container">…</Reveal> */
export default function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    if (visible) return undefined;
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible(true);
        io.disconnect();
      }
    }, { threshold: 0.05 });
    io.observe(el);
    /* Respaldo: a los 6 s todo queda visible aunque no se haya hecho scroll. */
    const t = window.setTimeout(() => setVisible(true), 6000);
    return () => { io.disconnect(); window.clearTimeout(t); };
  }, [visible]);

  return (
    <Tag ref={ref} className={"reveal" + (visible ? " is-visible" : "") + (className ? " " + className : "")} {...rest}>
      {children}
    </Tag>
  );
}
