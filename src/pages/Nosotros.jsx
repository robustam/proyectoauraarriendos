import Reveal from "../components/Reveal";
import useTitle from "../hooks/useTitle";
import aboutOffice from "../assets/about-office.jpg";

const VALORES = [
  { glyph: "🤝", titulo: "Confianza primero", texto: "Cada publicación es revisada manualmente antes de salir al público." },
  { glyph: "🌱", titulo: "Sostenibilidad", texto: "Promovemos el buen uso de los espacios existentes por sobre la construcción innecesaria." },
  { glyph: "💬", titulo: "Comunicación clara", texto: "Sin letra chica: condiciones, precios y contactos visibles desde el primer momento." }
];

const EQUIPO = [
  { nombre: "Roberto Bustamante", rol: "Desarrollo Fullstack - Diseñador Web" },
  { nombre: "Sebastian Reyes", rol: "Desarrollo Fullstack - Diseñador Web" },
  { nombre: "Renato Navarrete", rol: "Desarrollo Fullstack - Diseñador Web" }
];

export default function Nosotros() {
  useTitle("Nosotros — AuraArriendos");
  return (
    <>
      <Reveal as="section" className="page-hero container">
        <p className="eyebrow">Sobre AuraArriendos</p>
        <h1>Creemos que arrendar puede ser simple y transparente.</h1>
        <p className="lede">Nacimos para resolver un problema real: encontrar un arriendo confiable toma demasiado tiempo y genera demasiadas dudas. Verificamos cada publicación y ponemos herramientas simples al servicio de arrendatarios y arrendadores.</p>
      </Reveal>

      <section className="container section-tight">
        <div className="row g-4 g-lg-5 align-items-center">
          <Reveal className="col-md-6"><div className="about-media"><img src={aboutOffice} alt="Oficina del equipo AuraArriendos" loading="lazy" /></div></Reveal>
          <Reveal className="col-md-6">
            <p className="eyebrow">Nuestra misión</p>
            <h2>Conectar personas con espacios que sí calzan con su vida.</h2>
            <p className="lede mt-3">Desde 2024 trabajamos con arrendadores particulares y pequeñas inmobiliarias para dar visibilidad a propiedades bien mantenidas, con información clara sobre precio, condiciones y disponibilidad real.</p>
            <p className="lede">Cada propiedad pasa por una revisión antes de publicarse: así protegemos tanto a quienes buscan arriendo como a quienes ofrecen su propiedad.</p>
          </Reveal>
        </div>
      </section>

      <section className="section container">
        <Reveal className="section-head text-center mx-auto">
          <p className="eyebrow">Lo que nos guía</p>
          <h2>Nuestros valores</h2>
        </Reveal>
        <Reveal className="row g-3 row-cols-1 row-cols-md-3">
          {VALORES.map((v) => (
            <div className="col" key={v.titulo}>
              <div className="card h-100 p-4"><p className="fs-3 mb-2">{v.glyph}</p><h3 className="h5">{v.titulo}</h3><p className="text-mute mb-0">{v.texto}</p></div>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="section container pt-0">
        <Reveal className="section-head">
          <p className="eyebrow">Quiénes lo hacemos posible</p>
          <h2>Un equipo pequeño, con foco en el detalle</h2>
        </Reveal>
        <Reveal className="row g-4 row-cols-1 row-cols-sm-3 text-center">
          {EQUIPO.map((m) => (
            <div className="col" key={m.nombre}><div className="team-avatar">{m.nombre.charAt(0)}</div><strong className="d-block">{m.nombre}</strong><small className="text-mute">{m.rol}</small></div>
          ))}
        </Reveal>
      </section>
    </>
  );
}
