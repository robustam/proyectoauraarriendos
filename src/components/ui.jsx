/* Piezas pequeñas de interfaz, construidas con clases de Bootstrap. */

import { Children, cloneElement, isValidElement, useEffect } from "react";
import { comprimirImagen } from "../utils/format";

/* Campo de formulario: etiqueta + control + ayuda + error.
   - El primer hijo (input/select/textarea) recibe "is-invalid" o "is-valid"
     de Bootstrap según `status` ({ error } o { ok: true }).
   - El mensaje de error solo aparece cuando hay error.
   - `className` define el ancho en la grilla (por defecto "col-12"). */
export function FormField({ label, htmlFor, status, hint, className = "col-12", children }) {
  const errorId = htmlFor ? htmlFor + "-error" : undefined;
  const hayError = !!(status && status.error);
  const esValido = !!(status && status.ok);

  const contenido = Children.map(children, (child, i) => {
    const esControl = i === 0 && isValidElement(child) && ["input", "select", "textarea"].includes(child.type);
    if (!esControl) return child;
    const clases = [child.props.className, hayError ? "is-invalid" : "", esValido ? "is-valid" : ""].filter(Boolean).join(" ");
    return cloneElement(child, {
      className: clases,
      "aria-invalid": hayError || undefined,
      "aria-describedby": hayError ? errorId : undefined
    });
  });

  return (
    <div className={className}>
      {label && <label className="form-label" htmlFor={htmlFor}>{label}</label>}
      {contenido}
      {hint && <div className="form-text">{hint}</div>}
      {hayError && <div id={errorId} className="invalid-feedback d-block" role="alert">{status.error}</div>}
    </div>
  );
}

/* Mensaje general del formulario con el componente Alert de Bootstrap.
   alert = { type: "error" | "success" | "info", text } */
const ALERT_CLASE = { error: "alert-danger", success: "alert-success", info: "alert-info" };
export function FormAlert({ alert }) {
  if (!alert) return null;
  return <div className={"alert " + (ALERT_CLASE[alert.type] || "alert-info")} role="status">{alert.text}</div>;
}

export function EmptyState({ glyph, title, children }) {
  return (
    <div className="empty-state">
      {glyph && <p className="glyph">{glyph}</p>}
      {title && <h3 className="h5">{title}</h3>}
      {children}
    </div>
  );
}

/* Badge de estado: publicada, pendiente, pagada, rechazada, etc. */
export function StatusPill({ estado, label }) {
  const key = String(estado || "").toLowerCase();
  return <span className={"status-pill status-" + key}>{label || estado}</span>;
}

/* Modal de Bootstrap controlado por React (no necesita el JS de Bootstrap).
   Se cierra con Escape, con la X o haciendo clic fuera. */
export function Modal({ open, title, onClose, children, actions }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div
        className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title h5">{title}</h2>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {actions && <div className="modal-footer">{actions}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}

/* Confirmación de eliminación usada en todas las tablas del panel. */
export function ConfirmDeleteModal({ open, title, message, onCancel, onConfirm }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      actions={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancelar</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>Eliminar</button>
        </>
      }
    >
      <p className="mb-0 text-mute">{message || "Esta acción no se puede deshacer."}</p>
    </Modal>
  );
}

/* Selector de imagen con vista previa; entrega un data URL comprimido. */
export function ImagePicker({ id, value, onChange }) {
  async function handle(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    onChange(await comprimirImagen(file));
  }
  return (
    <>
      <input type="file" id={id} className="form-control" accept="image/*" onChange={handle} />
      {value && (
        <div className="image-preview">
          <img src={value} alt="Vista previa" />
        </div>
      )}
    </>
  );
}

/* Encabezado estándar de las páginas del panel. */
export function AdminHeader({ eyebrow, title, children }) {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="mb-0">{title}</h1>
      </div>
      {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
