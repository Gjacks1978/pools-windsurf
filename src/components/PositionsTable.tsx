import React, { useState } from "react";
import { Position } from "./AddPositionModal";
import { Tooltip } from "./Tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { MobilePositionCard } from "./MobilePositionCard";

function formatAgo(dateIso: string, isClosed: boolean = false) {
  const now = new Date();
  const date = new Date(dateIso);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  
  // Calcular dias
  const diffD = Math.floor(diffSec / (60 * 60 * 24));
  return `${diffD} dias`;
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
  const [editingCell, setEditingCell] = useState<{row: number, field: 'uncollected' | 'collected' | 'current', value: number} | null>(null);

  // Função para salvar edição inline
  function handleInlineSave(idx: number, field: 'uncollected' | 'collected' | 'current', value: number) {
    if (isNaN(value)) return;
    // Atualize diretamente o valor localmente (sem abrir modal)
    if (positions[idx]) {
      positions[idx][field] = value;
    }
    setEditingCell(null);
  }

  // Definir tooltips para as colunas da tabela
  const columnTooltips = {
    'Pool': (
      <div>
        <p className="font-semibold mb-1">Pool</p>
        <p>Nome da pool de liquidez, incluindo a rede e DEX.</p>
        <p className="mt-1 text-xs">Exemplo: ETH-USDC • Uniswap V3 • Ethereum</p>
      </div>
    ),
    'Investido': (
      <div>
        <p className="font-semibold mb-1">Investido</p>
        <p>Valor inicial investido na pool.</p>
        <p className="mt-1 text-xs">Este valor é fixo e não muda com o tempo.</p>
      </div>
    ),
    'Liq. Atual': (
      <div>
        <p className="font-semibold mb-1">Liquidez Atual</p>
        <p>Valor atual da posição na pool.</p>
        <p className="mt-1 text-xs">Pode ser editado clicando no valor.</p>
        <p className="mt-1 text-xs">Varia conforme o preço dos tokens e impermanent loss.</p>
      </div>
    ),
    'Não Coletado': (
      <div>
        <p className="font-semibold mb-1">Não Coletado</p>
        <p>Taxas acumuladas que ainda não foram coletadas/reinvestidas.</p>
        <p className="mt-1 text-xs">Pode ser editado clicando no valor.</p>
      </div>
    ),
    'Coletado': (
      <div>
        <p className="font-semibold mb-1">Coletado</p>
        <p>Total de taxas já coletadas/reinvestidas desde o início.</p>
        <p className="mt-1 text-xs">Pode ser editado clicando no valor.</p>
      </div>
    ),
    'PNL': (
      <div>
        <p className="font-semibold mb-1">PNL (Profit & Loss)</p>
        <p>Lucro ou prejuízo da posição.</p>
        <p className="mt-1">Fórmula: Liq. Atual + Coletado + Não Coletado - Investido</p>
        <p className="mt-1 text-xs">Verde indica lucro, vermelho indica prejuízo.</p>
      </div>
    ),
    'APR': (
      <div>
        <p className="font-semibold mb-1">APR (Annual Percentage Rate)</p>
        <p>Taxa de retorno anualizada da posição.</p>
        <p className="mt-1">Cálculo:</p>
        <ol className="list-decimal list-inside mt-1 ml-2 text-xs">
          <li>PNL = Liq. Atual + Coletado - Investido</li>
          <li>Dias = Tempo desde a criação da posição</li>
          <li>Taxa diária = (PNL / Investido) / Dias</li>
          <li>APR Diário = Taxa diária × 100%</li>
          <li>APR Mensal = Taxa diária × 30 × 100%</li>
          <li>APR Anual = Taxa diária × 365 × 100%</li>
        </ol>
      </div>
    ),
    'Range': (
      <div>
        <p className="font-semibold mb-1">Range de Preço</p>
        <p>Intervalo de preço em que a posição fornece liquidez.</p>
        <p className="mt-1 text-xs">Barra preta: preço de entrada</p>
        <p className="text-xs">Barra verde (se rastreado): preço atual</p>
        <p className="mt-1 text-xs">Passe o mouse sobre a barra para ver detalhes.</p>
      </div>
    ),
    'Criado': (
      <div>
        <p className="font-semibold mb-1">Data de Criação</p>
        <p>Data e hora em que a posição foi criada.</p>
        <p className="mt-1 text-xs">Formato: data local + tempo decorrido</p>
        <p className="text-xs">Para posições fechadas: tempo fixo em "XX dias"</p>
      </div>
    ),
    'Ações': (
      <div>
        <p className="font-semibold mb-1">Ações</p>
        <p>Operações disponíveis para esta posição:</p>
        <ul className="list-disc list-inside mt-1 ml-2 text-xs">
          <li>Editar: modificar detalhes da posição</li>
          <li>Duplicar: criar cópia da posição</li>
          <li>Fechar/Restaurar: mover entre posições abertas/fechadas</li>
          <li>Excluir: remover permanentemente</li>
        </ul>
      </div>
    )
  };

  return (
    <div className="bg-white dark:bg-[#18181b] rounded-xl p-3 sm:p-4 md:p-6 w-full mt-4 border border-gray-300 dark:border-[#232328] shadow-sm">
      {/* Visualização de tabela para desktop */}
      <div className="overflow-x-auto sm:block hidden">
        <table className="min-w-full text-sm text-gray-500 dark:text-[#a1a1aa]">
          <thead className="hidden sm:table-header-group">
            <tr className="border-b border-gray-300 dark:border-[#232328] text-center">
              <th className="py-3 px-2 font-semibold text-center text-base text-black dark:text-white">
                <div className="flex items-center justify-center gap-1">
                  <span>Pool</span>
                  <Tooltip content={columnTooltips['Pool']} position="top">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a] hover:text-gray-600 dark:hover:text-[#a1a1aa] cursor-help" />
                  </Tooltip>
                </div>
              </th>
              <th className="py-3 px-2 font-semibold text-center text-base text-black dark:text-white">
                <div className="flex items-center justify-center gap-1">
                  <span>Investido</span>
                  <Tooltip content={columnTooltips['Investido']} position="top">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a] hover:text-gray-600 dark:hover:text-[#a1a1aa] cursor-help" />
                  </Tooltip>
                </div>
              </th>
              <th className="py-3 px-2 font-semibold text-center text-base text-black dark:text-white">
                <div className="flex items-center justify-center gap-1">
                  <span>Liq. Atual</span>
                  <Tooltip content={columnTooltips['Liq. Atual']} position="top">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a] hover:text-gray-600 dark:hover:text-[#a1a1aa] cursor-help" />
                  </Tooltip>
                </div>
              </th>
              <th className="py-3 px-2 font-semibold text-center text-base text-black dark:text-white">
                <div className="flex items-center justify-center gap-1">
                  <span>Não Coletado</span>
                  <Tooltip content={columnTooltips['Não Coletado']} position="top">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a] hover:text-gray-600 dark:hover:text-[#a1a1aa] cursor-help" />
                  </Tooltip>
                </div>
              </th>
              <th className="py-3 px-2 font-semibold text-center text-base text-black dark:text-white">
                <div className="flex items-center justify-center gap-1">
                  <span>Coletado</span>
                  <Tooltip content={columnTooltips['Coletado']} position="top">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a] hover:text-gray-600 dark:hover:text-[#a1a1aa] cursor-help" />
                  </Tooltip>
                </div>
              </th>
              <th className="py-3 px-2 font-semibold text-center text-base text-black dark:text-white">
                <div className="flex items-center justify-center gap-1">
                  <span>PNL</span>
                  <Tooltip content={columnTooltips['PNL']} position="top">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a] hover:text-gray-600 dark:hover:text-[#a1a1aa] cursor-help" />
                  </Tooltip>
                </div>
              </th>
              <th className="py-3 px-2 font-semibold text-center text-base text-black dark:text-white">
                <div className="flex items-center justify-center gap-1">
                  <span>APR (D/M/A)</span>
                  <Tooltip content={columnTooltips['APR']} position="top">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a] hover:text-gray-600 dark:hover:text-[#a1a1aa] cursor-help" />
                  </Tooltip>
                </div>
              </th>
              <th className="py-3 px-2 font-semibold text-center text-base text-black dark:text-white">
                <div className="flex items-center justify-center gap-1">
                  <span>Range</span>
                  <Tooltip content={columnTooltips['Range']} position="top">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a] hover:text-gray-600 dark:hover:text-[#a1a1aa] cursor-help" />
                  </Tooltip>
                </div>
              </th>
              <th className="py-3 px-2 font-semibold text-center text-base text-black dark:text-white">
                <div className="flex items-center justify-center gap-1">
                  <span>Criado</span>
                  <Tooltip content={columnTooltips['Criado']} position="top">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a] hover:text-gray-600 dark:hover:text-[#a1a1aa] cursor-help" />
                  </Tooltip>
                </div>
              </th>
              <th className="py-3 px-2 font-semibold text-center text-base text-black dark:text-white">
                <div className="flex items-center justify-center gap-1">
                  <span>Ações</span>
                  <Tooltip content={columnTooltips['Ações']} position="top">
                    <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a] hover:text-gray-600 dark:hover:text-[#a1a1aa] cursor-help" />
                  </Tooltip>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-gray-500 dark:text-[#71717a]">
                  Nenhuma posição aberta encontrada. Adicione uma posição manualmente usando o botão &quot;Adicionar Posição&quot;.
                </td>
              </tr>
            ) : (
              positions.map((p, idx) => (
                <tr key={idx} className="border-b border-gray-300 dark:border-[#232328] text-center flex flex-col sm:table-row mb-6 sm:mb-0">
                  <td className="py-2 px-2 text-center">
                    <div className="font-semibold text-black dark:text-white">{p.pool}</div>
                    <div className="flex items-center">
                      {p.isSimulated && (
                        <span className="mr-1 text-amber-500 dark:text-amber-400 text-xs font-bold">[SIMULADO]</span>
                      )}
                      <div className="text-[10px] text-gray-500 dark:text-[#a1a1aa]">
                        {p.network} • {p.dex}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center text-base text-black dark:text-white font-normal flex flex-col sm:table-cell">
                    <div className="sm:hidden flex justify-between items-center mb-1">
                      <span className="font-semibold text-black dark:text-white text-sm">Investido</span>
                      <Tooltip content={columnTooltips['Investido']} position="left">
                        <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a]" />
                      </Tooltip>
                    </div>
                    ${p.invested.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-center text-base text-black dark:text-white font-normal cursor-pointer flex flex-col sm:table-cell" onClick={() => setEditingCell({ row: idx, field: 'current', value: p.current })}>
                    <div className="sm:hidden flex justify-between items-center mb-1">
                      <span className="font-semibold text-black dark:text-white text-sm">Liq. Atual</span>
                      <Tooltip content={columnTooltips['Liq. Atual']} position="left">
                        <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a]" />
                      </Tooltip>
                    </div>
                    {editingCell && editingCell.row === idx && editingCell.field === 'current' ? (
                      <input
                        type="number"
                        className="bg-gray-100 dark:bg-[#232328] text-black dark:text-white rounded px-1 py-0.5 w-20 text-center outline-none border border-gray-300 dark:border-[#4b206e] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#4b206e]"
                        value={editingCell.value}
                        autoFocus
                        onChange={e => setEditingCell({ ...editingCell, value: Number(e.target.value) })}
                        onBlur={() => handleInlineSave(idx, 'current', editingCell.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleInlineSave(idx, 'current', editingCell.value); }}
                      />
                    ) : (
                      `$${p.current.toFixed(2)}`
                    )}
                  </td>
                  <td className="py-2 px-2 text-center text-base text-black dark:text-white font-normal cursor-pointer flex flex-col sm:table-cell" onClick={() => setEditingCell({ row: idx, field: 'uncollected', value: p.uncollected })}>
                    <div className="sm:hidden flex justify-between items-center mb-1">
                      <span className="font-semibold text-black dark:text-white text-sm">Não Coletado</span>
                      <Tooltip content={columnTooltips['Não Coletado']} position="left">
                        <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a]" />
                      </Tooltip>
                    </div>
                    {editingCell && editingCell.row === idx && editingCell.field === 'uncollected' ? (
                      <input
                        type="number"
                        className="bg-gray-100 dark:bg-[#232328] text-black dark:text-white rounded px-1 py-0.5 w-20 text-center outline-none border border-gray-300 dark:border-[#4b206e] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#4b206e]"
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
                  <td className="py-2 px-2 text-center text-base text-black dark:text-white font-normal cursor-pointer flex flex-col sm:table-cell" onClick={() => setEditingCell({ row: idx, field: 'collected', value: p.collected })}>
                    <div className="sm:hidden flex justify-between items-center mb-1">
                      <span className="font-semibold text-black dark:text-white text-sm">Coletado</span>
                      <Tooltip content={columnTooltips['Coletado']} position="left">
                        <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a]" />
                      </Tooltip>
                    </div>
                    {editingCell && editingCell.row === idx && editingCell.field === 'collected' ? (
                      <input
                        type="number"
                        className="bg-gray-100 dark:bg-[#232328] text-black dark:text-white rounded px-1 py-0.5 w-20 text-center outline-none border border-gray-300 dark:border-[#4b206e] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#4b206e]"
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
                  <td className={`py-2 px-2 text-center text-base font-normal flex flex-col sm:table-cell ${Number(calcPNL(p)) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <div className="sm:hidden flex justify-between items-center mb-1">
                      <span className="font-semibold text-black dark:text-white text-sm">PNL</span>
                      <Tooltip content={columnTooltips['PNL']} position="left">
                        <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a]" />
                      </Tooltip>
                    </div>
                    <span className="text-xs align-top mr-0.5 text-gray-400 dark:text-[#a1a1aa]">$</span><span>{calcPNL(p)}</span>
                  </td>
                  <td className="py-2 px-2 text-center whitespace-nowrap flex flex-col sm:table-cell">
                    <div className="sm:hidden flex justify-between items-center mb-1">
                      <span className="font-semibold text-black dark:text-white text-sm">APR</span>
                      <Tooltip content={columnTooltips['APR']} position="left">
                        <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a]" />
                      </Tooltip>
                    </div>
                    {(() => {
                      const apr = calcAPR(p);
                      return (
                        <div className="flex flex-col text-xs text-base text-black dark:text-white font-normal">
                          <span><b>D:</b> {apr.daily}</span>
                          <span><b>M:</b> {apr.monthly}</span>
                          <span><b>A:</b> {apr.annual}</span>
                        </div>
                      );
                    })()}
                  </td>

                  <td className="py-2 px-2 text-center">
                    <div className="flex flex-col items-center w-full min-w-[120px]">
                      <div className="flex w-full items-center justify-between text-xs text-gray-500 dark:text-[#a1a1aa] mb-1">
                        <span>{p.rangeMin ?? '-'}</span>
                        <span>{p.rangeMax ?? '-'}</span>
                      </div>
                      <div className="relative w-full h-3 flex items-center justify-center group cursor-pointer">
                        {/* Barra horizontal */}
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-300 dark:bg-[#4b206e] rounded" />
                        {/* Barrinha do entryPrice */}
                        {typeof p.rangeMin === 'number' && typeof p.rangeMax === 'number' && typeof p.entryPrice === 'number' && p.rangeMax > p.rangeMin && p.entryPrice >= p.rangeMin && p.entryPrice <= p.rangeMax && (
                          <div
                            className="absolute top-0 bottom-0 w-1 bg-black dark:bg-white rounded"
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
                        {/* Tooltip flutuante */}
                        {typeof p.rangeMin === 'number' && typeof p.rangeMax === 'number' && p.rangeMax > p.rangeMin && (
                          <div className="absolute z-10 left-1/2 -translate-x-1/2 bottom-6 hidden group-hover:flex flex-col items-center">
                            <div className="bg-white dark:bg-[#2a003f] text-black dark:text-white rounded-lg shadow-lg px-4 py-2 text-xs whitespace-nowrap border border-gray-300 dark:border-[#4b206e]">
                              <div><b>Amplitude:</b> {(((p.rangeMax - p.rangeMin) / p.rangeMin) * 100).toFixed(2)}%</div>
                              <div><b>Mín:</b> {p.rangeMin}</div>
                              <div><b>Máx:</b> {p.rangeMax}</div>
                              {typeof p.entryPrice === 'number' && (
                                <div><b>Entrada:</b> {p.entryPrice}</div>
                              )}
                              {typeof p.currentPrice === 'number' && ('isTracked' in p) && (
                                <div><b>Atual:</b> <span className="text-green-600 dark:text-green-400">{p.currentPrice}</span></div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center flex flex-col sm:table-cell">
                    <div className="sm:hidden flex justify-between items-center mb-1">
                      <span className="font-semibold text-black dark:text-white text-sm">Criado</span>
                      <Tooltip content={columnTooltips['Criado']} position="left">
                        <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a]" />
                      </Tooltip>
                    </div>
                    <div className="text-black dark:text-white">{new Date(p.created).toLocaleDateString()}</div>
                    <div className="text-[10px] text-gray-500 dark:text-[#a1a1aa]">{formatAgo(p.created, closed)}</div>
                  </td>
                  <td className="py-2 px-2 flex flex-col sm:table-cell">
                    <div className="sm:hidden flex justify-between items-center mb-1">
                      <span className="font-semibold text-black dark:text-white text-sm">Ações</span>
                      <Tooltip content={columnTooltips['Ações']} position="left">
                        <InformationCircleIcon className="h-4 w-4 text-gray-400 dark:text-[#71717a]" />
                      </Tooltip>
                    </div>
                    <div className="flex gap-2 justify-center items-center">
                      {/* Link para a pool original */}
                      {p.poolUrl && (
                        <a 
                          href={p.poolUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          title="Abrir link da pool" 
                          className="p-1 hover:bg-gray-200 dark:hover:bg-[#232328] rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      )}
                      {!closed && !('isTracked' in p) && (
                      <>
                        {closed ? (
                          <button title="Restaurar" className="p-1 hover:bg-gray-200 dark:hover:bg-[#232328] rounded" onClick={() => onRestore && onRestore(idx)}>
                            {/* Heroicons Pencil Square outline */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.212l-4.182.465a.75.75 0 0 1-.83-.829l.465-4.182L16.862 3.487zm0 0L19.5 6.125" />
                            </svg>
                          </button>
                        ) : (
                          <button title="Editar" className="p-1 hover:bg-gray-200 dark:hover:bg-[#232328] rounded" onClick={() => onEdit && onEdit(idx)}>
                            {/* Heroicons Pencil Square outline */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.212l-4.182.465a.75.75 0 0 1-.83-.829l.465-4.182L16.862 3.487zm0 0L19.5 6.125" />
                            </svg>
                          </button>
                        )}
                        <button title="Duplicar" className="p-1 hover:bg-gray-200 dark:hover:bg-[#232328] rounded" onClick={() => onDuplicate && onDuplicate(idx)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5v-2.25A2.25 2.25 0 0 1 9.75 3h7.5A2.25 2.25 0 0 1 19.5 5.25v7.5a2.25 2.25 0 0 1-2.25 2.25H15M3 9.75A2.25 2.25 0 0 1 5.25 7.5h7.5A2.25 2.25 0 0 1 15 9.75v7.5A2.25 2.25 0 0 1 12.75 19.5h-7.5A2.25 2.25 0 0 1 3 17.25v-7.5z" /></svg>
                        </button>
                        <button title="Fechar posição" onClick={() => onClosePosition && onClosePosition(idx)} className="p-1 hover:bg-[#232328] rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v1.5M3 7.5h18M3 7.5v10.125A2.625 2.625 0 0 0 5.625 20.25h12.75A2.625 2.625 0 0 0 21 17.625V7.5M9.75 10.5h4.5" />
                          </svg>
                        </button>
                      </>
                    )}
                    {!closed && ('isTracked' in p) && (
                      <div className="text-xs text-[#a1a1aa] italic">
                        Rastreado
                        {p.isSimulated && <span className="ml-1 text-amber-400">(Dados simulados)</span>}
                      </div>
                    )}
                    {closed && typeof onRestore === 'function' && (
                      <button title="Restaurar" onClick={() => onRestore(idx)} className="p-1 hover:bg-[#232328] rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10v6a2 2 0 0 0 2 2h6m-8-8 8-8m0 0v6a2 2 0 0 0 2 2h6m-8-8 8 8" /></svg>
                      </button>
                    )}
                    <button title="Excluir" onClick={() => onRemove(idx)} className="p-1 hover:bg-[#232328] rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Visualização de cards para mobile */}
      <div className="sm:hidden space-y-4">
        {positions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-[#71717a]">
            Nenhuma posição encontrada. Adicione uma posição manualmente usando o botão "Adicionar Posição".
          </div>
        ) : (
          positions.map((p, idx) => (
            <MobilePositionCard
              key={idx}
              position={p}
              index={idx}
              closed={closed}
              onRemove={onRemove}
              onClosePosition={onClosePosition}
              onDuplicate={onDuplicate}
              onEdit={onEdit}
              onRestore={onRestore}
              editingCell={editingCell}
              setEditingCell={setEditingCell}
              handleInlineSave={handleInlineSave}
              calcPNL={calcPNL}
              calcAPR={calcAPR}
              formatAgo={formatAgo}
              tooltips={columnTooltips}
            />
          ))
        )}
      </div>
    </div>
  );
}
