/* Pestañas de filtro (Nav pills de Bootstrap). */
export default function AdminTabs({ tabs, active, onChange }) {
  return (
    <ul className="nav nav-pills gap-2 mb-3" role="tablist">
      {tabs.map((t) => (
        <li className="nav-item" key={t.key}>
          <button
            type="button" role="tab" aria-selected={t.key === active}
            className={"nav-link" + (t.key === active ? " active" : "")}
            onClick={() => onChange(t.key)}
          >
            {t.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
