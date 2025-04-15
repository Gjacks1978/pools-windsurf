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
  const valorTotal = positions.reduce((acc, p) => acc + p.current, 0);
  const totalInvestido = positions.reduce((acc, p) => acc + p.invested, 0);
  const ganhosTotais = positions.reduce((acc, p) => acc + p.collected + p.uncollected, 0);
  const pnlTotal = positions.reduce((acc, p) => acc + (p.current + p.collected + p.uncollected - p.invested), 0);

  // Rendimento simples médio ponderado por período
  // Cálculo correto de rendimento estimado com juros simples:
  let totalPNL = 0;
  let totalInvestidoRend = 0;
  let totalDias = 0;
  let taxasEst = 0; // soma simples
  positions.forEach((p, idx) => {
    // Debug: Mostra todos os valores relevantes para cada pool
    console.log(`[DEBUG] Pool ${idx+1}: invested=${p.invested}, current=${p.current}, collected=${p.collected}, uncollected=${p.uncollected}, created=${p.created}`);
    const dias = Math.max(1, (new Date().getTime() - new Date(p.created).getTime()) / (1000 * 60 * 60 * 24));
    const invested = p.invested;
    if (invested > 0) {
      const pnl = p.current + p.collected + p.uncollected - invested;
      totalPNL += pnl;
      totalInvestidoRend += invested;
      totalDias += dias * invested;
      // Taxas estimadas soma simples
      const taxasDiarias = (p.collected + p.uncollected) / dias;
      let taxasProj = 0;
      if (taxasPeriodo === "Diário") taxasProj = taxasDiarias;
      else if (taxasPeriodo === "Mensal") taxasProj = taxasDiarias * 30;
      else taxasProj = taxasDiarias * 365;
      taxasEst += taxasProj;
    }
  });
  // Se não houver posições, retorno padrão
  let rendimentoMedio = "0.00%";
  if (positions.length > 0) {
    // Se só tem uma posição, use a lógica exata do calcAPR (incluindo uncollected)
    if (positions.length === 1) {
      const p = positions[0];
      const invested = p.invested;
      if (invested && invested !== 0) {
        const pnl = p.current + p.collected + p.uncollected - invested;
        const days = Math.max(1, (new Date().getTime() - new Date(p.created).getTime()) / (1000 * 60 * 60 * 24));
        const dailyRate = pnl / invested / days;
        let rate = 0;
        if (rendimentoPeriodo === "Diário") rate = dailyRate * 100;
        else if (rendimentoPeriodo === "Mensal") rate = dailyRate * 30 * 100;
        else rate = dailyRate * 365 * 100;
        rendimentoMedio = rate.toFixed(2) + "%";
      }
    } else {
      // Média ponderada para múltiplas posições
      let totalPNL = 0;
      let totalInvestidoRend = 0;
      let totalDias = 0;
      positions.forEach((p) => {
        const dias = Math.max(1, (new Date().getTime() - new Date(p.created).getTime()) / (1000 * 60 * 60 * 24));
        const invested = p.invested;
        if (invested > 0) {
          const pnl = p.current + p.collected + p.uncollected - invested;
          totalPNL += pnl;
          totalInvestidoRend += invested;
          totalDias += dias * invested;
        }
      });
      const diasMedio = totalInvestidoRend > 0 ? totalDias / totalInvestidoRend : 1;
      let rendimentoSimples = 0;
      if (totalInvestidoRend > 0) {
        const dailyRate = totalPNL / totalInvestidoRend / diasMedio;
        if (rendimentoPeriodo === "Diário") rendimentoSimples = dailyRate * 100;
        else if (rendimentoPeriodo === "Mensal") rendimentoSimples = dailyRate * 30 * 100;
        else rendimentoSimples = dailyRate * 365 * 100;
      }
      rendimentoMedio = totalInvestidoRend > 0 ? rendimentoSimples.toFixed(2) + "%" : "0.00%";
    }
  }
  const taxasEstFormatted = taxasEst.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' });

  // Função utilitária para trocar US$ por $
  const formatUSD = (v: number) => {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' }).replace('US$', '$');
  };
  const cards = [
    { label: "Valor Total", value: formatUSD(valorTotal), desc: "Valor atual de liquidez em todas as pools" },
    { label: "Total Investido", value: formatUSD(totalInvestido), desc: "Investimento inicial em todas as pools" },
    { label: "Ganhos Totais", value: formatUSD(ganhosTotais), desc: "Taxas combinadas de todas as pools" },
    { label: "P&L Total", value: formatUSD(pnlTotal), desc: "Lucro/perda combinado de todas as pools" },
    { label: "Rendimento Est.", value: rendimentoMedio, desc: "Rendimento médio ponderado", select: true, selectOptions: RENDIMENTO_OPTIONS, selectValue: rendimentoPeriodo, setSelect: setRendimentoPeriodo, selectLabel: "Período do Rendimento:" },
    { label: "Taxas Est.", value: taxasEstFormatted.replace('US$', '$'), desc: "Taxas estimadas ganhas", select: true, selectOptions: TAXAS_OPTIONS, selectValue: taxasPeriodo, setSelect: setTaxasPeriodo, selectLabel: "Período das Taxas:" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full items-start">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-[#18181b] rounded-xl p-4 flex flex-col gap-1 border border-[#232328] min-w-[160px] h-full items-start justify-start"
            style={{ minHeight: card.select ? 180 : undefined }}
          >
            <span className="text-xs text-[#a1a1aa] font-medium">
              {card.label}
            </span>
            <span className="text-3xl font-semibold text-white">{card.value}</span>
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
