import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { AdminHeader, FormAlert, FormField } from "../../components/ui";
import * as store from "../../services/store";
import { useToast } from "../../context/ToastContext";
import useForm from "../../hooks/useForm";
import useTitle from "../../hooks/useTitle";
import * as V from "../../services/validators";

/* Alta y edición de visitas y entregas. Al guardar una entrega "Entregado",
   el store marca la propiedad como arrendada automáticamente. */
const ESTADOS = { visita: ["Agendada", "Realizada", "Cancelada"], entrega: ["Pendiente", "Entregado"] };
const TEXTOS = {
  visita: { nuevo: "Nueva visita", editar: "Editar visita", boton: "Guardar visita" },
  entrega: { nuevo: "Nueva entrega", editar: "Editar entrega", boton: "Guardar entrega" }
};

const normalizar = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const etiqueta = (p) => p.nombre + " — " + p.comuna;

function propietarioDe(propiedadId) {
  const p = store.getPropiedadPorId(propiedadId);
  if (!p) return { correo: "", nombre: "", texto: "Selecciona una propiedad primero." };
  if (!p.publicadoPor) return { correo: "", nombre: "", texto: "No especificado (propiedad sin arrendador registrado)." };
  const u = store.getUsuarioPorCorreo(p.publicadoPor);
  const nombre = u ? u.nombre + " " + u.apellidos : "";
  return { correo: p.publicadoPor, nombre, texto: nombre ? nombre + " (" + p.publicadoPor + ")" : p.publicadoPor };
}

