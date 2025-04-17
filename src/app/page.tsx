"use client";
import React, { useState, useEffect } from "react";
import { DashboardCards } from "../components/DashboardCards";
import { PositionsTable } from "../components/PositionsTable";
import { TrackByAddress } from "../components/TrackByAddress";
import { AddPositionModal, Position } from "../components/AddPositionModal";
import { useAuth } from "../contexts/AuthContext";
import AuthForm from "../components/AuthForm";
import LogoutButton from "../components/LogoutButton";

export default function Home() {
  const { user, loading } = useAuth();

  const [showSaved, setShowSaved] = useState(false);
  const [importError, setImportError] = useState<string|null>(null);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // Exporta dados como JSON
  function handleExport() {
    const data = {
      positions,
      closedPositions
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pools-dashboard-backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Importa dados de arquivo JSON
  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (!data.positions || !data.closedPositions) throw new Error('Arquivo inválido');
        setPositions(data.positions);
        setClosedPositions(data.closedPositions);
        setImportError(null);
      } catch {
        setImportError('Arquivo inválido ou corrompido');
      }
    };
    reader.readAsText(file);
    // Limpa input para permitir importar o mesmo arquivo novamente se necessário
    e.target.value = '';
  }
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

  useEffect(() => {
    const savedPositions = localStorage.getItem('positions');
    const savedClosedPositions = localStorage.getItem('closedPositions');
    if (savedPositions) {
      try {
        setPositions(JSON.parse(savedPositions));
      } catch {
        console.error("Failed to parse positions from localStorage");
        // Optionally clear corrupted data
        // localStorage.removeItem('positions');
      }
    }
    if (savedClosedPositions) {
       try {
        setClosedPositions(JSON.parse(savedClosedPositions));
      } catch {
        console.error("Failed to parse closedPositions from localStorage");
        // Optionally clear corrupted data
        // localStorage.removeItem('closedPositions');
      }
    }
    setIsClientLoaded(true); // Mark client as loaded after attempting to load
  }, []); // Run only once on mount

  useEffect(() => {
    if (isClientLoaded) { // Only save after initial client load is complete
      localStorage.setItem('positions', JSON.stringify(positions));
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1200);
    }
  }, [positions, isClientLoaded]); // Re-run if positions or isClientLoaded changes

  useEffect(() => {
    if (isClientLoaded) { // Only save after initial client load is complete
      localStorage.setItem('closedPositions', JSON.stringify(closedPositions));
    }
  }, [closedPositions, isClientLoaded]); // Re-run if closedPositions or isClientLoaded changes

  // Cálculos das pools fechadas
  const pnlTotalFechadas = closedPositions.reduce((acc, p) => acc + (p.current + p.collected + p.uncollected - p.invested), 0);
  let pnlBg = 'bg-[#18181b]';
  if (pnlTotalFechadas > 0) pnlBg = 'bg-[#071f14]';
  if (pnlTotalFechadas < 0) pnlBg = 'bg-[#1f0d07]';

  if (!isClientLoaded) {
    // Render a loading state or null during SSR/initial hydration
    // You can replace null with a loading spinner component if desired
    return null;
  }

  // Authentication Check
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex justify-center items-center text-white">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex justify-center items-center">
        <AuthForm />
      </div>
    );
  }

  // Render dashboard only if user is logged in
  return (
    <div className="min-h-screen bg-[#09090b] p-6 md:p-10 flex flex-col gap-8 items-center text-base md:text-lg">
      {/* Aviso de dados salvos */}
      {showSaved && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-xl shadow-lg z-50 animate-fade-in-out">
          Dados salvos!
        </div>
      )}
      {/* Aviso de erro de importação */}
      {importError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-red-700 text-white px-6 py-2 rounded-xl shadow-lg z-50 animate-fade-in-out">
          {importError}
        </div>
      )}
      {/* Botões de exportação/importação */}
      <div className="w-full max-w-7xl flex justify-end gap-2 mb-2">
        <button onClick={handleExport} className="px-3 py-1 rounded bg-[#232328] text-white text-xs font-semibold border border-[#39393f] hover:bg-[#39393f]">Exportar Backup</button>
        <label className="px-3 py-1 rounded bg-[#232328] text-white text-xs font-semibold border border-[#39393f] hover:bg-[#39393f] cursor-pointer">
          Importar Backup
          <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </label>
      </div>
      <div className="w-full max-w-7xl mb-4">
        {/* Title and Logout Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-white text-3xl md:text-4xl">Dashboard de Pools de Liquidez</div>
          <LogoutButton />
        </div>
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
