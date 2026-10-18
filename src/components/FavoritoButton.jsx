/* Botón "Agregar a mis solicitudes" del detalle de una propiedad.
   Recibe por props si la propiedad ya está guardada y qué hacer al hacer clic. */
export default function FavoritoButton({ guardada = false, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className={"btn " + (guardada ? "btn-accent" : "btn-primary")}
      aria-pressed={guardada}
      onClick={onClick}
      disabled={disabled}
    >
      {guardada ? "♥ En mis solicitudes" : "♡ Agregar a mis solicitudes"}
    </button>
  );
}
