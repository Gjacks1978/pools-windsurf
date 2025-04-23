"use client";
import React, { useState, useEffect } from "react";
import { DashboardCards } from "../components/DashboardCards";
import { PositionsTable } from "../components/PositionsTable";
import { AddPositionModal, Position } from "../components/AddPositionModal";
import { useAuth } from "../contexts/AuthContext";
import AuthForm from "../components/AuthForm";
import LogoutButton from "../components/LogoutButton";
import * as supabaseData from "../lib/supabaseData";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { 
  ArrowRightOnRectangleIcon, 
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  const { user, loading, signOut } = useAuth();

  const [showSaved, setShowSaved] = useState(false);
  const [importError, setImportError] = useState<string|null>(null);
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState<string|null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Função para alternar entre temas light e dark
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Salvar preferência no localStorage
    localStorage.setItem('darkMode', JSON.stringify(newTheme));
    
    // Aplicar tema ao documento
    if (newTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };
  
  // Função para fazer upload do arquivo
  const handleImportClick = () => {
    document.getElementById('file-input')?.click();
  };
  
  // Carregar tema salvo ao inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Por padrão, usar tema escuro (preferencia do usuário), mas respeitar configuração salva
    const shouldUseDarkMode = savedTheme !== null ? JSON.parse(savedTheme) : true;
    
    setIsDarkMode(shouldUseDarkMode);
    
    if (shouldUseDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, []);

  // Exporta dados como JSON
  function handleExport() {
    const data = {
      positions,
      closedPositions
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pools-dashboard-backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Importa dados de arquivo JSON
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (!data.positions || !data.closedPositions) throw new Error('Arquivo inválido');
        
        // Atualiza estado local
        setPositions(data.positions);
        setClosedPositions(data.closedPositions);
        setImportError(null);
        
        // Sincroniza com Supabase se o usuário estiver logado
        if (user) {
          try {
            setIsSaving(true);
            await supabaseData.importPositions(data.positions, data.closedPositions);
            setSyncError(null);
          } catch (error) {
            console.error('Erro ao sincronizar com Supabase:', error);
            setSyncError('Erro ao sincronizar com servidor. Os dados foram salvos localmente.');
          } finally {
            setIsSaving(false);
          }
        }
      } catch {
        setImportError('Arquivo inválido ou corrompido');
      }
    };
    reader.readAsText(file);
    // Limpa input para permitir importar o mesmo arquivo novamente se necessário
    e.target.value = '';
  }
  const [positions, setPositions] = useState<Position[]>([]);
  const [closedPositions, setClosedPositions] = useState<Position[]>([]);

  const [tab, setTab] = useState<'open'|'closed'>('open');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number|null>(null);
  const [editInitial, setEditInitial] = useState<Position|null>(null);

  async function handleAddPosition(position: Position) {
    try {
      if (editingIdx !== null) {
        // Atualiza estado local
        setPositions((prev) => prev.map((p, i) => i === editingIdx ? position : p));
        setEditingIdx(null);
        setEditInitial(null);
        
        // Sincroniza com Supabase se o usuário estiver logado
        if (user) {
          setIsSaving(true);
          await supabaseData.updatePosition(position);
        }
      } else {
        // Atualiza estado local
        setPositions((prev) => [...prev, position]);
        
        // Sincroniza com Supabase se o usuário estiver logado
        if (user) {
          setIsSaving(true);
          await supabaseData.addPosition(position);
        }
      }
      setSyncError(null);
    } catch (error) {
      console.error('Erro ao salvar posição:', error);
      setSyncError('Erro ao salvar no servidor. Os dados foram salvos localmente.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove(idx: number) {
    try {
      const positionToRemove = positions[idx];
      
      // Atualiza estado local
      setPositions((prev) => prev.filter((_, i) => i !== idx));
      
      // Sincroniza com Supabase se o usuário estiver logado
      if (user) {
        setIsSaving(true);
        await supabaseData.removePosition(positionToRemove.created);
      }
      setSyncError(null);
    } catch (error) {
      console.error('Erro ao remover posição:', error);
      setSyncError('Erro ao sincronizar com servidor. Os dados foram salvos localmente.');
    } finally {
      setIsSaving(false);
    }
  }
  async function handleClosePosition(idx: number) {
    try {
      const positionToClose = positions[idx];
      
      // Atualiza estado local
      setPositions((prevPositions) => {
        const pos = prevPositions[idx];
        setClosedPositions((prevClosed) => {
          if (prevClosed.some(p => p.created === pos.created)) return prevClosed;
          return [pos, ...prevClosed];
        });
        return prevPositions.filter((_, i) => i !== idx);
      });
      
      // Sincroniza com Supabase se o usuário estiver logado
      if (user) {
        setIsSaving(true);
        await supabaseData.closePosition(positionToClose.created);
      }
      setSyncError(null);
    } catch (error) {
      console.error('Erro ao fechar posição:', error);
      setSyncError('Erro ao sincronizar com servidor. Os dados foram salvos localmente.');
    } finally {
      setIsSaving(false);
    }
  }
  function handleDuplicate(idx: number) {
    setPositions((prev) => {
      const pos = prev[idx];
      return [...prev, { ...pos, created: new Date().toISOString() }];
    });
  }
  function handleEdit(idx: number) {
    setEditingIdx(idx);
    setEditInitial(positions[idx]);
    setModalOpen(true);
  }

  async function handleRemoveClosed(idx: number) {
    try {
      const positionToRemove = closedPositions[idx];
      
      // Atualiza estado local
      setClosedPositions((prev) => prev.filter((_, i) => i !== idx));
      
      // Sincroniza com Supabase se o usuário estiver logado
      if (user) {
        setIsSaving(true);
        await supabaseData.removePosition(positionToRemove.created);
      }
      setSyncError(null);
    } catch (error) {
      console.error('Erro ao remover posição fechada:', error);
      setSyncError('Erro ao sincronizar com servidor. Os dados foram salvos localmente.');
    } finally {
      setIsSaving(false);
    }
  }

  // Carrega dados iniciais do Supabase ou localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Primeiro carrega os dados do localStorage para garantir que temos algo para mostrar rapidamente
        loadFromLocalStorage();
        
        // Se não há um usuário logado ou o Supabase não está configurado, usamos apenas localStorage
        if (!user || !isSupabaseConfigured()) {
          if (user && !isSupabaseConfigured()) {
            console.warn('Supabase não está configurado. Usando apenas dados locais.');
          }
          return; // Retorna cedo para usar apenas dados locais
        }
        
        // Tenta carregar do Supabase apenas se o usuário estiver logado e o Supabase estiver configurado
        try {
          setIsSaving(true); // Indica que estamos carregando
          
          // Busca posições abertas e fechadas do Supabase
          const [openPositions, closedPositions] = await Promise.all([
            supabaseData.getPositions(),
            supabaseData.getClosedPositions()
          ]);
          
          // Se foram recebidos dados válidos (arrays podem estar vazios, mas devem ser arrays)
          if (Array.isArray(openPositions) && Array.isArray(closedPositions)) {
            // Só atualiza posições abertas se houver dados no Supabase
            if (openPositions.length > 0) {
              setPositions(openPositions);
              console.log('Posições abertas carregadas do Supabase');
            } else {
              console.log('Nenhuma posição aberta encontrada no Supabase. Mantendo dados locais.');
            }
            
            // Só atualiza posições fechadas se houver dados no Supabase
            if (closedPositions.length > 0) {
              setClosedPositions(closedPositions);
              console.log('Posições fechadas carregadas do Supabase');
            } else {
              console.log('Nenhuma posição fechada encontrada no Supabase. Mantendo dados locais.');
            }
            
            // Limpa mensagem de erro
            setSyncError(null);
          } else {
            // Caso ocorra algum problema com os dados, mantém o localStorage
            console.warn('Dados do servidor em formato inválido. Mantendo dados locais.');
          }
        } catch (error) {
          // Mudar para console.warn para não assustar o usuário, já que os dados locais ainda funcionam
          console.warn('Aviso: Erro ao buscar dados do Supabase. Usando dados locais.', error);
          // Não mostra mensagem de erro para o usuário já que os dados locais estão funcionando
        } finally {
          setIsSaving(false); // Fim do carregamento
        }
      } finally {
        setIsClientLoaded(true); // Marca o cliente como carregado após a tentativa de carregamento
      }
    };
    
    // Função para carregar dados do localStorage
    const loadFromLocalStorage = () => {
      const savedPositions = localStorage.getItem('positions');
      const savedClosedPositions = localStorage.getItem('closedPositions');
      
      if (savedPositions) {
        try {
          setPositions(JSON.parse(savedPositions));
        } catch {
          console.error("Failed to parse positions from localStorage");
        }
      }
      
      if (savedClosedPositions) {
        try {
          setClosedPositions(JSON.parse(savedClosedPositions));
        } catch {
          console.error("Failed to parse closedPositions from localStorage");
        }
      }
    };
    
    loadData();
  }, [user]); // Roda quando o componente é montado ou o status de autenticação muda

  // Salva posições abertas no localStorage
  useEffect(() => {
    if (isClientLoaded) { // Only save after initial client load is complete
      localStorage.setItem('positions', JSON.stringify(positions));
      
      if (!isSaving) { // Evita mostrar o aviso durante operações que já mostram feedback
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 1200);
      }
    }
  }, [positions, isClientLoaded, isSaving]); 

  // Salva posições fechadas no localStorage
  useEffect(() => {
    if (isClientLoaded) { // Only save after initial client load is complete
      localStorage.setItem('closedPositions', JSON.stringify(closedPositions));
    }
  }, [closedPositions, isClientLoaded]);

  // Cálculos das pools fechadas
  const pnlTotalFechadas = closedPositions.reduce((acc, p) => acc + (p.current + p.collected + p.uncollected - p.invested), 0);

  if (!isClientLoaded) {
    // Render a loading state or null during SSR/initial hydration
    // You can replace null with a loading spinner component if desired
    return null;
  }

  // Authentication Check
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex justify-center items-center text-white">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex justify-center items-center">
        <AuthForm />
      </div>
    );
  }



  // Render dashboard only if user is logged in
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-black dark:text-white p-6 md:p-10 flex flex-col gap-8 items-center text-base md:text-lg">
      {/* Ícones do Menu no canto superior direito */}
      <div className="fixed top-4 right-4 flex items-center space-x-2 z-50">
        {/* Importar */}
        <button 
          onClick={handleImportClick}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#232328] text-black dark:text-white transition-colors"
          title="Importar dados"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
        </button>
        <input 
          id="file-input" 
          type="file" 
          accept=".json" 
          onChange={handleImport} 
          className="hidden" 
        />
        
        {/* Exportar */}
        <button 
          onClick={handleExport}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#232328] text-black dark:text-white transition-colors"
          title="Exportar dados"
        >
          <ArrowUpTrayIcon className="h-5 w-5" />
        </button>
        
        {/* Alternar Tema */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#232328] text-black dark:text-white transition-colors"
          title={isDarkMode ? "Mudar para tema claro" : "Mudar para tema escuro"}
        >
          {isDarkMode ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>
        
        {/* Configurações */}
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#232328] text-black dark:text-white transition-colors"
            title="Configurações"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          
          {/* Menu de configurações */}
          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#18181b] border border-gray-300 dark:border-[#232328]">
              <div className="py-1">
                <a href="#" className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#232328]">
                  Preferências
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#232328]">
                  Configurações da conta
                </a>
              </div>
            </div>
          )}
        </div>
        
        {/* Auth */}
        {!loading && (
          user ? (
            <button 
              onClick={signOut}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#232328] text-black dark:text-white transition-colors"
              title="Sair"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          ) : (
            <button 
              onClick={() => window.location.reload()}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#232328] text-black dark:text-white transition-colors"
              title="Entrar"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            </button>
          )
        )}
      </div>
      
      {/* Aviso de dados salvos */}
      {showSaved && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-xl shadow-lg z-50 animate-fade-in-out">
          Dados salvos!
        </div>
      )}
      {/* Aviso de erro de importação */}
      {importError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-700 text-white px-6 py-2 rounded-xl shadow-lg z-50 animate-fade-in-out">
          {importError}
        </div>
      )}
      {/* Aviso de erro de sincronização */}
      {syncError && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 bg-yellow-600 text-white px-6 py-2 rounded-xl shadow-lg z-50 animate-fade-in-out">
          {syncError}
        </div>
      )}
      {/* Indicador de salvamento */}
      {isSaving && (
        <div className="fixed top-16 right-24 bg-blue-600 text-white px-6 py-2 rounded-xl shadow-lg z-50 animate-pulse">
          Sincronizando...
        </div>
      )}
      
      <div className="w-full max-w-7xl mb-4">
        {/* Apenas o título, sem botão de logout duplicado */}
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-black dark:text-white text-3xl md:text-4xl">Dashboard de Pools de Liquidez</div>
        </div>
        <DashboardCards positions={positions} />
      </div>
      <div className="w-full max-w-7xl mt-8">
        <div className="flex items-center justify-end mb-2">
          <button className="px-4 py-2 rounded bg-[#4b206e] hover:bg-[#3a1857] text-sm text-white font-semibold transition-colors" onClick={() => setModalOpen(true)}>+ Adicionar Posição</button>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('open')} className={`px-4 py-1 rounded ${tab==='open' ? 'bg-[#f1e6f9] dark:bg-[#4b206e] text-[#4b206e] dark:text-white' : 'bg-transparent text-gray-500 dark:text-[#a1a1aa]'} text-sm font-semibold transition-colors`}>Posições abertas ({positions.length})</button>
          <button onClick={() => setTab('closed')} className={`px-4 py-1 rounded ${tab==='closed' ? 'bg-[#f1e6f9] dark:bg-[#4b206e] text-[#4b206e] dark:text-white' : 'bg-transparent text-gray-500 dark:text-[#a1a1aa]'} text-sm font-semibold transition-colors`}>Posições fechadas ({closedPositions.length})</button>
        </div>
        {tab === 'closed' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-6">
            {/* Ganhos Totais */}
            <div className="bg-white dark:bg-[#18181b] rounded-xl p-4 flex flex-col gap-1 border border-gray-300 dark:border-[#232328] min-w-[160px]">
              <span className="text-xs text-gray-500 dark:text-[#a1a1aa] font-medium">Taxas Totais</span>
              <span className="text-2xl font-semibold text-black dark:text-white">{closedPositions.reduce((acc, p) => acc + p.collected + p.uncollected, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'USD' }).replace('US$', '$')}</span>
              <span className="text-xs text-gray-500 dark:text-[#71717a]">Taxas combinadas de todas as pools fechadas</span>
            </div>
            {/* P&L Total */}
            <div className={`${pnlTotalFechadas > 0 ? 'bg-white dark:bg-[#071f14]' : pnlTotalFechadas < 0 ? 'bg-white dark:bg-[#1f0d07]' : 'bg-white dark:bg-[#18181b]'} rounded-xl p-4 flex flex-col gap-1 border border-gray-300 dark:border-[#232328] min-w-[160px]`}>
              <span className="text-xs text-gray-500 dark:text-[#a1a1aa] font-medium">P&L Total</span>
              <span className="text-2xl font-semibold text-black dark:text-white">{pnlTotalFechadas.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' }).replace('US$', '$')}</span>
              <span className="text-xs text-gray-500 dark:text-[#71717a]">Lucro/perda combinado de todas as pools fechadas</span>
            </div>
            {/* APR Anual Total % */}
            <div className="bg-white dark:bg-[#18181b] rounded-xl p-4 flex flex-col gap-1 border border-gray-300 dark:border-[#232328] min-w-[160px]">
              <span className="text-xs text-gray-500 dark:text-[#a1a1aa] font-medium">APR Anual Total %</span>
              <span className="text-2xl font-semibold text-black dark:text-white">
                {(() => {
                  let totalInvestido = 0;
                  let totalPNL = 0;
                  let totalDias = 0;
                  closedPositions.forEach((p) => {
                    const dias = Math.max(1, (new Date().getTime() - new Date(p.created).getTime()) / (1000 * 60 * 60 * 24));
                    const invested = p.invested;
                    if (invested > 0) {
                      const pnl = p.current + p.collected + p.uncollected - invested;
                      totalPNL += pnl;
                      totalInvestido += invested;
                      totalDias += dias * invested;
                    }
                  });
                  const diasMedio = totalInvestido > 0 ? totalDias / totalInvestido : 1;
                  let aprAnual = 0;
                  if (totalInvestido > 0) {
                    const dailyRate = totalPNL / totalInvestido / diasMedio;
                    aprAnual = dailyRate * 365 * 100;
                  }
                  return totalInvestido > 0 ? aprAnual.toFixed(2) + '%' : '-';
                })()}
              </span>
              <span className="text-xs text-[#71717a]">APR anual médio ponderado das pools fechadas</span>
            </div>
          </div>
        )}
        {tab === 'open' ? (
          <>
            <PositionsTable 
              positions={positions} 
              onRemove={handleRemove} 
              onClosePosition={handleClosePosition} 
              onDuplicate={handleDuplicate} 
              onEdit={handleEdit} 
              closed={false} 
            />
          </>
        ) : (
          <PositionsTable 
            positions={closedPositions} 
            onRemove={handleRemoveClosed} 
            closed={true} 
            onRestore={async (idx) => {
              try {
                const positionToRestore = closedPositions[idx];
                
                // Atualiza estado local
                setPositions((prev) => [closedPositions[idx], ...prev]);
                setClosedPositions((prev) => prev.filter((_, i) => i !== idx));
                
                // Sincroniza com Supabase se o usuário estiver logado
                if (user) {
                  setIsSaving(true);
                  await supabaseData.restorePosition(positionToRestore.created);
                }
                setSyncError(null);
              } catch (error) {
                console.error('Erro ao restaurar posição:', error);
                setSyncError('Erro ao sincronizar com servidor. Os dados foram salvos localmente.');
              } finally {
                setIsSaving(false);
              }
            }} 
          />
        )}
      </div>
      <AddPositionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingIdx(null); setEditInitial(null); }}
        onAdd={handleAddPosition}
        initialData={editInitial}
      />

    </div>
  );
}
