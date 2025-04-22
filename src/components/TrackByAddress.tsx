import React, { useState, useEffect } from "react";
import { Position } from "./AddPositionModal";
import { getMockPositionsForAddress } from "../lib/mockUniswapData";

type TrackedAddress = {
  address: string;
  isLoading: boolean;
  error?: string;
  positions: Position[];
};

// Interface para os dados retornados pela API
interface PoolPosition {
  poolId: string;
  tokenA: string;
  tokenB: string;
  fee: number;
  liquidity: number;
  amountUSD: number;
  uncollectedFeesUSD: number;
  collectedFeesUSD: number;
  initialInvestmentUSD: number;
  tickLower: number;
  tickUpper: number;
  currentTick: number;
  createdAtTimestamp: number;
}

// Função para converter tick para preço
function tickToPrice(tick: number, decimalsToken0: number = 18, decimalsToken1: number = 18): number {
  return 1.0001 ** tick * (10 ** (decimalsToken1 - decimalsToken0));
}

// Função para formatar nome da pool
function formatPoolName(tokenA: string, tokenB: string): string {
  return `${tokenA}/${tokenB}`;
}

// Função para verificar se um endereço Ethereum é válido
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function TrackByAddress({ onPositionsFound }: { onPositionsFound: (positions: Position[]) => void }) {
  const [addressInput, setAddressInput] = useState("");
  const [trackedAddresses, setTrackedAddresses] = useState<TrackedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efeito para atualizar as posições no componente pai quando houver mudanças
  useEffect(() => {
    const allPositions = trackedAddresses.flatMap(addr => addr.positions);
    onPositionsFound(allPositions);
  }, [trackedAddresses, onPositionsFound]);

  // Função para buscar posições de um endereço na Uniswap
  async function fetchUniswapPositions(address: string): Promise<Position[]> {
    try {
      let mockDataUsed = false;
      let positionsData;
      
      try {
        // Tentar usar a API Route como proxy para evitar problemas de CORS
        const response = await fetch('/api/uniswap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `{
              positions(where: {owner: "${address.toLowerCase()}", liquidity_gt: 0}) {
                id
                pool {
                  id
                  token0 {
                    symbol
                    decimals
                  }
                  token1 {
                    symbol
                    decimals
                  }
                  feeTier
                  tick
                }
                tickLower {
                  tickIdx
                }
                tickUpper {
                  tickIdx
                }
                liquidity
                depositedToken0
                depositedToken1
                collectedFeesToken0
                collectedFeesToken1
                transaction {
                  timestamp
                }
              }
            }`
          }),
        });

        const data = await response.json();
        
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }
        
        // Se não houver posições, verificar se temos dados simulados
        if (!data.data || !data.data.positions || data.data.positions.length === 0) {
          const mockData = getMockPositionsForAddress(address);
          if (mockData.length > 0) {
            positionsData = mockData;
            mockDataUsed = true;
          } else {
            return [];
          }
        } else {
          positionsData = data.data.positions;
        }
      } catch (apiError) {
        console.warn("Erro ao acessar API, usando dados simulados:", apiError);
        // Se a API falhar, usar dados simulados
        positionsData = getMockPositionsForAddress(address);
        mockDataUsed = true;
        
        // Se não houver dados simulados para este endereço, lançar erro
        if (positionsData.length === 0) {
          throw new Error("Não foi possível acessar a API e não há dados simulados para este endereço.");
        }
      }

      // Processar os dados recebidos
      const positions = positionsData.map((pos: any): Position => {
        // Indicar se estamos usando dados simulados
        const isSimulatedData = mockDataUsed;
        const token0Symbol = pos.pool.token0.symbol;
        const token1Symbol = pos.pool.token1.symbol;
        const token0Decimals = parseInt(pos.pool.token0.decimals);
        const token1Decimals = parseInt(pos.pool.token1.decimals);
        const tickLower = parseInt(pos.tickLower.tickIdx);
        const tickUpper = parseInt(pos.tickUpper.tickIdx);
        const currentTick = parseInt(pos.pool.tick);
        
        // Calcular preços a partir dos ticks
        const priceLower = tickToPrice(tickLower, token0Decimals, token1Decimals);
        const priceUpper = tickToPrice(tickUpper, token0Decimals, token1Decimals);
        const currentPrice = tickToPrice(currentTick, token0Decimals, token1Decimals);
        
        // Estimativa de valores em USD (simplificada)
        const liquidity = parseFloat(pos.liquidity) / 1e18;
        const estimatedValueUSD = liquidity * 10; // Estimativa simples
        const initialInvestmentUSD = estimatedValueUSD * 0.9; // Estimativa simples
        const uncollectedFeesUSD = estimatedValueUSD * 0.03; // Estimativa simples
        const collectedFeesUSD = parseFloat(pos.collectedFeesToken0) + parseFloat(pos.collectedFeesToken1);
        
        return {
          pool: formatPoolName(token0Symbol, token1Symbol),
          invested: initialInvestmentUSD,
          current: estimatedValueUSD,
          uncollected: uncollectedFeesUSD,
          collected: collectedFeesUSD,
          rangeMin: priceLower,
          rangeMax: priceUpper,
          entryPrice: currentPrice,
          network: "Ethereum",
          dex: "Uniswap",
          created: new Date(parseInt(pos.transaction.timestamp) * 1000).toISOString(),
          observacoes: `ID da posição: ${pos.id}`,
          isTracked: true, // Marcador para identificar posições rastreadas
          currentPrice: currentPrice, // Preço atual para exibir na barra de range
          isSimulated: isSimulatedData // Indicador de dados simulados
        };
      });

      return positions;
    } catch (error) {
      console.error("Erro ao buscar posições:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      throw new Error(`Não foi possível buscar as posições: ${errorMessage}. Verifique o endereço e sua conexão com a internet.`);
    }
  }

  // Função para adicionar um novo endereço para rastreamento
  async function handleTrackAddress() {
    // Limpar erros anteriores
    setError(null);
    
    // Validar endereço
    if (!addressInput.trim()) {
      setError("Digite um endereço de carteira.");
      return;
    }
    
    const address = addressInput.trim();
    
    if (!isValidEthereumAddress(address)) {
      setError("Endereço Ethereum inválido. Verifique o formato (0x seguido de 40 caracteres hexadecimais).");
      return;
    }
    
    // Verificar se o endereço já está sendo rastreado
    if (trackedAddresses.some(a => a.address.toLowerCase() === address.toLowerCase())) {
      setError("Este endereço já está sendo rastreado.");
      return;
    }
    
    // Adicionar endereço à lista com status de carregamento
    setTrackedAddresses(prev => [
      ...prev,
      { address, isLoading: true, positions: [] }
    ]);
    
    setIsLoading(true);
    
    try {
      // Buscar posições do endereço
      const positions = await fetchUniswapPositions(address);
      
      // Atualizar o endereço na lista com as posições encontradas
      setTrackedAddresses(prev => prev.map(addr => 
        addr.address === address 
          ? { 
              ...addr, 
              isLoading: false, 
              positions, 
              error: positions.length === 0 ? "Nenhuma posição de liquidez ativa encontrada." : undefined 
            }
          : addr
      ));
      
      // Limpar o input após adicionar com sucesso
      setAddressInput("");
      
      // Se não encontrou posições, mostrar mensagem amigável
      if (positions.length === 0) {
        setError("Nenhuma posição de liquidez ativa encontrada para este endereço.");
      }
    } catch (err) {
      // Atualizar o endereço na lista com o erro
      setTrackedAddresses(prev => prev.map(addr => 
        addr.address === address 
          ? { ...addr, isLoading: false, error: (err as Error).message }
          : addr
      ));
    } finally {
      setIsLoading(false);
    }
  }

  // Função para remover um endereço rastreado
  function handleRemoveAddress(address: string) {
    setTrackedAddresses(prev => prev.filter(addr => addr.address !== address));
  }

  return (
    <div className="bg-[#18181b] rounded-xl p-6 w-full mt-8">
      <div className="font-semibold text-white mb-2 text-sm">Rastrear Posições por Endereço</div>
      <div className="text-xs text-[#a1a1aa] mb-4">
        Digite um endereço de carteira Ethereum para visualizar suas posições de liquidez sem precisar conectar.
      </div>
      
      {/* Input para adicionar endereço */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded bg-[#232328] text-white border-none outline-none text-xs"
          placeholder="0x..."
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTrackAddress()}
        />
        <button 
          className="px-4 py-2 bg-white text-black font-semibold rounded text-xs disabled:opacity-50"
          onClick={handleTrackAddress}
          disabled={isLoading}
        >
          {isLoading ? "Carregando..." : "Rastrear Carteira"}
        </button>
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <div className="mt-2 text-red-400 text-xs">{error}</div>
      )}
      
      {/* Lista de endereços rastreados */}
      {trackedAddresses.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-white font-semibold mb-2">Endereços Rastreados</div>
          <div className="space-y-2">
            {trackedAddresses.map((addr) => (
              <div key={addr.address} className="bg-[#232328] rounded p-3 text-xs flex justify-between items-center">
                <div className="flex-1">
                  <div className="text-white font-medium">{addr.address}</div>
                  {addr.isLoading ? (
                    <div className="text-[#a1a1aa]">Carregando posições...</div>
                  ) : addr.error ? (
                    <div className="text-red-400">{addr.error}</div>
                  ) : (
                    <div className="text-[#a1a1aa]">
                      {addr.positions.length} posição(ões) encontrada(s)
                      {addr.positions.length > 0 && addr.positions[0].isSimulated && (
                        <span className="ml-2 text-amber-400">(Dados simulados)</span>
                      )}
                    </div>
                  )}
                </div>
                <button 
                  className="text-[#a1a1aa] hover:text-white p-1"
                  onClick={() => handleRemoveAddress(addr.address)}
                  title="Remover endereço"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
