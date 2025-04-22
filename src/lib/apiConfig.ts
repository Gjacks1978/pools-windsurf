// Configurações para APIs externas
// Nota: Em produção, estas chaves devem estar em variáveis de ambiente (.env.local)

export const API_KEYS = {
  // Chave gratuita da Alchemy para Ethereum Mainnet
  ALCHEMY_API_KEY: "demo",
  
  // Chave para Etherscan
  ETHERSCAN_API_KEY: "YourApiKeyToken",
  
  // Chave para Infura
  INFURA_API_KEY: "YourInfuraApiKey"
};

// URLs base para as APIs
export const API_URLS = {
  // Alchemy API para Ethereum Mainnet
  ALCHEMY_ETHEREUM: "https://eth-mainnet.g.alchemy.com/v2/",
  
  // Etherscan API
  ETHERSCAN: "https://api.etherscan.io/api",
  
  // Infura API para Ethereum
  INFURA_ETHEREUM: "https://mainnet.infura.io/v3/",
  
  // Uniswap Subgraph (The Graph)
  UNISWAP_SUBGRAPH: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
};
