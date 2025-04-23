"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowRightOnRectangleIcon, 
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onImport, onExport }) => {
  const { user, signOut, loading } = useAuth();
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
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Carregar tema salvo ao inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Usar tema salvo ou preferência do sistema
    const shouldUseDarkMode = savedTheme ? JSON.parse(savedTheme) : prefersDark;
    
    setIsDarkMode(shouldUseDarkMode);
    
    if (shouldUseDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Função para fazer upload do arquivo
  const handleImportClick = () => {
    document.getElementById('file-input')?.click();
  };

  return (
    <nav className="bg-[#18181b] dark:bg-[#0c0c0e] border-b border-[#232328] py-2 px-4 fixed top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo e Título */}
        <div className="flex items-center">
          <span className="text-white text-lg font-semibold">Dashboard de Pools</span>
        </div>
        
        {/* Ícones do Menu */}
        <div className="flex items-center space-x-4">
          {/* Importar */}
          <button 
            onClick={handleImportClick}
            className="p-2 rounded-full hover:bg-[#232328] text-white transition-colors"
            title="Importar dados"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
          <input 
            id="file-input" 
            type="file" 
            accept=".json" 
            onChange={onImport} 
            className="hidden" 
          />
          
          {/* Exportar */}
          <button 
            onClick={onExport}
            className="p-2 rounded-full hover:bg-[#232328] text-white transition-colors"
            title="Exportar dados"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
          </button>
          
          {/* Alternar Tema */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[#232328] text-white transition-colors"
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
              className="p-2 rounded-full hover:bg-[#232328] text-white transition-colors"
              title="Configurações"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            
            {/* Menu de configurações */}
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#18181b] border border-[#232328]">
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-[#232328]">
                    Preferências
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-[#232328]">
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
                className="p-2 rounded-full hover:bg-[#232328] text-white transition-colors"
                title="Sair"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            ) : (
              <button 
                onClick={() => window.location.reload()}
                className="p-2 rounded-full hover:bg-[#232328] text-white transition-colors"
                title="Entrar"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
};
