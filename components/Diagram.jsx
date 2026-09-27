// Layered architecture sketch: each layer feeds the one below it.
// Layers take the cell colours in order (new → maturing → old).
const TONES = ['border-l-signal', 'border-l-mature', 'border-l-old'];

export default function Diagram({ layers }) {
  return (
    <div className="flex flex-col">
      {layers.map((layer, i) => (
        <div key={layer.label}>
          {i > 0 && (
            <div className="flex sm:pl-[128px] py-1.5" aria-hidden="true">
              <span className="font-mono text-mute/70 text-sm pl-4">↓</span>
            </div>
          )}
          <div className="sm:grid sm:grid-cols-[112px_1fr] sm:gap-4 sm:items-center">
            <div className="font-mono text-xs text-mute mb-2 sm:mb-0">{layer.label}</div>
            <ul className="list-none p-0 m-0 flex flex-wrap gap-2">
              {layer.nodes.map((n) => (
                <li
                  key={n}
                  className={`text-sm text-text bg-paper border border-line border-l-2 ${TONES[i % 3]} rounded-md px-3 py-2`}
                >
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
