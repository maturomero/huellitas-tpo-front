import React from "react";

export default function AnimalChipsSelector({
  options = [],   // [{ id, name }]
  value = [],     // [ids]
  onChange,
  label = "Animal(es)",
}) {
  const selected = new Set(value);

  const add = (e) => {
    const id = Number(e.target.value);
    if (!id) return;
    if (!selected.has(id)) onChange([...value, id]);
    e.target.value = "";
  };

  const remove = (id) => onChange(value.filter((v) => v !== id));

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm md:text-base font-medium">{label}</label>

      <select
        defaultValue=""
        onChange={add}
        className="h-12 md:h-14 rounded-lg border border-[#dce5de] px-3 bg-white"
      >
        <option value="">Añadir animal…</option>
        {options
          .filter((o) => !selected.has(Number(o.id)))
          .map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
      </select>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((id) => {
            const item = options.find((o) => Number(o.id) === Number(id));
            const labelTxt = item?.name ?? `#${id}`;
            return (
              <li
                key={id}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-text-light border border-primary/20 px-3 py-1"
              >
                <span className="text-sm">{labelTxt}</span>
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="size-5 flex items-center justify-center rounded-full bg-primary text-white"
                  aria-label={`Quitar ${labelTxt}`}
                >
                  <span className="text-sm p-0">×</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
