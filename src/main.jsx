import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastProvider } from "./context/ToastContext";
import { restaurarSesion } from "./services/store";

/* Bootstrap primero (grilla, componentes, responsividad) y luego el tema de
   AuraArriendos, que solo cambia colores, tipografía y detalles de marca. */
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/theme.css";

/* Al abrir o recargar la página: valida la sesión guardada con el backend
   (/auth/me, renovando el token si venció) y descarga los datos actualizados. */
restaurarSesion();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
