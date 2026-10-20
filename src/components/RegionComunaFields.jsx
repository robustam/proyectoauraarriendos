import { REGIONES } from "../services/manifest";
import { comunasDe } from "../services/format";
import { FormField } from "./ui";

/* Selects en cascada Región → Comuna para formularios.
   Trabaja con un objeto `form` de useForm que tenga los campos `region` y `comuna`.
   Se muestran lado a lado desde tablets (col-md-6) y apilados en celular. */
export default function RegionComunaFields({ form, prefix = "" }) {
  const { values, status, setField } = form;
  const comunas = comunasDe(values.region);

  function onRegion(e) {
    /* Al cambiar la región se limpia la comuna (y se valida si ya fue tocada). */
    form.setSilently({ comuna: "" });
    setField("region", e.target.value, status.comuna ? ["comuna"] : []);
  }

  return (
    <>
      <FormField label="Región" htmlFor={prefix + "region"} status={status.region} className="col-md-6">
        <select id={prefix + "region"} className="form-select" value={values.region} onChange={onRegion} autoComplete="address-level1">
          <option value="">Selecciona una región</option>
          {REGIONES.map((r) => <option key={r.region} value={r.region}>{r.region}</option>)}
        </select>
      </FormField>
      <FormField label="Comuna" htmlFor={prefix + "comuna"} status={status.comuna} className="col-md-6">
        <select
          id={prefix + "comuna"} className="form-select" value={values.comuna}
          onChange={(e) => setField("comuna", e.target.value)} disabled={!comunas.length} autoComplete="address-level2"
        >
          <option value="">{comunas.length ? "Selecciona una comuna" : "Selecciona una región primero"}</option>
          {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </FormField>
    </>
  );
}
