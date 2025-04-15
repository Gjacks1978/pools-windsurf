import React, { useState } from "react";

export type Position = {
  pool: string;
  invested: number;
  current: number;
  uncollected: number;
  collected: number;

  rangeMin: number;
  rangeMax: number;
  entryPrice?: number;
  network: string;
  dex: string;
  created: string; // ISO string
};

const NETWORKS = ["Ethereum", "Arbitrum", "Polygon", "BSC", "Optimism", "Base", "Sui", "Solana"];
const DEXES_BY_NETWORK: Record<string, string[]> = {
  Ethereum: ["Uniswap", "Sushi", "Balancer", "Curve", "1inch"],
  Arbitrum: ["Uniswap", "Sushi", "Camelot", "Balancer"],
  Polygon: ["QuickSwap", "Uniswap", "Sushi", "Balancer"],
  BSC: ["PancakeSwap", "Biswap", "Sushi"],
  Optimism: ["Uniswap", "Velodrome", "Beethoven X"],
  Base: ["Aerodrome", "Uniswap", "Sushi"],
  Sui: ["Cetus", "Aftermath", "Turbos"],
  Solana: ["Orca", "Raydium", "Lifinity", "Jupiter"],
};

export function AddPositionModal({ open, onClose, onAdd, initialData }: {
  open: boolean;
  onClose: () => void;
  onAdd: (position: Position) => void;
  initialData?: Position | null;
}) {
  const [form, setForm] = useState<Position>(initialData ?? {
    pool: "",
    invested: 0,
    current: 0,
    uncollected: 0,
    collected: 0,
    rangeMin: 0,
    rangeMax: 0,
    entryPrice: undefined,
    network: NETWORKS[0],
    dex: DEXES_BY_NETWORK[NETWORKS[0]][0],
    created: new Date().toISOString(),
  });

  // Atualiza form ao abrir o modal ou ao mudar initialData
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setForm(initialData);
      } else {
        setForm({
          pool: "",
          invested: 0,
          current: 0,
          uncollected: 0,
          collected: 0,
          rangeMin: 0,
          rangeMax: 0,
          entryPrice: undefined,
          network: NETWORKS[0],
          dex: DEXES_BY_NETWORK[NETWORKS[0]][0],
          created: "2025-04-15T17:30:05-03:00",
        });
      }
    }
  }, [open, initialData]);

  // Atualiza DEX se mudar a rede
  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      dex: DEXES_BY_NETWORK[form.network][0],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.network]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdd(form);
    setForm({
      pool: "",
      invested: 0,
      current: 0,
      uncollected: 0,
      collected: 0,
      rangeMin: 0,
      rangeMax: 0,
      entryPrice: undefined,
      network: NETWORKS[0],
      dex: DEXES_BY_NETWORK[NETWORKS[0]][0],
      created: new Date().toISOString(),
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-[#18181b] p-6 rounded-xl w-full max-w-md flex flex-col gap-3">
        <div className="font-semibold text-white text-xl mb-3">Adicionar Posição</div>

        <label className="text-sm text-[#a1a1aa]">Nome da Pool</label>
        <input name="pool" placeholder="Pool" value={form.pool} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm" required />

        <div className="flex gap-2">
          <div className="flex-1 flex flex-col">
            <label className="text-sm text-[#a1a1aa]">Rede</label>
            <select name="network" value={form.network} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm">
              {NETWORKS.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-sm text-[#a1a1aa]">DEX</label>
            <select name="dex" value={form.dex} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm">
              {DEXES_BY_NETWORK[form.network].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <label className="text-sm text-[#a1a1aa]">Investido</label>
        <input name="invested" type="number" placeholder="Investido" value={form.invested} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm" required />

        <label className="text-sm text-[#a1a1aa]">Liquidez Atual</label>
        <input name="current" type="number" placeholder="Liq. Atual" value={form.current} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm" required />

        <label className="text-sm text-[#a1a1aa]">Não Coletado</label>
        <input name="uncollected" type="number" placeholder="Não Coletado" value={form.uncollected} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm" required />

        <label className="text-sm text-[#a1a1aa]">Coletado</label>
        <input name="collected" type="number" placeholder="Coletado" value={form.collected} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm" required />

        <div className="flex gap-2">
          <div className="flex-1 flex flex-col">
            <label className="text-sm text-[#a1a1aa]">Range Mínimo</label>
            <input name="rangeMin" type="number" placeholder="Range Mínimo" value={form.rangeMin} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm" required />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-sm text-[#a1a1aa]">Range Máximo</label>
            <input name="rangeMax" type="number" placeholder="Range Máximo" value={form.rangeMax} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm" required />
          </div>
        </div>

        <label className="text-sm text-[#a1a1aa]">Preço de Entrada (opcional)</label>
        <input name="entryPrice" type="number" placeholder="Preço de Entrada (opcional)" value={form.entryPrice ?? ""} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm" />


        <label className="text-sm text-[#a1a1aa]">Data de Criação</label>
        <input name="created" type="datetime-local" value={form.created.slice(0, 16)} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm w-full" />

        <div className="flex gap-2 mt-3">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded bg-[#232328] text-white text-base">Cancelar</button>
          <button type="submit" className="flex-1 py-2 rounded bg-white text-black font-semibold text-base">Adicionar</button>
        </div>
      </form>
    </div>
  );
}

