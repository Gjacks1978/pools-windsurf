"use client";
import { useState } from "react";
import { DashboardCards } from "../components/DashboardCards";
import { PositionsTable } from "../components/PositionsTable";
import { TrackByAddress } from "../components/TrackByAddress";
import { AddPositionModal, Position } from "../components/AddPositionModal";

export default function Home() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [closedPositions, setClosedPositions] = useState<Position[]>([]);
  const [tab, setTab] = useState<'open'|'closed'>('open');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number|null>(null);
  const [editInitial, setEditInitial] = useState<Position|null>(null);

  function handleAddPosition(position: Position) {
    if (editingIdx !== null) {
      setPositions((prev) => prev.map((p, i) => i === editingIdx ? position : p));
      setEditingIdx(null);
      setEditInitial(null);
    } else {
      setPositions((prev) => [...prev, position]);
    }
  }

  function handleRemove(idx: number) {
    setPositions((prev) => prev.filter((_, i) => i !== idx));
  }
  function handleClosePosition(idx: number) {
    setPositions((prevPositions) => {
      const pos = prevPositions[idx];
      setClosedPositions((prevClosed) => {
        if (prevClosed.some(p => p.created === pos.created)) return prevClosed;
        return [pos, ...prevClosed];
      });
      return prevPositions.filter((_, i) => i !== idx);
    });
  }
  function handleDuplicate(idx: number) {
    setPositions((prev) => {
      const pos = prev[idx];
      return [...prev, { ...pos, created: new Date().toISOString() }];
    });
  }
  function handleEdit(idx: number) {
    setEditingIdx(idx);
    setEditInitial(positions[idx]);
    setModalOpen(true);
  }

  function handleRemoveClosed(idx: number) {
    setClosedPositions((prev) => prev.filter((_, i) => i !== idx));
  }

  // Cálculos das pools fechadas
  const pnlTotalFechadas = closedPositions.reduce((acc, p) => acc + (p.current + p.collected + p.uncollected - p.invested), 0);
  let pnlBg = 'bg-[#18181b]';
  if (pnlTotalFechadas > 0) pnlBg = 'bg-[#071f14]';
  if (pnlTotalFechadas < 0) pnlBg = 'bg-[#1f0d07]';

  return (
    <div className="min-h-screen bg-[#09090b] p-6 md:p-10 flex flex-col gap-8 items-center text-base md:text-lg">
      <div className="w-full max-w-7xl mb-4">
        <div className="font-bold text-white text-3xl md:text-4xl mb-4">Dashboard de Pools de Liquidez</div>
        <DashboardCards positions={positions} />
      </div>
      <div className="w-full max-w-7xl mt-8">
        <div className="flex items-center justify-end mb-2">
          <button className="px-3 py-1 rounded bg-white text-sm text-black font-semibold" onClick={() => setModalOpen(true)}>+ Adicionar Posição</button>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('open')} className={`px-4 py-1 rounded ${tab==='open' ? 'bg-[#232328] text-white' : 'bg-transparent text-[#a1a1aa]'} text-sm font-semibold`}>Posições abertas ({positions.length})</button>
          <button onClick={() => setTab('closed')} className={`px-4 py-1 rounded ${tab==='closed' ? 'bg-[#232328] text-white' : 'bg-transparent text-[#a1a1aa]'} text-sm font-semibold`}>Posições fechadas ({closedPositions.length})</button>
        </div>
        {tab === 'closed' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-6">
            {/* Ganhos Totais */}
            <div className="bg-[#18181b] rounded-xl p-4 flex flex-col gap-1 border border-[#232328] min-w-[160px]">
              <span className="text-xs text-[#a1a1aa] font-medium">Taxas Totais</span>
              <span className="text-2xl font-semibold text-white">{closedPositions.reduce((acc, p) => acc + p.collected + p.uncollected, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'USD' }).replace('US$', '$')}</span>
              <span className="text-xs text-[#71717a]">Taxas combinadas de todas as pools fechadas</span>
            </div>
            {/* P&L Total */}
            <div className={`${pnlBg} rounded-xl p-4 flex flex-col gap-1 border border-[#232328] min-w-[160px]`}>
              <span className="text-xs text-[#a1a1aa] font-medium">P&L Total</span>
              <span className="text-2xl font-semibold text-white">{pnlTotalFechadas.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' }).replace('US$', '$')}</span>
              <span className="text-xs text-[#71717a]">Lucro/perda combinado de todas as pools fechadas</span>
            </div>
            {/* APR Anual Total % */}
            <div className="bg-[#18181b] rounded-xl p-4 flex flex-col gap-1 border border-[#232328] min-w-[160px]">
              <span className="text-xs text-[#a1a1aa] font-medium">APR Anual Total %</span>
              <span className="text-2xl font-semibold text-white">
                {(() => {
                  let totalInvestido = 0;
                  let totalPNL = 0;
                  let totalDias = 0;
                  closedPositions.forEach((p) => {
                    const dias = Math.max(1, (new Date().getTime() - new Date(p.created).getTime()) / (1000 * 60 * 60 * 24));
                    const invested = p.invested;
                    if (invested > 0) {
                      const pnl = p.current + p.collected + p.uncollected - invested;
                      totalPNL += pnl;
                      totalInvestido += invested;
                      totalDias += dias * invested;
                    }
                  });
                  const diasMedio = totalInvestido > 0 ? totalDias / totalInvestido : 1;
                  let aprAnual = 0;
                  if (totalInvestido > 0) {
                    const dailyRate = totalPNL / totalInvestido / diasMedio;
                    aprAnual = dailyRate * 365 * 100;
                  }
                  return totalInvestido > 0 ? aprAnual.toFixed(2) + '%' : '-';
                })()}
              </span>
              <span className="text-xs text-[#71717a]">APR anual médio ponderado das pools fechadas</span>
            </div>
          </div>
        )}
        {tab === 'open' ? (
          <PositionsTable positions={positions} onRemove={handleRemove} onClosePosition={handleClosePosition} onDuplicate={handleDuplicate} onEdit={handleEdit} closed={false} />
        ) : (
          <PositionsTable positions={closedPositions} onRemove={handleRemoveClosed} closed={true} onRestore={(idx) => {
            setPositions((prev) => [closedPositions[idx], ...prev]);
            setClosedPositions((prev) => prev.filter((_, i) => i !== idx));
          }} />
        )}
      </div>
      <AddPositionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingIdx(null); setEditInitial(null); }}
        onAdd={handleAddPosition}
        initialData={editInitial}
      />
      <div className="w-full max-w-7xl">
        <TrackByAddress />
      </div>
    </div>
  );
}
