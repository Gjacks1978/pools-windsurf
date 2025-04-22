// Dados simulados para uso quando a API do The Graph não estiver disponível
// ou quando quisermos testar a funcionalidade sem fazer requisições reais

export function getMockPositionsForAddress(address: string) {
  // Endereço de exemplo que fornecemos para testes
  const isExampleAddress = address.toLowerCase() === '0x9ad1a461ca0f792f356b3dd1960a4f56ad86bf46'.toLowerCase();
  
  // Se for o endereço de exemplo, retornar dados simulados
  if (isExampleAddress) {
    return [
      {
        id: '123456',
        pool: {
          id: 'pool-eth-usdc-0.3',
          token0: { symbol: 'ETH', decimals: '18' },
          token1: { symbol: 'USDC', decimals: '6' },
          feeTier: '3000',
          tick: '202000'
        },
        tickLower: { tickIdx: '201000' },
        tickUpper: { tickIdx: '203000' },
        liquidity: '1000000000000000000',
        depositedToken0: '0.5',
        depositedToken1: '1000',
        collectedFeesToken0: '0.01',
        collectedFeesToken1: '20',
        transaction: { timestamp: '1680000000' }
      },
      {
        id: '234567',
        pool: {
          id: 'pool-wbtc-eth-0.05',
          token0: { symbol: 'WBTC', decimals: '8' },
          token1: { symbol: 'ETH', decimals: '18' },
          feeTier: '500',
          tick: '85000'
        },
        tickLower: { tickIdx: '84000' },
        tickUpper: { tickIdx: '86000' },
        liquidity: '500000000000000000',
        depositedToken0: '0.02',
        depositedToken1: '0.3',
        collectedFeesToken0: '0.0005',
        collectedFeesToken1: '0.008',
        transaction: { timestamp: '1685000000' }
      },
      {
        id: '345678',
        pool: {
          id: 'pool-link-eth-1',
          token0: { symbol: 'LINK', decimals: '18' },
          token1: { symbol: 'ETH', decimals: '18' },
          feeTier: '10000',
          tick: '-50000'
        },
        tickLower: { tickIdx: '-60000' },
        tickUpper: { tickIdx: '-40000' },
        liquidity: '2000000000000000000',
        depositedToken0: '100',
        depositedToken1: '0.2',
        collectedFeesToken0: '2.5',
        collectedFeesToken1: '0.005',
        transaction: { timestamp: '1690000000' }
      }
    ];
  }
  
  // Para qualquer outro endereço, retornar um array vazio ou dados aleatórios
  // Aqui estamos retornando um array vazio para simplificar
  return [];
}
