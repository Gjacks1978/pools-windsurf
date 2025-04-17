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
    { label: "Valor Total", value: valorTotal, desc: "Valor atual de liquidez em todas as pools", currency: true },
    { label: "Total Investido", value: totalInvestido, desc: "Investimento inicial em todas as pools", currency: true },
    { label: "Taxas Totais", value: ganhosTotais, desc: "Taxas combinadas de todas as pools", currency: true },
    { label: "P&L Total", value: pnlTotal, desc: "Lucro/perda combinado de todas as pools", currency: true },
    { label: "Rendimento Est.", value: rendimentoMedio, desc: "Rendimento médio ponderado", select: true, selectOptions: RENDIMENTO_OPTIONS, selectValue: rendimentoPeriodo, setSelect: setRendimentoPeriodo, selectLabel: "Período do Rendimento:" },
    { label: "Taxas Est.", value: taxasEst, desc: "Taxas estimadas ganhas", currency: true, select: true, selectOptions: TAXAS_OPTIONS, selectValue: taxasPeriodo, setSelect: setTaxasPeriodo, selectLabel: "Período das Taxas:" },
  ];

  function renderCardValue(card: any) {
    if (card.currency) {
      // Valor monetário: separa símbolo e valor
      const value = Number(card.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return <><span className="text-xs align-top mr-0.5 text-[#a1a1aa]">$</span><span>{value}</span></>;
    }
    return card.value;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full items-start">
        {cards.map((card, idx) => (
          // Card especial para P&L Total com bg condicional

          <div
            key={idx}
            className={`rounded-xl p-4 flex flex-col gap-1 border border-[#232328] min-w-[160px] h-full items-start justify-start ${card.label === 'P&L Total' ? (pnlTotal > 0 ? 'bg-[#071f14]' : pnlTotal < 0 ? 'bg-[#1f0d07]' : 'bg-[#18181b]') : 'bg-[#18181b]'}`}
            style={{ minHeight: card.select ? 180 : undefined }}
          >
            <span className="text-xs text-[#a1a1aa] font-medium">
              {card.label}
            </span>
            <span className="text-3xl font-semibold text-white">{renderCardValue(card)}</span>
            <span className="text-xs text-[#71717a] mb-2">{card.desc}</span>
            {card.select && (
              <div className="mt-auto w-full flex flex-col items-start">
                <select
                  className="bg-[#232328] text-xs rounded px-2 py-1 border-none outline-none w-full text-white"
                  value={card.selectValue}
                  onChange={e => card.setSelect(e.target.value)}
                >
                  {card.selectOptions?.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
