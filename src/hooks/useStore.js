import { useSyncExternalStore } from "react";
import * as store from "../services/store";

/* Se re-renderiza el componente cada vez que el store escribe en localStorage.
   Uso: const version = useStoreVersion(); luego leer con store.getX() en el render. */
export function useStoreVersion() {
  return useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
}

/* Sesión actual (o null), reactiva a login/logout. */
export function useSession() {
  useStoreVersion();
  return store.getSesion();
}
