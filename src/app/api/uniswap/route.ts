import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Extrair o corpo da requisição
    const body = await request.json();
    
    // Fazer a requisição para o The Graph com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
    
    try {
      const response = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Origin': 'https://app.uniswap.org',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }
      
      // Retornar os dados
      const data = await response.json();
      
      // Adicionar headers para evitar problemas de cache
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('Erro no proxy da API Uniswap:', error);
    
    // Verificar se é um erro de timeout
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const isTimeoutError = errorMessage.includes('abort') || errorMessage.includes('timeout');
    
    return NextResponse.json(
      { 
        error: isTimeoutError ? 'Timeout ao acessar a API do The Graph. Usando dados simulados.' : errorMessage,
        useSimulatedData: true 
      },
      { 
        status: isTimeoutError ? 504 : 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}
