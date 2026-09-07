import { useEffect, useRef, useState } from "react";

function SourceList({ sources = [], activeSource, onSourceClick }) {
  const [manualExpanded, setManualExpanded] = useState(null);
  const sourceRefs = useRef({});

  useEffect(() => {
    if (activeSource === null) {
      return;
    }

    const element = sourceRefs.current[activeSource];

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeSource]);

  if (!sources.length) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <h4 className="mb-3 text-sm font-semibold text-zinc-300">Sources</h4>

      <div className="space-y-2.5">
        {sources.map((source, index) => {
          const sourceNumber = source.sourceNumber || index + 1;
          const isActive = activeSource === sourceNumber;
          const isManuallyExpanded = manualExpanded === index;
          const isExpanded = isActive || isManuallyExpanded;

          const preview = (source.preview || source.content || "")
            .replace(/\s*\n\s*/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          return (
            <div
              ref={(element) => {
                sourceRefs.current[sourceNumber] = element;
              }}
              key={`${source.chunkIndex}-${index}`}
              className={`overflow-hidden rounded-xl border transition ${
                isActive
                  ? "border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  if (isExpanded) {
                    setManualExpanded(null);
                    if (onSourceClick) {
                      onSourceClick(null);
                    }
                  } else {
                    setManualExpanded(index);
                    if (onSourceClick) {
                      onSourceClick(sourceNumber);
                    }
                  }
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    📄 Source {sourceNumber} — Chunk {source.chunkIndex}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Relevance: {Math.round(source.similarity * 100)}%
                  </p>
                </div>

                <span className="text-zinc-500 text-sm">
                  {isExpanded ? "▲" : "▼"}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-white/10 px-4 py-3.5">
                  <p className="text-sm leading-6 text-zinc-400">{preview}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SourceList;