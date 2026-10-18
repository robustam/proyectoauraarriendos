import * as store from "../services/store";
import * as V from "../utils/validators";
import RegionComunaFields from "./RegionComunaFields";
import { FormField, ImagePicker } from "./ui";

/* Campos y reglas comunes a "Publicar mi arriendo" (público) y al formulario
   de propiedades del panel admin. Reglas: nombre req. máx. 100, descripción
   opcional máx. 500, precio req. mín. 0, precio de oferta opcional y menor
   al precio, unidades enteras ≥ 0, stock crítico opcional entero ≥ 0,
   categoría, región, comuna, dirección req. máx. 300 y superficie ≥ 1.
   Los campos se ordenan con la grilla de Bootstrap (row g-3 + col-md-6). */
export const PROPIEDAD_VACIA = {
  categoria: "", nombre: "", descripcion: "", region: "", comuna: "", direccion: "",
  precio: "", precioOferta: "", m2: "", dormitorios: "1", banos: "1", unidades: "1", alerta: "",
  estacionamiento: false, imagen: ""
};

const enteroOpcional = (v) => v === "" || (V.esEntero(v) && V.numeroEntre(v, 0, null));

export const propiedadRules = {
  categoria: (v) => (V.requerido(v) ? null : "Selecciona un tipo de inmueble."),
  nombre: (v) => (V.requerido(v) && V.largoEntre(v, 1, 100) ? null : "Ingresa un título (máximo 100 caracteres)."),
  descripcion: (v) => (V.largoEntre(v, 0, 500) ? null : "Máximo 500 caracteres."),
  region: (v) => (V.requerido(v) ? null : "Selecciona una región."),
  comuna: (v) => (V.requerido(v) ? null : "Selecciona una comuna."),
  direccion: (v) => (V.requerido(v) && V.largoEntre(v, 1, 300) ? null : "Ingresa la dirección (máximo 300 caracteres)."),
  precio: (v) => (V.numeroEntre(v, 0, null) ? null : "El precio debe ser 0 o mayor."),
  precioOferta: (v, all) => {
    if (v === "") return null;
    if (!V.numeroEntre(v, 0, null)) return "El precio de oferta debe ser 0 o mayor.";
    return V.esNumero(all.precio) && Number(v) >= Number(all.precio) ? "La oferta debe ser menor al precio normal." : null;
  },
  m2: (v) => (V.numeroEntre(v, 1, null) ? null : "Ingresa la superficie en m²."),
  dormitorios: (v) => (enteroOpcional(v) ? null : "Número entero de 0 o más."),
  banos: (v) => (enteroOpcional(v) ? null : "Número entero de 0 o más."),
  unidades: (v) => (V.esEntero(v) && V.numeroEntre(v, 0, null) ? null : "Ingresa un número entero de unidades disponibles (0 o más)."),
  alerta: (v) => (enteroOpcional(v) ? null : "Debe ser un número entero de 0 o más.")
};

/* Convierte los valores del formulario a los campos numéricos que guarda el store. */
export function camposNumericos(v) {
  return {
    precio: Number(v.precio),
    precioOferta: v.precioOferta === "" ? null : Number(v.precioOferta),
    dormitorios: Number(v.dormitorios || 0),
    banos: Number(v.banos || 0),
    m2: Number(v.m2),
    unidadesDisponibles: Number(v.unidades),
    alertaDisponibilidad: v.alerta === "" ? null : Number(v.alerta)
  };
}

export default function PropiedadCampos({ form, prefix = "p-", admin = false, children }) {
  const { status, bind, values, setField, setSilently } = form;
  const categorias = store.getCategorias();

  return (
    <>
      <FormField label={admin ? "Categoría" : "Tipo de inmueble"} htmlFor={prefix + "categoria"} status={status.categoria} className="col-md-6">
        <select className="form-select" {...bind("categoria", prefix)}>
          <option value="">Selecciona un tipo</option>
          {categorias.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
        </select>
      </FormField>
      <FormField label={admin ? "Nombre / título" : "Título de la publicación"} htmlFor={prefix + "nombre"} status={status.nombre} className="col-md-6">
        <input type="text" className="form-control" {...bind("nombre", prefix)} maxLength={100} placeholder="Ej: Departamento luminoso cerca del metro" />
      </FormField>
      <FormField label="Descripción (opcional)" htmlFor={prefix + "descripcion"} status={status.descripcion} hint={values.descripcion.length + " / 500"}>
        <textarea className="form-control" rows={3} {...bind("descripcion", prefix)} maxLength={500} placeholder="Describe la propiedad, terminaciones, entorno, etc." />
      </FormField>
      <RegionComunaFields form={form} prefix={prefix} />
      <FormField label="Dirección" htmlFor={prefix + "direccion"} status={status.direccion}>
        <input type="text" className="form-control" {...bind("direccion", prefix)} maxLength={300} placeholder="Calle y número" />
      </FormField>
      <FormField label="Precio mensual (CLP)" htmlFor={prefix + "precio"} status={status.precio} className="col-md-4"
        hint={admin ? "Mínimo 0. Admite decimales." : "0 = arriendo gratuito"}>
        <input
          type="number" className="form-control" id={prefix + "precio"} value={values.precio} min="0" step={admin ? "0.01" : "1000"} inputMode="decimal"
          onChange={(e) => setField("precio", e.target.value, values.precioOferta ? ["precioOferta"] : [])}
        />
      </FormField>
      <FormField label="Precio de oferta (opcional)" htmlFor={prefix + "precioOferta"} status={status.precioOferta} className="col-md-4" hint="Si lo completas, aparece en Ofertas.">
        <input type="number" className="form-control" {...bind("precioOferta", prefix)} min="0" step="1000" inputMode="decimal" />
      </FormField>
      <FormField label="Superficie (m²)" htmlFor={prefix + "m2"} status={status.m2} className="col-md-4">
        <input type="number" className="form-control" {...bind("m2", prefix)} min="1" step="1" />
      </FormField>
      <FormField label="Dormitorios" htmlFor={prefix + "dormitorios"} status={status.dormitorios} className="col-6 col-md-3">
        <input type="number" className="form-control" {...bind("dormitorios", prefix)} min="0" step="1" />
      </FormField>
      <FormField label="Baños" htmlFor={prefix + "banos"} status={status.banos} className="col-6 col-md-3">
        <input type="number" className="form-control" {...bind("banos", prefix)} min="0" step="1" />
      </FormField>
      <FormField label={admin ? "Stock (unidades)" : "Unidades disponibles"} htmlFor={prefix + "unidades"} status={status.unidades} className="col-6 col-md-3">
        <input type="number" className="form-control" {...bind("unidades", prefix)} min="0" step="1" />
      </FormField>
      <FormField label={admin ? "Stock crítico" : "Avisar al quedar"} htmlFor={prefix + "alerta"} status={status.alerta} className="col-6 col-md-3"
        hint={admin ? "Alerta cuando el stock sea igual o menor." : "Opcional"}>
        <input type="number" className="form-control" {...bind("alerta", prefix)} min="0" step="1" placeholder="Ej: 1" />
      </FormField>
      {children}
      <FormField label={admin ? "Imagen principal (opcional)" : "Fotografía principal"} htmlFor={prefix + "imagen"}>
        <ImagePicker id={prefix + "imagen"} value={values.imagen} onChange={(img) => setSilently({ imagen: img })} />
      </FormField>
    </>
  );
}
