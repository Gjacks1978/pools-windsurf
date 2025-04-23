import React, { useState } from "react";
import { Position } from "./AddPositionModal";

type DashboardCardsProps = {
  positions: Position[];
};

const RENDIMENTO_OPTIONS = ["Diário", "Mensal", "Anual"];
const TAXAS_OPTIONS = ["Diário", "Mensal", "Anual"];

export function DashboardCards({ positions }: DashboardCardsProps) {
  // Estados para seleção dos cards
  const [rendimentoPeriodo, setRendimentoPeriodo] = useState("Anual");
  const [taxasPeriodo, setTaxasPeriodo] = useState("Anual");

  // Cálculos reais
  const valorTotal = positions.reduce((acc: number, p) => acc + p.current, 0);
  const totalInvestido = positions.reduce((acc: number, p) => acc + p.invested, 0);
  const ganhosTotais = positions.reduce((acc: number, p) => acc + p.collected + p.uncollected, 0);
  const pnlTotal = positions.reduce((acc: number, p) => acc + (p.current + p.collected + p.uncollected - p.invested), 0);

  // --- Cálculo Refatorado para Rendimento Est. e Taxas Est. ---

  let totalFees = 0;
  let totalInvestedDays = 0;
  let totalDailyFeesAccumulated = 0; // Para Taxas Est.

  positions.forEach((p) => {
    const days = Math.max(1, (new Date().getTime() - new Date(p.created).getTime()) / (1000 * 60 * 60 * 24));
    const invested = p.invested;
    const fees = p.collected + p.uncollected;

    if (invested > 0) {
      totalFees += fees;
      totalInvestedDays += invested * days;
    }
    if (days > 0) {
      totalDailyFeesAccumulated += fees / days;
    }
  });

  // Cálculo Rendimento Estimado (baseado em taxas)
  let averageDailyRate = 0;
  if (totalInvestedDays > 0) {
    averageDailyRate = totalFees / totalInvestedDays;
  }

  let estimatedYieldRate = 0;
  if (rendimentoPeriodo === "Diário") {
    estimatedYieldRate = averageDailyRate * 100;
  } else if (rendimentoPeriodo === "Mensal") {
    estimatedYieldRate = averageDailyRate * 30 * 100;
  } else { // Anual
    estimatedYieldRate = averageDailyRate * 365 * 100;
  }
  const rendimentoMedio = estimatedYieldRate.toFixed(2) + "%";

  // Cálculo Taxas Estimadas (projeção do total diário)
  let taxasEst = 0;
  if (taxasPeriodo === "Diário") {
    taxasEst = totalDailyFeesAccumulated;
  } else if (taxasPeriodo === "Mensal") {
    taxasEst = totalDailyFeesAccumulated * 30;
  } else { // Anual
    taxasEst = totalDailyFeesAccumulated * 365;
  }

  // ---------------- Fim do Cálculo Refatorado ------------------

  const cards = [
    {
      title: 'Total Valor Atual',
      value: valorTotal,
      bg: pnlTotal > 0 ? 'bg-white dark:bg-[#071f14] border border-gray-300 dark:border-[#232328]' : 
          pnlTotal < 0 ? 'bg-white dark:bg-[#1f0d07] border border-gray-300 dark:border-[#232328]' : 
          'bg-white dark:bg-[#18181b] border border-gray-300 dark:border-[#232328]',
      desc: 'Valor total de todas as posições abertas',
      currency: true
    },
    {
      title: 'Total Investido',
      value: totalInvestido,
      bg: 'bg-white dark:bg-[#18181b] border border-gray-300 dark:border-[#232328]',
      desc: 'Valor total investido em todas as posições abertas',
      currency: true
    },
    {
      title: 'Taxas Totais',
      value: ganhosTotais,
      bg: 'bg-white dark:bg-[#18181b] border border-gray-300 dark:border-[#232328]',
      desc: 'Taxas combinadas de todas as pools',
      currency: true
    },
    {
      title: 'P&L Total',
      value: pnlTotal,
      bg: pnlTotal > 0 ? 'bg-white dark:bg-[#071f14] border border-gray-300 dark:border-[#232328]' : 
          pnlTotal < 0 ? 'bg-white dark:bg-[#1f0d07] border border-gray-300 dark:border-[#232328]' : 
          'bg-white dark:bg-[#18181b] border border-gray-300 dark:border-[#232328]',
      desc: 'Lucro/perda combinado de todas as pools',
      currency: true
    },
    {
      title: 'Rendimento Estimado',
      value: rendimentoMedio,
      bg: 'bg-white dark:bg-[#18181b] border border-gray-300 dark:border-[#232328]',
      desc: 'Rendimento anual estimado baseado em taxas',
      selectValue: rendimentoPeriodo,
      setSelect: setRendimentoPeriodo,
      selectOptions: RENDIMENTO_OPTIONS
    },
    {
      title: 'Taxas Estimadas',
      value: taxasEst,
      bg: 'bg-white dark:bg-[#18181b] border border-gray-300 dark:border-[#232328]',
      desc: 'Taxas estimadas para o período selecionado',
      currency: true,
      selectValue: taxasPeriodo,
      setSelect: setTaxasPeriodo,
      selectOptions: TAXAS_OPTIONS
    },
  ];

  function renderCardValue(card: any) {
    if (card.currency) {
      // Valor monetário: separa símbolo e valor
      const value = Number(card.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return <><span className="text-xs align-top mr-0.5 text-gray-400 dark:text-[#a1a1aa]">$</span><span>{value}</span></>;
    }
    return card.value;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
      {cards.map((card, i) => (
        <div key={i} className={`${card.bg} rounded-xl p-4 flex flex-col gap-1 min-w-[160px] relative ${card.selectOptions ? 'pb-12' : ''}`}>
          <span className="text-xs text-gray-500 dark:text-[#a1a1aa] font-medium">{card.title}</span>
          <span className="text-2xl font-semibold text-black dark:text-white">{renderCardValue(card)}</span>
          <span className="text-xs text-gray-500 dark:text-[#71717a]">{card.desc}</span>
          {card.selectOptions && (
            <div className="absolute bottom-3 right-3">
              <select
                className="bg-transparent text-xs text-black dark:text-white p-1 rounded border border-gray-300 dark:border-[#232328]"
                value={card.selectValue}
                onChange={e => card.setSelect(e.target.value)}
              >
                {card.selectOptions.map((opt: string) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
