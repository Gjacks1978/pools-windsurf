import React, { useState } from "react";
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
  // PNL = Liq. Atual + Coletado + Não Coletado - Investido
  return (p.current + p.collected + p.uncollected - p.invested).toFixed(2);
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
  // Estado para edição inline
  const [editingCell, setEditingCell] = useState<{row: number, field: 'uncollected' | 'collected', value: number} | null>(null);

  // Função para salvar edição inline
  function handleInlineSave(idx: number, field: 'uncollected' | 'collected', value: number) {
    if (isNaN(value)) return;
    // Atualize diretamente o valor localmente (sem abrir modal)
    if (positions[idx]) {
      positions[idx][field] = value;
    }
    setEditingCell(null);
  }

  return (
    <div className="bg-[#18181b] rounded-xl p-6 w-full mt-4">

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-[#a1a1aa]">
          <thead>
            <tr className="border-b border-[#232328] text-center">
              <th className="py-3 px-2 font-semibold text-center text-base">Pool</th>
              <th className="py-3 px-2 font-semibold text-center text-base">Investido</th>
              <th className="py-3 px-2 font-semibold text-center text-base">Liq. Atual</th>
              <th className="py-3 px-2 font-semibold text-center text-base">Não Coletado</th>
              <th className="py-3 px-2 font-semibold text-center text-base">Coletado</th>
              <th className="py-3 px-2 font-semibold text-center text-base">PNL</th>
              <th className="py-3 px-2 font-semibold text-center text-base">APR (D/M/A)</th>
              <th className="py-3 px-2 font-semibold text-center text-base">Range</th>
              <th className="py-3 px-2 font-semibold text-center text-base">Criado</th>
              <th className="py-3 px-2 font-semibold text-center text-base">Ações</th>
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
                <tr key={idx} className="border-b border-[#232328] text-center">
                  <td className="py-2 px-2 text-center">
                    <div className="font-semibold text-white">{p.pool}</div>
                    <div className="text-[10px] text-[#a1a1aa]">{p.network} • {p.dex}</div>
                  </td>
                  <td className="py-2 px-2 text-center text-base text-white font-normal">${p.invested.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center text-base text-white font-normal">${p.current.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center text-base text-white font-normal cursor-pointer" onClick={() => setEditingCell({ row: idx, field: 'uncollected', value: p.uncollected })}>
  {editingCell && editingCell.row === idx && editingCell.field === 'uncollected' ? (
    <input
      type="number"
      className="bg-[#232328] text-white rounded px-1 py-0.5 w-20 text-center outline-none border border-[#4b206e] focus:ring-2 focus:ring-[#4b206e]"
      value={editingCell.value}
      autoFocus
      onChange={e => setEditingCell({ ...editingCell, value: Number(e.target.value) })}
      onBlur={() => handleInlineSave(idx, 'uncollected', editingCell.value)}
      onKeyDown={e => { if (e.key === 'Enter') handleInlineSave(idx, 'uncollected', editingCell.value); }}
    />
  ) : (
    `$${p.uncollected.toFixed(2)}`
  )}
</td>
<td className="py-2 px-2 text-center text-base text-white font-normal cursor-pointer" onClick={() => setEditingCell({ row: idx, field: 'collected', value: p.collected })}>
  {editingCell && editingCell.row === idx && editingCell.field === 'collected' ? (
    <input
      type="number"
      className="bg-[#232328] text-white rounded px-1 py-0.5 w-20 text-center outline-none border border-[#4b206e] focus:ring-2 focus:ring-[#4b206e]"
      value={editingCell.value}
      autoFocus
      onChange={e => setEditingCell({ ...editingCell, value: Number(e.target.value) })}
      onBlur={() => handleInlineSave(idx, 'collected', editingCell.value)}
      onKeyDown={e => { if (e.key === 'Enter') handleInlineSave(idx, 'collected', editingCell.value); }}
    />
  ) : (
    `$${p.collected.toFixed(2)}`
  )}
</td>
                  <td className={`py-2 px-2 text-center text-base font-normal ${Number(calcPNL(p)) >= 0 ? 'text-green-400' : 'text-red-400'}`}><span className="text-xs align-top mr-0.5 text-[#a1a1aa]">$</span><span>{calcPNL(p)}</span></td>
                  <td className="py-2 px-2 text-center whitespace-nowrap">
  {(() => {
    const apr = calcAPR(p);
    return (
      <div className="flex flex-col text-xs text-base text-white font-normal">
        <span><b>D:</b> {apr.daily}</span>
        <span><b>M:</b> {apr.monthly}</span>
        <span><b>A:</b> {apr.annual}</span>
      </div>
    );
  })()}
</td>

                  <td className="py-2 px-2 text-center">
                    <div className="flex flex-col items-center w-full min-w-[120px]">
                      <div className="flex w-full items-center justify-between text-xs text-[#a1a1aa] mb-1">
                        <span>{p.rangeMin ?? '-'}</span>
                        <span>{p.rangeMax ?? '-'}</span>
                      </div>
                      <div className="relative w-full h-3 flex items-center justify-center group cursor-pointer">
  {/* Barra horizontal */}
  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#4b206e] rounded" />
  {/* Barrinha do entryPrice */}
  {typeof p.rangeMin === 'number' && typeof p.rangeMax === 'number' && typeof p.entryPrice === 'number' && p.rangeMax > p.rangeMin && p.entryPrice >= p.rangeMin && p.entryPrice <= p.rangeMax && (
    <div
      className="absolute top-0 bottom-0 w-1 bg-white rounded"
      style={{
        left: `calc(${((p.entryPrice - p.rangeMin) / (p.rangeMax - p.rangeMin)) * 100}% - 2px)`
      }}
    />
  )}
  {/* Tooltip flutuante */}
  {typeof p.rangeMin === 'number' && typeof p.rangeMax === 'number' && p.rangeMax > p.rangeMin && (
    <div className="absolute z-10 left-1/2 -translate-x-1/2 bottom-6 hidden group-hover:flex flex-col items-center">
      <div className="bg-[#2a003f] text-white rounded-lg shadow-lg px-4 py-2 text-xs whitespace-nowrap border border-[#4b206e]">
        <div><b>Amplitude:</b> {(((p.rangeMax - p.rangeMin) / p.rangeMin) * 100).toFixed(2)}%</div>
        <div><b>Mín:</b> {p.rangeMin}</div>
        <div><b>Máx:</b> {p.rangeMax}</div>
        {typeof p.entryPrice === 'number' && (
          <div><b>Entrada:</b> {p.entryPrice}</div>
        )}
      </div>
    </div>
  )}
</div>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <div>{new Date(p.created).toLocaleString()}</div>
                    <div className="text-[10px] text-[#a1a1aa]">{formatAgo(p.created)}</div>
                  </td>
                  <td className="py-2 px-2 flex gap-2 justify-center items-center">
                    {!closed && (
                      <>
                        <button title="Editar" className="p-1 hover:bg-[#232328] rounded" onClick={() => onEdit && onEdit(idx)}>
  {/* Heroicons Pencil Square outline */}
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.212l-4.182.465a.75.75 0 0 1-.83-.829l.465-4.182L16.862 3.487zm0 0L19.5 6.125" />
  </svg>
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