/* Buscador de propiedades con lista desplegable. */
function PropiedadAutocomplete({ propiedades, value, query, onQuery, onSelect, status }) {
  const [open, setOpen] = useState(false);
  const [activo, setActivo] = useState(0);
  const q = normalizar(query);
  const coincidencias = propiedades
    .filter((p) => normalizar(p.nombre).includes(q) || normalizar(p.comuna).includes(q) || normalizar(p.codigo).includes(q))
    .slice(0, 8);

  function elegir(p) {
    onSelect(p);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") setOpen(false);
    if (!open || !coincidencias.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActivo((a) => Math.min(a + 1, coincidencias.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActivo((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); elegir(coincidencias[activo]); }
  }

  return (
    <FormField label="Propiedad" htmlFor="t-propiedad" status={status} className="col-12 position-relative" hint="Escribe para filtrar entre las propiedades publicadas.">
      <input
        type="text" id="t-propiedad" className="form-control" autoComplete="off" placeholder="Busca por nombre, comuna o código…"
        role="combobox" aria-expanded={open} aria-controls="t-propiedad-lista"
        value={query}
        onChange={(e) => { onQuery(e.target.value); setActivo(0); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div className="list-group autocomplete-list" id="t-propiedad-lista" role="listbox" aria-label="Resultados de propiedades">
          {coincidencias.length ? coincidencias.map((p, i) => (
            <button
              type="button" key={p.id} role="option" aria-selected={p.id === value}
              className={"list-group-item list-group-item-action" + (i === activo ? " active" : "")}
              onMouseDown={(e) => { e.preventDefault(); elegir(p); }}
            >
              <strong className="d-block small">{p.nombre}</strong>
              <span className="small text-mute">{p.comuna} · {p.codigo}</span>
            </button>
          )) : <div className="list-group-item small text-mute">No hay propiedades que coincidan con la búsqueda.</div>}
        </div>
      )}
    </FormField>
  );
}

function Formulario({ existente, tipo, sesion }) {
  const navigate = useNavigate();
  const toast = useToast();
  const editando = !!existente;
  const textos = TEXTOS[tipo];
  const [alert, setAlert] = useState(null);

  const propiedades = useMemo(() => store.getPropiedades().filter((p) => p.estado === "publicada"), []);
  const clientes = useMemo(() => store.getUsuarios().filter((u) => u.tipoUsuario === "Cliente"), []);

  const inicial = useMemo(() => {
    if (!editando) return { propiedadId: "", cliente: "", fecha: "", hora: "", estado: ESTADOS[tipo][0], notas: "" };
    return {
      propiedadId: existente.propiedadId, cliente: existente.clienteCorreo, fecha: existente.fecha || "",
      hora: existente.hora || "", estado: existente.estado, notas: existente.notas || ""
    };
  }, [editando, existente, tipo]);

  const [query, setQuery] = useState(() => {
    if (!editando) return "";
    const p = store.getPropiedadPorId(existente.propiedadId);
    return p ? etiqueta(p) : existente.propiedadNombre || existente.propiedadId;
  });

  const rules = useMemo(() => ({
    propiedadId: (v) => (V.requerido(v) ? null : "Busca y selecciona una propiedad de la lista."),
    cliente: (v) => (V.requerido(v) ? null : "Selecciona un cliente."),
    fecha: (v) => (V.requerido(v) ? null : "Selecciona una fecha."),
    hora: (v) => (tipo !== "visita" || V.requerido(v) ? null : "Selecciona una hora para la visita."),
    estado: (v) => (V.requerido(v) ? null : "Selecciona un estado.")
  }), [tipo]);

  const form = useForm(inicial, rules);
  const { values, status, bind } = form;
  const propietario = propietarioDe(values.propiedadId);

  function onSubmit(e) {
    e.preventDefault();
    if (!form.validateAll()) {
      setAlert({ type: "error", text: "Revisa los campos marcados en rojo." });
      return;
    }
    const p = store.getPropiedadPorId(values.propiedadId);
    const c = store.getUsuarioPorCorreo(values.cliente);
    const tramite = {
      id: editando ? existente.id : store.nuevoIdTramite(),
      tipo,
      propiedadId: values.propiedadId,
      propiedadNombre: p ? p.nombre : "",
      clienteCorreo: values.cliente,
      clienteNombre: c ? c.nombre + " " + c.apellidos : values.cliente,
      propietarioCorreo: propietario.correo,
      propietarioNombre: propietario.nombre,
      fecha: values.fecha,
      hora: tipo === "visita" ? values.hora : "",
      estado: values.estado,
      notas: values.notas.trim(),
      creadoPor: editando ? existente.creadoPor : sesion.correo
    };
    store.guardarTramite(tramite);
    toast(
      tipo === "entrega" && tramite.estado === "Entregado"
        ? "Entrega guardada. La propiedad quedó marcada como arrendada."
        : editando ? "Registro actualizado" : tipo === "visita" ? "Visita agendada" : "Entrega registrada",
      "success"
    );
    navigate("/admin/visitas");
  }

  return (
    <>
      <AdminHeader eyebrow="Coordinación con propietarios y arrendatarios" title={editando ? textos.editar : textos.nuevo}>
        <Link to="/admin/visitas" className="btn btn-outline-secondary">← Volver al listado</Link>
      </AdminHeader>

      <form className="form-panel" style={{ maxWidth: 720 }} onSubmit={onSubmit} noValidate aria-label={textos.nuevo}>
        <FormAlert alert={alert} />
        <div className="row g-3">
          <PropiedadAutocomplete
            propiedades={propiedades}
            value={values.propiedadId}
            query={query}
            status={status.propiedadId}
            onQuery={(q) => { setQuery(q); form.setSilently({ propiedadId: "" }); }}
            onSelect={(p) => { setQuery(etiqueta(p)); form.setField("propiedadId", p.id); }}
          />
          <div className="col-12">
            <span className="form-label d-block">Propietario</span>
            <div className="owner-info" data-testid="propietario">{propietario.texto}</div>
          </div>
          <FormField label="Cliente / arrendatario" htmlFor="t-cliente" status={status.cliente} hint="Solo se listan cuentas con tipo de usuario Cliente.">
            <select className="form-select" {...bind("cliente", "t-")}>
              <option value="">Selecciona un cliente</option>
              {clientes.map((u) => <option key={u.correo} value={u.correo}>{u.nombre} {u.apellidos} ({u.correo})</option>)}
            </select>
          </FormField>
          <FormField label="Fecha" htmlFor="t-fecha" status={status.fecha} className="col-md-6">
            <input type="date" className="form-control" {...bind("fecha", "t-")} />
          </FormField>
          {tipo === "visita" && (
            <FormField label="Hora" htmlFor="t-hora" status={status.hora} className="col-md-6">
              <input type="time" className="form-control" {...bind("hora", "t-")} />
            </FormField>
          )}
          <FormField label="Estado" htmlFor="t-estado" status={status.estado} className="col-md-6">
            <select className="form-select" {...bind("estado", "t-")}>
              {ESTADOS[tipo].map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </FormField>
          <FormField label="Notas (opcional)" htmlFor="t-notas">
            <textarea className="form-control" rows={3} {...bind("notas", "t-")} maxLength={500} placeholder="Detalles de la coordinación, condiciones acordadas, etc." />
          </FormField>
          <div className="col-12 d-grid">
            <button type="submit" className="btn btn-primary">{textos.boton}</button>
          </div>
        </div>
      </form>
    </>
  );
}

export default function VisitaForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { sesion } = useOutletContext();
  const existente = id ? store.getTramitePorId(id) : null;
  const tipo = existente ? existente.tipo : params.get("tipo") === "entrega" ? "entrega" : "visita";
  useTitle(TEXTOS[tipo][id ? "editar" : "nuevo"] + " — Panel AuraArriendos");

  if (id && !existente) return <Navigate to="/admin/visitas" replace />;
  return <Formulario key={(id || "nuevo") + tipo} existente={existente} tipo={tipo} sesion={sesion} />;
}
