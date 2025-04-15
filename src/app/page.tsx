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

  return (
    <div className="min-h-screen bg-[#09090b] p-6 md:p-10 flex flex-col gap-8 items-center text-base md:text-lg">
      <div className="w-full max-w-7xl">
        <DashboardCards />
      </div>
      <section className="w-full max-w-7xl mt-8">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-white text-3xl md:text-4xl mb-4">Dashboard de Pools de Liquidez</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-[#232328] text-sm text-[#a1a1aa] border border-[#232328]">Ocultar</button>
            <button className="px-3 py-1 rounded bg-white text-sm text-black font-semibold" onClick={() => setModalOpen(true)}>+ Adicionar Posição</button>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('open')} className={`px-4 py-1 rounded ${tab==='open' ? 'bg-[#232328] text-white' : 'bg-transparent text-[#a1a1aa]'} text-sm font-semibold`}>Posições abertas ({positions.length})</button>
          <button onClick={() => setTab('closed')} className={`px-4 py-1 rounded ${tab==='closed' ? 'bg-[#232328] text-white' : 'bg-transparent text-[#a1a1aa]'} text-sm font-semibold`}>Posições fechadas ({closedPositions.length})</button>
        </div>
        {tab === 'open' ? (
          <PositionsTable positions={positions} onRemove={handleRemove} onClosePosition={handleClosePosition} onDuplicate={handleDuplicate} onEdit={handleEdit} closed={false} />
        ) : (
          <PositionsTable positions={closedPositions} onRemove={handleRemoveClosed} closed={true} onRestore={(idx) => {
            setPositions((prev) => [closedPositions[idx], ...prev]);
            setClosedPositions((prev) => prev.filter((_, i) => i !== idx));
          }} />
        )}
        <AddPositionModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingIdx(null); setEditInitial(null); }}
          onAdd={handleAddPosition}
          initialData={editInitial}
        />
      </section>
      <div className="w-full max-w-7xl">
        <TrackByAddress />
      </div>
    </div>
  );
}
