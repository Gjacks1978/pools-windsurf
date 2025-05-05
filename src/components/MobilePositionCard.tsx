import React from "react";
import { Position } from "./AddPositionModal";
import { Tooltip } from "./Tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

type MobilePositionCardProps = {
  position: Position;
  index: number;
  closed?: boolean;
  onRemove: (idx: number) => void;
  onClosePosition?: (idx: number) => void;
  onDuplicate?: (idx: number) => void;
  onEdit?: (idx: number) => void;
  onRestore?: (idx: number) => void;
  editingCell: {row: number, field: 'uncollected' | 'collected' | 'current', value: number} | null;
  setEditingCell: React.Dispatch<React.SetStateAction<{row: number, field: 'uncollected' | 'collected' | 'current', value: number} | null>>;
  handleInlineSave: (idx: number, field: 'uncollected' | 'collected' | 'current', value: number) => void;
  calcPNL: (p: Position) => string;
  calcAPR: (p: Position) => { daily: string; monthly: string; annual: string; };
  formatAgo: (dateIso: string, isClosed?: boolean) => string;
  tooltips: Record<string, React.ReactNode>;
};

export function MobilePositionCard({
  position: p,
  index: idx,
  closed = false,
  onRemove,
  onClosePosition,
  onDuplicate,
  onEdit,
  onRestore,
  editingCell,
  setEditingCell,
  handleInlineSave,
  calcPNL,
  calcAPR,
  formatAgo,
  tooltips
}: MobilePositionCardProps) {
  return (
    <div className="bg-[#232328] rounded-lg p-4 border border-[#4b206e] shadow-sm">
      {/* Cabeçalho do card */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <div className="font-semibold text-white text-base">{p.pool}</div>
          <div className="flex items-center">
            {p.isSimulated && (
              <span className="mr-1 text-amber-400 text-xs font-bold">[SIMULADO]</span>
            )}
            <div className="text-[10px] text-[#a1a1aa]">
              {p.network} • {p.dex}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          {!closed && !('isTracked' in p) && (
            <>
              <button title="Editar" className="p-1 hover:bg-[#2a2a30] rounded" onClick={() => onEdit && onEdit(idx)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.212l-4.182.465a.75.75 0 0 1-.83-.829l.465-4.182L16.862 3.487zm0 0L19.5 6.125" /></svg>
              </button>
              <button title="Fechar posição" onClick={() => onClosePosition && onClosePosition(idx)} className="p-1 hover:bg-[#2a2a30] rounded">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v1.5M3 7.5h18M3 7.5v10.125A2.625 2.625 0 0 0 5.625 20.25h12.75A2.625 2.625 0 0 0 21 17.625V7.5M9.75 10.5h4.5" /></svg>
              </button>
            </>
          )}
          {closed && typeof onRestore === 'function' && (
            <button title="Restaurar" onClick={() => onRestore(idx)} className="p-1 hover:bg-[#2a2a30] rounded">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10v6a2 2 0 0 0 2 2h6m-8-8 8-8m0 0v6a2 2 0 0 0 2 2h6m-8-8 8 8" /></svg>
            </button>
          )}
          {p.poolUrl && (
            <a 
              href={p.poolUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Abrir link da pool" 
              className="p-1 hover:bg-[#2a2a30] rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}
          <button title="Excluir" onClick={() => onRemove(idx)} className="p-1 hover:bg-[#2a2a30] rounded">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      
      {/* Grid de informações */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Investido */}
        <div className="bg-[#2a2a30] p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[#a1a1aa]">Investido</span>
            <Tooltip content={tooltips['Investido']} position="top">
              <InformationCircleIcon className="h-3 w-3 text-[#71717a]" />
            </Tooltip>
          </div>
          <div className="text-white font-medium">${p.invested.toFixed(2)}</div>
        </div>
        
        {/* Liq. Atual */}
        <div className="bg-[#2a2a30] p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[#a1a1aa]">Liq. Atual</span>
            <Tooltip content={tooltips['Liq. Atual']} position="top">
              <InformationCircleIcon className="h-3 w-3 text-[#71717a]" />
            </Tooltip>
          </div>
          <div className="text-white font-medium cursor-pointer" onClick={() => setEditingCell({ row: idx, field: 'current', value: p.current })}>
            {editingCell && editingCell.row === idx && editingCell.field === 'current' ? (
              <input
                type="number"
                className="bg-[#232328] text-white rounded px-1 py-0.5 w-full text-center outline-none border border-[#4b206e] focus:ring-2 focus:ring-[#4b206e]"
                value={editingCell.value}
                autoFocus
                onChange={e => setEditingCell({ ...editingCell, value: Number(e.target.value) })}
                onBlur={() => handleInlineSave(idx, 'current', editingCell.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleInlineSave(idx, 'current', editingCell.value); }}
              />
            ) : (
              `$${p.current.toFixed(2)}`
            )}
          </div>
        </div>
        
        {/* Não Coletado */}
        <div className="bg-[#2a2a30] p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[#a1a1aa]">Não Coletado</span>
            <Tooltip content={tooltips['Não Coletado']} position="top">
              <InformationCircleIcon className="h-3 w-3 text-[#71717a]" />
            </Tooltip>
          </div>
          <div className="text-white font-medium cursor-pointer" onClick={() => setEditingCell({ row: idx, field: 'uncollected', value: p.uncollected })}>
            {editingCell && editingCell.row === idx && editingCell.field === 'uncollected' ? (
              <input
                type="number"
                className="bg-[#232328] text-white rounded px-1 py-0.5 w-full text-center outline-none border border-[#4b206e] focus:ring-2 focus:ring-[#4b206e]"
                value={editingCell.value}
                autoFocus
                onChange={e => setEditingCell({ ...editingCell, value: Number(e.target.value) })}
                onBlur={() => handleInlineSave(idx, 'uncollected', editingCell.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleInlineSave(idx, 'uncollected', editingCell.value); }}
              />
            ) : (
              `$${p.uncollected.toFixed(2)}`
            )}
          </div>
        </div>
        
        {/* Coletado */}
        <div className="bg-[#2a2a30] p-2 rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[#a1a1aa]">Coletado</span>
            <Tooltip content={tooltips['Coletado']} position="top">
              <InformationCircleIcon className="h-3 w-3 text-[#71717a]" />
            </Tooltip>
          </div>
          <div className="text-white font-medium cursor-pointer" onClick={() => setEditingCell({ row: idx, field: 'collected', value: p.collected })}>
            {editingCell && editingCell.row === idx && editingCell.field === 'collected' ? (
              <input
                type="number"
                className="bg-[#232328] text-white rounded px-1 py-0.5 w-full text-center outline-none border border-[#4b206e] focus:ring-2 focus:ring-[#4b206e]"
                value={editingCell.value}
                autoFocus
                onChange={e => setEditingCell({ ...editingCell, value: Number(e.target.value) })}
                onBlur={() => handleInlineSave(idx, 'collected', editingCell.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleInlineSave(idx, 'collected', editingCell.value); }}
              />
            ) : (
              `$${p.collected.toFixed(2)}`
            )}
          </div>
        </div>
      </div>
      
      {/* Linha de PNL */}
      <div className="flex justify-between items-center mb-3 bg-[#2a2a30] p-2 rounded">
        <div className="flex items-center">
          <span className="text-xs text-[#a1a1aa] mr-2">PNL</span>
          <Tooltip content={tooltips['PNL']} position="top">
            <InformationCircleIcon className="h-3 w-3 text-[#71717a]" />
          </Tooltip>
        </div>
        <div className={`font-medium ${Number(calcPNL(p)) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          <span className="text-xs align-top mr-0.5 text-[#a1a1aa]">$</span>
          <span>{calcPNL(p)}</span>
        </div>
      </div>
      
      {/* Linha de APR */}
      <div className="flex justify-between items-center mb-3 bg-[#2a2a30] p-2 rounded">
        <div className="flex items-center">
          <span className="text-xs text-[#a1a1aa] mr-2">APR</span>
          <Tooltip content={tooltips['APR']} position="top">
            <InformationCircleIcon className="h-3 w-3 text-[#71717a]" />
          </Tooltip>
        </div>
        <div className="text-white text-right">
          {(() => {
            const apr = calcAPR(p);
            return (
              <div className="flex flex-col text-xs font-normal">
                <span><b>D:</b> {apr.daily}</span>
                <span><b>M:</b> {apr.monthly}</span>
                <span><b>A:</b> {apr.annual}</span>
              </div>
            );
          })()}
        </div>
      </div>
      
      {/* Linha de Range */}
      <div className="bg-[#2a2a30] p-2 rounded mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[#a1a1aa]">Range</span>
          <Tooltip content={tooltips['Range']} position="top">
            <InformationCircleIcon className="h-3 w-3 text-[#71717a]" />
          </Tooltip>
        </div>
        <div className="flex flex-col items-center w-full">
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
            {/* Barrinha do preço atual (para posições rastreadas) */}
            {typeof p.rangeMin === 'number' && typeof p.rangeMax === 'number' && typeof p.currentPrice === 'number' && p.rangeMax > p.rangeMin && p.currentPrice >= p.rangeMin && p.currentPrice <= p.rangeMax && ('isTracked' in p) && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-green-400 rounded"
                style={{
                  left: `calc(${((p.currentPrice - p.rangeMin) / (p.rangeMax - p.rangeMin)) * 100}% - 2px)`
                }}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Linha de Data */}
      <div className="bg-[#2a2a30] p-2 rounded">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[#a1a1aa]">Criado</span>
          <Tooltip content={tooltips['Criado']} position="top">
            <InformationCircleIcon className="h-3 w-3 text-[#71717a]" />
          </Tooltip>
        </div>
        <div className="text-white">{new Date(p.created).toLocaleDateString()}</div>
        <div className="text-[10px] text-[#a1a1aa]">{formatAgo(p.created, closed)}</div>
      </div>
    </div>
  );
}
