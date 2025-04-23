'use client';

import React, { useState, useMemo } from 'react';
import { Position } from './AddPositionModal';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface ReportSectionProps {
  positions: Position[];
  closedPositions: Position[];
}

const COLORS = ['#4b206e', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const ReportSection: React.FC<ReportSectionProps> = ({ positions, closedPositions }) => {
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('all');
  const [reportType, setReportType] = useState<'pnl' | 'investments' | 'protocol' | 'fees' | 'count'>('pnl');
  
  // Função para filtrar posições por data
  const filterByDate = (pos: Position[], days: number | null) => {
    if (!days) return pos;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return pos.filter(p => new Date(p.created) >= cutoffDate);
  };
  
  // Preparar dados para os diferentes gráficos
  const data = useMemo(() => {
    // Determinar o período de filtragem
    let daysToFilter: number | null = null;
    switch (timeFilter) {
      case '7d': daysToFilter = 7; break;
      case '30d': daysToFilter = 30; break;
      case '90d': daysToFilter = 90; break;
      case '1y': daysToFilter = 365; break;
      default: daysToFilter = null;
    }
    
    const allPositions = [...positions, ...closedPositions];
    const filteredPositions = filterByDate(allPositions, daysToFilter);
    
    // Agrupar posições por dia
    const positionsByDate = filteredPositions.reduce((acc, position) => {
      const date = new Date(position.created).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          positions: [],
          invested: 0,
          pnl: 0,
          fees: 0
        };
      }
      
      acc[date].positions.push(position);
      acc[date].invested += position.invested;
      acc[date].pnl += (position.current + position.collected + position.uncollected - position.invested);
      acc[date].fees += (position.collected + position.uncollected);
      
      return acc;
    }, {} as Record<string, { positions: Position[], invested: number, pnl: number, fees: number }>);
    
    // Converter para array e ordenar por data
    const timelineData = Object.entries(positionsByDate).map(([date, data]) => ({
      date,
      invested: data.invested,
      pnl: data.pnl,
      fees: data.fees,
      count: data.positions.length
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Acumular valores ao longo do tempo
    const cumulativeData = timelineData.reduce((acc, item, index) => {
      if (index === 0) {
        acc.push({
          ...item,
          cumulativePnl: item.pnl,
          cumulativeFees: item.fees,
          cumulativeInvested: item.invested
        });
      } else {
        const prevItem = acc[index - 1];
        acc.push({
          ...item,
          cumulativePnl: prevItem.cumulativePnl + item.pnl,
          cumulativeFees: prevItem.cumulativeFees + item.fees,
          cumulativeInvested: prevItem.cumulativeInvested + item.invested
        });
      }
      return acc;
    }, [] as Array<{
      date: string;
      invested: number;
      pnl: number;
      fees: number;
      count: number;
      cumulativePnl: number;
      cumulativeFees: number;
      cumulativeInvested: number;
    }>);
    
    // Agrupar por DEX (usando dex como protocolo)
    const protocolData = filteredPositions.reduce((acc, position) => {
      const protocol = position.dex || 'Desconhecido';
      if (!acc[protocol]) {
        acc[protocol] = {
          count: 0,
          invested: 0,
          pnl: 0,
          fees: 0
        };
      }
      
      acc[protocol].count += 1;
      acc[protocol].invested += position.invested;
      acc[protocol].pnl += (position.current + position.collected + position.uncollected - position.invested);
      acc[protocol].fees += (position.collected + position.uncollected);
      
      return acc;
    }, {} as Record<string, { count: number, invested: number, pnl: number, fees: number }>);
    
    const protocolChartData = Object.entries(protocolData).map(([name, data]) => ({
      name,
      value: reportType === 'pnl' ? data.pnl : 
             reportType === 'investments' ? data.invested : 
             reportType === 'fees' ? data.fees : data.count
    }));
    
    return {
      timeline: cumulativeData,
      protocols: protocolChartData
    };
  }, [positions, closedPositions, timeFilter, reportType]);
  
  // Criar estatísticas resumidas
  const stats = useMemo(() => {
    const allPositions = [...positions, ...closedPositions];
    
    // Total investido
    const totalInvested = allPositions.reduce((sum, pos) => sum + pos.invested, 0);
    
    // Total P&L
    const totalPnL = allPositions.reduce((sum, pos) => 
      sum + (pos.current + pos.collected + pos.uncollected - pos.invested), 0);
    
    // Total taxas
    const totalFees = allPositions.reduce((sum, pos) => sum + pos.collected + pos.uncollected, 0);
    
    // APR médio
    let totalWeightedAPR = 0;
    let totalWeight = 0;
    
    allPositions.forEach(pos => {
      if (pos.invested <= 0) return;
      
      const days = Math.max(1, (new Date().getTime() - new Date(pos.created).getTime()) / (1000 * 60 * 60 * 24));
      const pnl = pos.current + pos.collected + pos.uncollected - pos.invested;
      const dailyRate = pnl / pos.invested / days;
      const annualRate = dailyRate * 365 * 100; // APR em percentual
      
      totalWeightedAPR += annualRate * pos.invested;
      totalWeight += pos.invested;
    });
    
    const avgAPR = totalWeight > 0 ? totalWeightedAPR / totalWeight : 0;
    
    return {
      totalInvested,
      totalPnL,
      totalFees,
      avgAPR,
      totalPositions: allPositions.length,
      openPositions: positions.length,
      closedPositions: closedPositions.length
    };
  }, [positions, closedPositions]);
  
  // Formatar valor como moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'USD' 
    }).replace('US$', '$');
  };
  
  // Formatar percentual
  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Relatórios & Análises</h2>
      
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="bg-white dark:bg-[#18181b] rounded-xl p-3 border border-gray-300 dark:border-[#232328]">
          <h3 className="text-sm font-semibold mb-2 text-black dark:text-white">Período</h3>
          <div className="flex gap-2">
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: '1y', label: '1A' },
              { id: 'all', label: 'Tudo' }
            ].map(period => (
              <button
                key={period.id}
                onClick={() => setTimeFilter(period.id as '7d' | '30d' | '90d' | '1y' | 'all')}
                className={`px-3 py-1 text-xs rounded ${
                  timeFilter === period.id 
                    ? 'bg-[#4b206e] text-white' 
                    : 'bg-gray-100 dark:bg-[#232328] text-black dark:text-white'
                } transition-colors`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#18181b] rounded-xl p-3 border border-gray-300 dark:border-[#232328]">
          <h3 className="text-sm font-semibold mb-2 text-black dark:text-white">Métrica</h3>
          <div className="flex gap-2">
            {[
              { id: 'pnl', label: 'P&L' },
              { id: 'investments', label: 'Investimentos' },
              { id: 'fees', label: 'Taxas' },
              { id: 'protocol', label: 'Protocolos' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id as 'pnl' | 'investments' | 'fees' | 'count')}
                className={`px-3 py-1 text-xs rounded ${
                  reportType === type.id 
                    ? 'bg-[#4b206e] text-white' 
                    : 'bg-gray-100 dark:bg-[#232328] text-black dark:text-white'
                } transition-colors`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#18181b] rounded-xl p-4 border border-gray-300 dark:border-[#232328]">
          <h3 className="text-xs text-gray-500 dark:text-[#a1a1aa] font-medium">Posições Totais</h3>
          <p className="text-2xl font-semibold text-black dark:text-white">{stats.totalPositions}</p>
          <p className="text-xs text-gray-500 dark:text-[#71717a]">
            {stats.openPositions} ativas / {stats.closedPositions} fechadas
          </p>
        </div>
        
        <div className={`rounded-xl p-4 border ${stats.totalPnL >= 0 ? 'bg-green-50 dark:bg-[#071f14] border-green-200 dark:border-[#232328]' : 'bg-red-50 dark:bg-[#1f0d07] border-red-200 dark:border-[#232328]'}`}>
          <h3 className="text-xs text-gray-500 dark:text-[#a1a1aa] font-medium">Lucro/Prejuízo Total</h3>
          <p className="text-2xl font-semibold text-black dark:text-white">{formatCurrency(stats.totalPnL)}</p>
          <p className="text-xs text-gray-500 dark:text-[#71717a]">
            {formatPercent(stats.totalInvested > 0 ? (stats.totalPnL / stats.totalInvested) * 100 : 0)} do investimento
          </p>
        </div>
        
        <div className="bg-white dark:bg-[#18181b] rounded-xl p-4 border border-gray-300 dark:border-[#232328]">
          <h3 className="text-xs text-gray-500 dark:text-[#a1a1aa] font-medium">Capital Investido</h3>
          <p className="text-2xl font-semibold text-black dark:text-white">{formatCurrency(stats.totalInvested)}</p>
          <p className="text-xs text-gray-500 dark:text-[#71717a]">
            Total acumulado
          </p>
        </div>
        
        <div className="bg-white dark:bg-[#18181b] rounded-xl p-4 border border-gray-300 dark:border-[#232328]">
          <h3 className="text-xs text-gray-500 dark:text-[#a1a1aa] font-medium">APR Médio</h3>
          <p className="text-2xl font-semibold text-black dark:text-white">{formatPercent(stats.avgAPR)}</p>
          <p className="text-xs text-gray-500 dark:text-[#71717a]">
            Média ponderada pelo capital
          </p>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Gráfico principal - linha temporal */}
        <div className="bg-white dark:bg-[#18181b] rounded-xl p-4 border border-gray-300 dark:border-[#232328]">
          <h3 className="text-sm font-semibold mb-4 text-black dark:text-white">
            {reportType === 'pnl' ? 'Evolução do P&L ao Longo do Tempo' : 
             reportType === 'investments' ? 'Capital Investido ao Longo do Tempo' :
             'Taxas Acumuladas ao Longo do Tempo'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.timeline}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getDate()}/${d.getMonth()+1}`;
                  }}
                  stroke="#888"
                />
                <YAxis 
                  tickFormatter={(value) => 
                    value >= 1000 ? `$${(value/1000).toFixed(1)}k` : `$${value}`
                  }
                  stroke="#888"
                />
                <Tooltip 
                  formatter={(value: number) => [`${formatCurrency(value)}`, '']}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString('pt-BR');
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey={
                    reportType === 'pnl' ? 'cumulativePnl' : 
                    reportType === 'investments' ? 'cumulativeInvested' : 
                    'cumulativeFees'
                  } 
                  name={
                    reportType === 'pnl' ? 'P&L Acumulado' : 
                    reportType === 'investments' ? 'Investimento Acumulado' : 
                    'Taxas Acumuladas'
                  }
                  stroke="#4b206e" 
                  fill="#4b206e" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico secundário - distribuição por protocolo */}
        <div className="bg-white dark:bg-[#18181b] rounded-xl p-4 border border-gray-300 dark:border-[#232328]">
          <h3 className="text-sm font-semibold mb-4 text-black dark:text-white">
            Distribuição por Protocolo
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.protocols}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.protocols.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    reportType === 'pnl' ? formatCurrency(value) : 
                    reportType === 'investments' ? formatCurrency(value) : 
                    reportType === 'fees' ? formatCurrency(value) : 
                    value.toString(),
                    reportType === 'pnl' ? 'P&L' : 
                    reportType === 'investments' ? 'Investido' : 
                    reportType === 'fees' ? 'Taxas' : 
                    'Posições'
                  ] as [string, string]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico adicional - comparação mensal */}
        <div className="bg-white dark:bg-[#18181b] rounded-xl p-4 border border-gray-300 dark:border-[#232328] xl:col-span-2">
          <h3 className="text-sm font-semibold mb-4 text-black dark:text-white">
            Comparação Mensal
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.timeline}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getDate()}/${d.getMonth()+1}`;
                  }}
                  stroke="#888"
                />
                <YAxis 
                  tickFormatter={(value) => 
                    value >= 1000 ? `$${(value/1000).toFixed(1)}k` : `$${value}`
                  }
                  stroke="#888"
                />
                <Tooltip 
                  formatter={(value: number) => [`${formatCurrency(value)}`, '']}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString('pt-BR');
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="pnl" 
                  name="P&L Diário" 
                  fill="#4b206e" 
                />
                <Bar 
                  dataKey="fees" 
                  name="Taxas Diárias" 
                  fill="#82ca9d" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSection;
