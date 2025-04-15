import React from "react";

export function PositionsTable() {
  return (
    <div className="bg-[#18181b] rounded-xl p-6 w-full mt-4">
      <div className="flex gap-2 mb-4">
        <button className="px-4 py-1 rounded bg-[#232328] text-white text-xs font-semibold">Posições abertas (0)</button>
        <button className="px-4 py-1 rounded bg-transparent text-[#a1a1aa] text-xs font-semibold">Posições fechadas (0)</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-[#a1a1aa]">
          <thead>
            <tr className="border-b border-[#232328]">
              <th className="py-2 px-2 font-semibold text-left">Pool</th>
              <th className="py-2 px-2 font-semibold text-left">Investido</th>
              <th className="py-2 px-2 font-semibold text-left">Liq. Atual</th>
              <th className="py-2 px-2 font-semibold text-left">Não Coletado</th>
              <th className="py-2 px-2 font-semibold text-left">Coletado</th>
              <th className="py-2 px-2 font-semibold text-left">PNL</th>
              <th className="py-2 px-2 font-semibold text-left">APR (D/M/A)</th>
              <th className="py-2 px-2 font-semibold text-left">Status do Range</th>
              <th className="py-2 px-2 font-semibold text-left">Range</th>
              <th className="py-2 px-2 font-semibold text-left">Criado</th>
              <th className="py-2 px-2 font-semibold text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={11} className="text-center py-8 text-[#71717a]">
                Nenhuma posição aberta encontrada. Adicione uma posição manualmente usando o botão "Adicionar Posição".
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
