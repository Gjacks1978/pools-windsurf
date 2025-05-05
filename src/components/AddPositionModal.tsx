import React, { useState } from "react";

export type Position = {
  pool: string;
  invested: number;
  current: number;
  uncollected: number;
  collected: number;

  rangeMin?: number;
  rangeMax?: number;
  entryPrice?: number;
  network: string;
  dex: string;
  created: string; // ISO string
  observacoes?: string;
  poolUrl?: string; // Link para a pool original
  
  // Propriedades para posições rastreadas
  isTracked?: boolean;
  currentPrice?: number; // Preço atual para exibir na barra de range
  isSimulated?: boolean; // Indica se os dados são simulados
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
  Solana: ["Orca", "Raydium", "Lifinity", "Jupiter", "Meteora"],
};

export function AddPositionModal({ open, onClose, onAdd, initialData }: {
  open: boolean;
  onClose: () => void;
  onAdd: (position: Position) => void;
  initialData?: Position | null;
}) {
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    now.setSeconds(0, 0); // Zera os segundos e ms
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
  };

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
    created: getCurrentDateTimeLocal(),
    observacoes: '',
    poolUrl: '',
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
          created: getCurrentDateTimeLocal(),
          observacoes: '',
          poolUrl: '',
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
  }, [form.network]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Garante que 'created' está em formato ISO
    let createdISO = form.created;
    if (form.created && !form.created.includes('T')) {
      // Caso venha só a data (yyyy-MM-dd ou yyyy-MM-dd HH:mm), converte para ISO
      createdISO = new Date(form.created).toISOString();
    }
    const positionToAdd = { ...form, created: createdISO };
    onAdd(positionToAdd);
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
      poolUrl: '',
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
            <label className="text-sm text-[#a1a1aa]">Range Mínimo (opcional)</label>
            <input name="rangeMin" type="number" placeholder="Range Mínimo" value={form.rangeMin ?? ''} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm" />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-sm text-[#a1a1aa]">Range Máximo (opcional)</label>
            <input name="rangeMax" type="number" placeholder="Range Máximo" value={form.rangeMax ?? ''} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm" />
          </div>
        </div>

        <label className="text-sm text-[#a1a1aa]">Preço de Entrada (opcional)</label>
        <input name="entryPrice" type="number" placeholder="Preço de Entrada (opcional)" value={form.entryPrice ?? ""} onChange={handleChange} className="px-3 py-2 rounded bg-[#232328] text-white text-sm" />


        <label className="text-sm text-[#a1a1aa]">URL da Pool (opcional)</label>
        <input
          name="poolUrl"
          type="url"
          placeholder="https://app.uniswap.org/..."
          value={form.poolUrl ?? ''}
          onChange={handleChange}
          className="px-3 py-2 rounded bg-[#232328] text-white text-sm w-full"
        />

        <label className="text-sm text-[#a1a1aa]">Observações (opcional)</label>
        <textarea
          name="observacoes"
          placeholder="Observações sobre a posição"
          value={form.observacoes ?? ''}
          onChange={handleChange}
          className="px-3 py-2 rounded bg-[#232328] text-white text-sm w-full min-h-[60px] resize-y"
        />

        <label className="text-sm text-[#a1a1aa]">Data de Criação</label>
        <div
          className="relative w-full cursor-pointer group"
          tabIndex={0}
          onClick={() => {
            const input = document.getElementById('created-input') as HTMLInputElement;
            if (input) {
              if (input.showPicker) {
                input.showPicker();
              } else {
                input.focus();
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              const input = document.getElementById('created-input') as HTMLInputElement;
              if (input) {
                if (input.showPicker) {
                  input.showPicker();
                } else {
                  input.focus();
                }
              }
            }
          }}
        >
          <input
            id="created-input"
            name="created"
            type="datetime-local"
            value={form.created.slice(0, 16)}
            onChange={handleChange}
            className="px-3 py-2 rounded bg-[#232328] text-white text-sm w-full border-2 border-[#232328] group-focus-within:border-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 transition-all outline-none cursor-pointer"
            style={{ minHeight: 44 }}
            step="60"
            // step="60" força escolha por minuto
          />
          <span className="absolute left-2 top-2 text-[#a1a1aa] pointer-events-none select-none text-xs">
            {form.created ? '' : 'Selecione a data e hora'}
          </span>
        </div>

        <div className="flex gap-2 mt-3">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded bg-[#232328] text-white text-base">Cancelar</button>
          <button type="submit" className="flex-1 py-2 rounded bg-white text-black font-semibold text-base">Adicionar</button>
        </div>
      </form>
    </div>
  );
}
