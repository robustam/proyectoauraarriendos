import { useState } from "react";
import { Link } from "react-router-dom";
import AdminTabs from "../../components/AdminTabs";
import { AdminHeader, ConfirmDeleteModal, EmptyState, StatusPill } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import { useStoreVersion } from "../../hooks/useStore";
import useTitle from "../../hooks/useTitle";

/* Visitas al inmueble y entregas al cierre del arriendo (Administrador y Agente). */
const TABS = [
  { key: "todas", label: "Todas" },
  { key: "visita", label: "Visitas" },
  { key: "entrega", label: "Entregas" }
];

function formatFecha(t) {
  if (!t.fecha) return "—";
  const f = new Date(t.fecha + "T00:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
  return t.hora ? f + " · " + t.hora : f;
}

export default function Visitas() {
  useTitle("Visitas y entregas — Panel AuraArriendos");
  useStoreVersion();
  const toast = useToast();
  const [tab, setTab] = useState("todas");
  const [eliminar, setEliminar] = useState(null);

  let lista = store.getTramites();
  if (tab !== "todas") lista = lista.filter((t) => t.tipo === tab);

  function setEstado(t, estado) {
    store.guardarTramite({ ...t, estado });
    toast(
      t.tipo === "entrega" && estado === "Entregado"
        ? "Entrega confirmada. La propiedad quedó marcada como arrendada."
        : "Estado actualizado",
      "success"
    );
  }

  function confirmar() {
    store.eliminarTramite(eliminar);
    setEliminar(null);
    toast("Registro eliminado", "error");
  }

  return (
    <>
      <AdminHeader eyebrow="Coordinación con propietarios y arrendatarios" title={"Visitas y entregas (" + lista.length + ")"}>
        <Link to="/admin/visitas/nueva?tipo=visita" className="btn btn-outline-secondary">+ Nueva visita</Link>
        <Link to="/admin/visitas/nueva?tipo=entrega" className="btn btn-primary">+ Nueva entrega</Link>
      </AdminHeader>

      <p className="lede mb-3">Agenda visitas al inmueble y registra la entrega cuando el arriendo se concreta. Al confirmar una entrega, la propiedad se marca automáticamente como arrendada.</p>

      <AdminTabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="table-responsive table-card">
        <table className="table table-hover align-middle">
          <thead>
            <tr><th>Tipo</th><th>Propiedad</th><th>Cliente</th><th>Propietario</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {lista.length ? lista.map((t) => (
              <tr key={t.id}>
                <td className="text-nowrap">{t.tipo === "visita" ? "🔑 Visita" : "📦 Entrega"}</td>
                <td>{t.propiedadNombre || t.propiedadId}</td>
                <td>{t.clienteNombre || t.clienteCorreo}</td>
                <td>{t.propietarioNombre || t.propietarioCorreo || "No especificado"}</td>
                <td className="text-nowrap">{formatFecha(t)}</td>
                <td><StatusPill estado={t.estado} /></td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    <Link to={"/admin/visitas/" + encodeURIComponent(t.id) + "/editar"} className="btn btn-outline-secondary btn-sm">Editar</Link>
                    {t.tipo === "visita" && t.estado === "Agendada" && (
                      <>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEstado(t, "Realizada")}>Marcar realizada</button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => setEstado(t, "Cancelada")}>Cancelar</button>
                      </>
                    )}
                    {t.tipo === "entrega" && t.estado === "Pendiente" && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setEstado(t, "Entregado")}>Confirmar entrega</button>
                    )}
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setEliminar(t.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7}><EmptyState glyph="📅" title="No hay registros en esta categoría" /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!eliminar}
        title="Eliminar registro"
        message="Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar este registro?"
        onCancel={() => setEliminar(null)}
        onConfirm={confirmar}
      />
    </>
  );
}
