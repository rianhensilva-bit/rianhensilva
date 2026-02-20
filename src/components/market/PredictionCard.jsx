import React from "react";
import { TrendingUp, Users } from "lucide-react";

export default function PredictionCard({ prediction, darkMode }) {
  const { title, tag, tagColor, yesPercent, noPercent, volume, traders } = prediction;

  return (
    <div
      className={`group relative rounded-2xl border p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
        darkMode
          ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
          : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-zinc-200/50"
      }`}
      style={{ minHeight: "160px" }}
    >
      {/* Tag badge */}
      <div className="flex items-start justify-between mb-3">
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: `${tagColor}15`, color: tagColor }}
        >
          {tag}
        </span>
        <div className={`flex items-center gap-3 text-xs ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            R${volume}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {traders}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className={`text-[15px] font-semibold leading-snug mb-5 line-clamp-2 ${
        darkMode ? "text-zinc-100" : "text-zinc-800"
      }`}>
        {title}
      </h3>

      {/* Yes / No buttons */}
      <div className="flex gap-3 mt-auto">
        <button
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
            darkMode
              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300"
          }`}
        >
          Sim {yesPercent}%
        </button>
        <button
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
            darkMode
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40"
              : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300"
          }`}
        >
          Não {noPercent}%
        </button>
      </div>

      {/* Progress bar */}
      <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-zinc-800" : "bg-zinc-100"}`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${yesPercent}%`,
            background: `linear-gradient(90deg, #10B981, #34D399)`,
          }}
        />
      </div>
    </div>
  );
}