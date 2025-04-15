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
  // APR anualizado simplificado: (PNL / Investido) * (365 / dias) * 100
  const invested = p.invested;
  if (!invested || invested === 0) return "-";
  const pnl = p.current + p.collected - invested;
  const days = Math.max(1, (new Date().getTime() - new Date(p.created).getTime()) / (1000 * 60 * 60 * 24));
  const apr = (pnl / invested) * (365 / days) * 100;
  return apr.toFixed(2) + "%";
}

type Props = {
  positions: Position[];
  onRemove: (idx: number) => void;
  onClosePosition?: (idx: number) => void;
  onDuplicate?: (idx: number) => void;
  onEdit?: (idx: number) => void;
  closed?: boolean;
};

export function PositionsTable({ positions, onRemove, onClosePosition, onDuplicate, onEdit, closed }: Props) {
  return (
    <div className="bg-[#18181b] rounded-xl p-6 w-full mt-4">
      <div className="flex gap-2 mb-4">
        <button className="px-4 py-1 rounded bg-[#232328] text-white text-xs font-semibold">Posições abertas ({positions.length})</button>
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

              <th className="py-2 px-2 font-semibold text-left">Range</th>
              <th className="py-2 px-2 font-semibold text-left">Criado</th>
              <th className="py-2 px-2 font-semibold text-left">Ações</th>
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
                  <td className="py-2 px-2">{calcAPR(p)}</td>

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
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-400"><path d="M15.586 2.586a2 2 0 0 1 2.828 2.828l-10 10A2 2 0 0 1 6 16H4a1 1 0 0 1-1-1v-2a2 2 0 0 1 .586-1.414l10-10z" /></svg>
                        </button>
                        <button title="Duplicar" className="p-1 hover:bg-[#232328] rounded" onClick={() => onDuplicate && onDuplicate(idx)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-yellow-400"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5v-2.25A2.25 2.25 0 0 1 9.75 3h7.5A2.25 2.25 0 0 1 19.5 5.25v7.5a2.25 2.25 0 0 1-2.25 2.25H15M3 9.75A2.25 2.25 0 0 1 5.25 7.5h7.5A2.25 2.25 0 0 1 15 9.75v7.5A2.25 2.25 0 0 1 12.75 19.5h-7.5A2.25 2.25 0 0 1 3 17.25v-7.5z" /></svg>
                        </button>
                        <button title="Fechar posição" onClick={() => onClosePosition && onClosePosition(idx)} className="p-1 hover:bg-[#232328] rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </>
                    )}
                    <button title="Excluir" onClick={() => onRemove(idx)} className="p-1 hover:bg-[#232328] rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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
