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

  function handleAddPosition(position: Position) {
    setPositions((prev) => [...prev, position]);
  }

  function handleRemove(idx: number) {
    setPositions((prev) => prev.filter((_, i) => i !== idx));
  }
  function handleClosePosition(idx: number) {
    setPositions((prev) => {
      const pos = prev[idx];
      setClosedPositions((closed) => [pos, ...closed]);
      return prev.filter((_, i) => i !== idx);
    });
  }
  function handleDuplicate(idx: number) {
    setPositions((prev) => {
      const pos = prev[idx];
      return [...prev, { ...pos, created: new Date().toISOString() }];
    });
  }
  function handleEdit(idx: number) {
    // Placeholder para edição futura
    alert('Função de edição em breve!');
  }

  return (
    <div className="min-h-screen bg-[#09090b] p-6 md:p-10 flex flex-col gap-8 items-center">
      <div className="w-full max-w-7xl">
        <DashboardCards />
      </div>

      <section className="w-full max-w-7xl mt-8">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-white text-lg">Posições Manuais</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-[#232328] text-xs text-[#a1a1aa] border border-[#232328]">Ocultar</button>
            <button className="px-3 py-1 rounded bg-white text-xs text-black font-semibold" onClick={() => setModalOpen(true)}>+ Adicionar Posição</button>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('open')} className={`px-4 py-1 rounded ${tab==='open' ? 'bg-[#232328] text-white' : 'bg-transparent text-[#a1a1aa]'} text-xs font-semibold`}>Posições abertas ({positions.length})</button>
        <button onClick={() => setTab('closed')} className={`px-4 py-1 rounded ${tab==='closed' ? 'bg-[#232328] text-white' : 'bg-transparent text-[#a1a1aa]'} text-xs font-semibold`}>Posições fechadas ({closedPositions.length})</button>
      </div>
      {tab === 'open' ? (
        <PositionsTable positions={positions} onRemove={handleRemove} onClosePosition={handleClosePosition} onDuplicate={handleDuplicate} onEdit={handleEdit} />
      ) : (
        <PositionsTable positions={closedPositions} onRemove={()=>{}} closed />
      )}
      </section>

      <div className="w-full max-w-7xl">
        <TrackByAddress />
      </div>

      <AddPositionModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAddPosition} />
    </div>
  );
}
