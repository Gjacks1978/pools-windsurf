import React from "react";

export function TrackByAddress() {
  return (
    <div className="bg-[#18181b] rounded-xl p-6 w-full mt-8">
      <div className="font-semibold text-white mb-2 text-sm">Rastrear Posições por Endereço</div>
      <div className="text-xs text-[#a1a1aa] mb-4">
        Digite um endereço de carteira Ethereum para visualizar suas posições de liquidez sem precisar conectar.
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded bg-[#232328] text-white border-none outline-none text-xs"
          placeholder="0x..."
        />
        <button className="px-4 py-2 bg-white text-black font-semibold rounded text-xs">Rastrear Carteira</button>
      </div>
    </div>
  );
}
