import React from "react";
import { Position } from "./AddPositionModal";

function formatAgo(dateIso: string) {
  const now = new Date();
  const date = new Date(dateIso);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s atrás`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d atrás`;
}

function calcPNL(p: Position) {
  // PNL = Liq. Atual + Coletado - Investido
  return (p.current + p.collected - p.invested).toFixed(2);
}

function calcAPR(p: Position) {
  // APR diário, mensal e anual (juros simples)
  const invested = p.invested;
  if (!invested || invested === 0) return { daily: '-', monthly: '-', annual: '-' };
  const pnl = p.current + p.collected - invested;
  const days = Math.max(1, (new Date().getTime() - new Date(p.created).getTime()) / (1000 * 60 * 60 * 24));
  const dailyRate = (pnl / invested) / days;
  const aprDaily = (dailyRate * 100).toFixed(2) + '%';
  const aprMonthly = (dailyRate * 30 * 100).toFixed(2) + '%';
  const aprAnnual = (dailyRate * 365 * 100).toFixed(2) + '%';
  return { daily: aprDaily, monthly: aprMonthly, annual: aprAnnual };
}

type Props = {
  positions: Position[];
  onRemove: (idx: number) => void;
  onClosePosition?: (idx: number) => void;
  onDuplicate?: (idx: number) => void;
  onEdit?: (idx: number) => void;
  closed?: boolean;
  onRestore?: (idx: number) => void;
};

export function PositionsTable({ positions, onRemove, onClosePosition, onDuplicate, onEdit, closed, onRestore }: Props) {
  return (
    <div className="bg-[#18181b] rounded-xl p-6 w-full mt-4">

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-[#a1a1aa]">
          <thead>
            <tr className="border-b border-[#232328]">
              <th className="py-3 px-2 font-semibold text-left text-base">Pool</th>
              <th className="py-3 px-2 font-semibold text-left text-base">Investido</th>
              <th className="py-3 px-2 font-semibold text-left text-base">Liq. Atual</th>
              <th className="py-3 px-2 font-semibold text-left text-base">Não Coletado</th>
              <th className="py-3 px-2 font-semibold text-left text-base">Coletado</th>
              <th className="py-3 px-2 font-semibold text-left text-base">PNL</th>
              <th className="py-3 px-2 font-semibold text-left text-base">APR (D/M/A)</th>
              <th className="py-3 px-2 font-semibold text-left text-base">Range</th>
              <th className="py-3 px-2 font-semibold text-left text-base">Criado</th>
              <th className="py-3 px-2 font-semibold text-left text-base">Ações</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-[#71717a]">
                  Nenhuma posição aberta encontrada. Adicione uma posição manualmente usando o botão "Adicionar Posição".
                </td>
              </tr>
            ) : (
              positions.map((p, idx) => (
                <tr key={idx} className="border-b border-[#232328]">
                  <td className="py-2 px-2">
                    <div className="font-semibold text-white">{p.pool}</div>
                    <div className="text-[10px] text-[#a1a1aa]">{p.network} • {p.dex}</div>
                  </td>
                  <td className="py-2 px-2">${p.invested.toFixed(2)}</td>
                  <td className="py-2 px-2">${p.current.toFixed(2)}</td>
                  <td className="py-2 px-2">${p.uncollected.toFixed(2)}</td>
                  <td className="py-2 px-2">${p.collected.toFixed(2)}</td>
                  <td className="py-2 px-2">${calcPNL(p)}</td>
                  <td className="py-2 px-2 whitespace-nowrap">
  {(() => {
    const apr = calcAPR(p);
    return (
      <div className="flex flex-col text-xs">
        <span><b>D:</b> {apr.daily}</span>
        <span><b>M:</b> {apr.monthly}</span>
        <span><b>A:</b> {apr.annual}</span>
      </div>
    );
  })()}
</td>

                  <td className="py-2 px-2">
                    {p.rangeMin} - {p.rangeMax}
                    {p.entryPrice !== undefined && p.entryPrice !== 0 && (
                      <div className="text-[10px] text-[#a1a1aa]">Entrada: ${p.entryPrice}</div>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <div>{new Date(p.created).toLocaleString()}</div>
                    <div className="text-[10px] text-[#a1a1aa]">{formatAgo(p.created)}</div>
                  </td>
                  <td className="py-2 px-2 flex gap-2">
                    {!closed && (
                      <>
                        <button title="Editar" className="p-1 hover:bg-[#232328] rounded" onClick={() => onEdit && onEdit(idx)}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300"><path d="M15.586 2.586a2 2 0 0 1 2.828 2.828l-10 10A2 2 0 0 1 6 16H4a1 1 0 0 1-1-1v-2a2 2 0 0 1 .586-1.414l10-10z" /></svg>
                        </button>
                        <button title="Duplicar" className="p-1 hover:bg-[#232328] rounded" onClick={() => onDuplicate && onDuplicate(idx)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5v-2.25A2.25 2.25 0 0 1 9.75 3h7.5A2.25 2.25 0 0 1 19.5 5.25v7.5a2.25 2.25 0 0 1-2.25 2.25H15M3 9.75A2.25 2.25 0 0 1 5.25 7.5h7.5A2.25 2.25 0 0 1 15 9.75v7.5A2.25 2.25 0 0 1 12.75 19.5h-7.5A2.25 2.25 0 0 1 3 17.25v-7.5z" /></svg>
                        </button>
                        <button title="Fechar posição" onClick={() => onClosePosition && onClosePosition(idx)} className="p-1 hover:bg-[#232328] rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v1.5M3 7.5h18M3 7.5v10.125A2.625 2.625 0 0 0 5.625 20.25h12.75A2.625 2.625 0 0 0 21 17.625V7.5M9.75 10.5h4.5" />
                          </svg>
                        </button>
                      </>
                    )}
                    {closed && typeof onRestore === 'function' && (
                      <button title="Restaurar" onClick={() => onRestore(idx)} className="p-1 hover:bg-[#232328] rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10v6a2 2 0 0 0 2 2h6m-8-8 8-8m0 0v6a2 2 0 0 0 2 2h6m-8-8 8 8" /></svg>
                      </button>
                    )}
                    <button title="Excluir" onClick={() => onRemove(idx)} className="p-1 hover:bg-[#232328] rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
