import { useLocation, useNavigate } from "react-router-dom";
import * as store from "../services/store";
import { useToast } from "../context/ToastContext";
import { useStoreVersion } from "./useStore";

/* Agregar/quitar una propiedad de "Mis solicitudes". Exige sesión: sin sesión
   manda a /login y vuelve a la página actual después de ingresar. */
export default function useSolicitudToggle() {
  useStoreVersion();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  function requireLogin() {
    if (store.getSesion()) return true;
    const next = location.pathname + location.search;
    navigate("/login?aviso=solicitudes&next=" + encodeURIComponent(next));
    return false;
  }

  function toggle(id) {
    if (!requireLogin()) return;
    if (store.estaEnSolicitudes(id)) {
      store.quitarSolicitud(id);
      toast("Quitado de mis solicitudes");
    } else {
      store.agregarSolicitud(id);
      toast("Agregado a mis solicitudes", "success");
    }
  }

  return { toggle, requireLogin, isSaved: store.estaEnSolicitudes };
}
