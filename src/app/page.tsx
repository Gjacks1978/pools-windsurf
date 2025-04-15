import { DashboardCards } from "../components/DashboardCards";
import { PositionsTable } from "../components/PositionsTable";
import { TrackByAddress } from "../components/TrackByAddress";

export default function Home() {
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
            <button className="px-3 py-1 rounded bg-white text-xs text-black font-semibold">+ Adicionar Posição</button>
          </div>
        </div>
        <PositionsTable />
      </section>

      <div className="w-full max-w-7xl">
        <TrackByAddress />
      </div>
    </div>
  );
}
