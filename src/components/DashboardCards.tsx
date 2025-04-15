import React from "react";

const cards = [
  { label: "Valor Total", value: "$0.00", desc: "Valor atual de liquidez em todas as pools" },
  { label: "Total Investido", value: "$0.00", desc: "Investimento inicial em todas as pools" },
  { label: "Ganhos Totais", value: "$0.00", desc: "Taxas combinadas de todas as pools" },
  { label: "P&L Total", value: "$0.00", desc: "Lucro/perda combinado de todas as pools" },
  { label: "Rendimento Est.", value: "0.00%", desc: "Rendimento médio ponderado", select: true, selectOptions: ["Mensal", "Semanal", "Diário"] },
  { label: "Taxas Est.", value: "$0.00", desc: "Taxas estimadas ganhas", select: true, selectOptions: ["Diário", "Semanal", "Mensal"] },
];

export function DashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-[#18181b] rounded-xl p-4 flex flex-col gap-1 border border-[#232328] min-w-[160px]"
        >
          <span className="text-xs text-[#a1a1aa] font-medium flex items-center gap-2">
            {card.label}
            {card.select && (
              <select className="ml-2 bg-[#232328] text-xs rounded px-2 py-1 border-none outline-none">
                {card.selectOptions?.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            )}
          </span>
          <span className="text-3xl font-semibold text-white">{card.value}</span>
          <span className="text-xs text-[#71717a]">{card.desc}</span>
        </div>
      ))}
    </div>
  );
}
