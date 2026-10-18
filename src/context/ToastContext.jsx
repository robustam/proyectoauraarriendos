import { createContext, useCallback, useContext, useRef, useState } from "react";

/* Notificaciones globales con el componente Toast de Bootstrap.
   Uso: const toast = useToast(); toast("Guardado", "success"); */
const ToastContext = createContext(() => {});

const COLORES = { success: "text-bg-success", error: "text-bg-danger", "": "text-bg-dark" };

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(1);

  const quitar = useCallback((id) => {
    setItems((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 350);
  }, []);

  const showToast = useCallback((msg, type = "") => {
    const id = nextId.current++;
    setItems((list) => [...list, { id, msg, type }]);
    window.setTimeout(() => quitar(id), 3200);
  }, [quitar]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={"toast show align-items-center " + (COLORES[t.type] || COLORES[""]) + (t.leaving ? " leaving" : "")} role="status">
            <div className="d-flex">
              <div className="toast-body">{t.msg}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Cerrar" onClick={() => quitar(t.id)} />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
