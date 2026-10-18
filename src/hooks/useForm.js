import { useCallback, useRef, useState } from "react";

/* Manejo de formularios con validación en tiempo real, equivalente a
   AuraValidators.validarCampo del sitio original.

   rules: { campo: (valor, todosLosValores) => "mensaje de error" | null }

   - setField(campo, valor, otros?) actualiza y valida ese campo (y los `otros`).
   - bind(campo) entrega { id, name, value, onChange } para inputs/selects.
   - validateAll() valida todo (en el submit) y retorna true/false.
   - status[campo] = { error } | { ok: true } para pintar has-error / has-success. */
export default function useForm(initialValues, rules) {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState({});
  const valuesRef = useRef(initialValues);
  const rulesRef = useRef(rules);
  rulesRef.current = rules;

  const validate = useCallback((names, vals) => {
    const patch = {};
    let ok = true;
    names.forEach((name) => {
      const rule = rulesRef.current[name];
      if (!rule) return;
      const error = rule(vals[name], vals);
      patch[name] = error ? { error } : { ok: true };
      if (error) ok = false;
    });
    setStatus((s) => ({ ...s, ...patch }));
    return ok;
  }, []);

  const setField = useCallback((name, value, alsoValidate = []) => {
    const next = { ...valuesRef.current, [name]: value };
    valuesRef.current = next;
    setValues(next);
    validate([name, ...alsoValidate], next);
  }, [validate]);

  /* Cambia valores sin validar (ej: precargar, limpiar la comuna al cambiar región). */
  const setSilently = useCallback((patch) => {
    const next = { ...valuesRef.current, ...patch };
    valuesRef.current = next;
    setValues(next);
  }, []);

  const validateAll = useCallback(() => {
    return validate(Object.keys(rulesRef.current), valuesRef.current);
  }, [validate]);

  const reset = useCallback((nextValues = initialValues) => {
    valuesRef.current = nextValues;
    setValues(nextValues);
    setStatus({});
  }, [initialValues]);

  const bind = (name, prefix = "") => ({
    id: prefix + name,
    name,
    value: values[name] ?? "",
    onChange: (e) => setField(name, e.target.type === "checkbox" ? e.target.checked : e.target.value)
  });

  return { values, status, setField, setSilently, validateAll, reset, bind };
}
