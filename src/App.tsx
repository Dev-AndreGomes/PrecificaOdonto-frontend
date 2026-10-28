import { useState, useEffect } from 'react'
import { 
  Clock, 
  Package, 
  Activity, 
  Calculator, 
  Crown, 
  TrendingUp, 
  CheckCircle2, 
  Plus, 
  ArrowUpRight, 
  ShieldCheck, 
  Stethoscope 
} from 'lucide-react'
import { api } from './services/api'

export function App() {
  const [activeTab, setActiveTab] = useState<'hora' | 'kits' | 'procedimentos' | 'simulador'>('hora')
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    // Testa a comunicacao HTTP (CORS + REST) com o backend Spring Boot
    api.post('/calculos/hora-clinica', {
      diasTrabalhoSemana: 5,
      horasPorDia: 8,
      percentualOciosidade: 20,
      metaSalarialLiquida: 10000,
      custosFixosMensais: 3500,
      custoSublocacaoPorHora: 0
    })
      .then((res) => {
        if (res.status === 200) {
          setBackendStatus('online')
        }
      })
      .catch(() => {
        setBackendStatus('offline')
      })
  }, [])

  return (
    <div className="min-h-screen flex bg-surface-app text-text-body font-sans">
      
      {/* Sidebar com a cor primária #3B2349 */}
      <aside className="w-64 bg-brand-sidebar text-white flex flex-col justify-between shadow-xl flex-shrink-0">
        <div>
          {/* Logo e Branding */}
          <div className="p-6 border-b border-white/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-active flex items-center justify-center text-white shadow-md text-xl">
              🦷
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white leading-tight tracking-tight">PrecificaOdonto</h1>
              <span className="text-[11px] text-white/60 font-medium block">Gestão Solo & Precificação</span>
            </div>
          </div>

          {/* Menu de Navegação */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('hora')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'hora'
                  ? 'bg-brand-active text-white shadow-md'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 text-brand-accent" />
              <span>Minha Hora Clínica</span>
            </button>

            <button
              onClick={() => setActiveTab('kits')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'kits'
                  ? 'bg-brand-active text-white shadow-md'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-brand-accent" />
              <span>Kits de Materiais</span>
            </button>

            <button
              onClick={() => setActiveTab('procedimentos')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'procedimentos'
                  ? 'bg-brand-active text-white shadow-md'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 text-brand-accent" />
              <span>Procedimentos & Preços</span>
            </button>

            <button
              onClick={() => setActiveTab('simulador')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'simulador'
                  ? 'bg-brand-active text-white shadow-md'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4 text-brand-accent" />
              <span>Simulador Financeiro</span>
            </button>
          </nav>
        </div>

        {/* Card VIP da Dentista */}
        <div className="p-4 m-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center space-x-2 text-status-vip mb-1">
            <Crown className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Acesso VIP Lifetime</span>
          </div>
          <p className="text-xs text-white/90 font-semibold">Usuário Teste</p>
          <span className="text-[10px] text-white/50 block mt-0.5">CRO 00000 &bull; Plano Vitalício</span>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header Superior com Status de Conexão em Tempo Real */}
        <header className="h-18 bg-surface-card border-b border-brand-border px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-text-title tracking-tight">
              {activeTab === 'hora' && 'Minha Hora Clínica & Estrutura'}
              {activeTab === 'kits' && 'Kits de Materiais do Consultório'}
              {activeTab === 'procedimentos' && 'Tabela de Procedimentos & Preços'}
              {activeTab === 'simulador' && 'Simulador de Pagamentos & Parcerias'}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">Visão estratégica da rentabilidade dos seus atendimentos</p>
          </div>

          <div className="flex items-center space-x-3">
            {backendStatus === 'online' && (
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center space-x-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Conectado ao Backend (Porta 8080)</span>
              </span>
            )}
            {backendStatus === 'offline' && (
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 flex items-center space-x-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Backend Offline (Porta 8080)</span>
              </span>
            )}
            {backendStatus === 'checking' && (
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping"></span>
                <span>Verificando conexão...</span>
              </span>
            )}
          </div>
        </header>

        {/* Área de Conteúdo */}
        <div className="p-8 space-y-6 max-w-6xl">
          
          {/* Banner de Boas-vindas do Consultório */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-sidebar to-brand-primary text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-white/20 text-white text-[11px] font-bold tracking-wide uppercase flex items-center space-x-1">
                  <Stethoscope className="w-3 h-3" />
                  <span>Painel do Dentista Solo</span>
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Controle Financeiro & Precificação Exata</h3>
              <p className="text-xs text-white/80 max-w-xl leading-relaxed">
                Calcule o valor real da sua hora de atendimento, proteja sua margem de lucro contra taxas de maquininha e saiba exatamente quanto cobrar em cada consulta.
              </p>
            </div>
            <button className="px-5 py-2.5 rounded-xl bg-white text-brand-primary font-bold text-xs shadow-md hover:bg-white/90 transition flex items-center space-x-1.5 flex-shrink-0">
              <span>Configurar Estrutura</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cards de Métricas Reais do Consultório */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card Custo Hora Clínica */}
            <div className="bg-surface-card p-5 rounded-2xl border border-brand-border shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-brand-primary mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Hora Clínica</span>
                  <Clock className="w-4 h-4 text-brand-accent" />
                </div>
                <span className="text-2xl font-extrabold text-text-title block">R$ 98,50</span>
              </div>
              <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between text-xs text-text-muted">
                <span>Minuto clínico</span>
                <span className="font-bold text-text-title">R$ 1,64 / min</span>
              </div>
            </div>

            {/* Card Meta Mensal */}
            <div className="bg-surface-card p-5 rounded-2xl border border-brand-border shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-status-profit mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Pró-labore Alvo</span>
                  <TrendingUp className="w-4 h-4 text-status-profit" />
                </div>
                <span className="text-2xl font-extrabold text-status-profit block">R$ 10.000</span>
              </div>
              <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between text-xs text-text-muted">
                <span>Horas produtivas</span>
                <span className="font-bold text-text-title">138h / mês</span>
              </div>
            </div>

            {/* Card Saúde da Tabela de Preços */}
            <div className="bg-surface-card p-5 rounded-2xl border border-brand-border shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-status-profit mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Saúde de Preços</span>
                  <CheckCircle2 className="w-4 h-4 text-status-profit" />
                </div>
                <span className="text-2xl font-extrabold text-text-title block">12 de 15</span>
              </div>
              <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between text-xs text-text-muted">
                <span>Com margem saudável</span>
                <span className="font-bold text-status-profit">80% da tabela</span>
              </div>
            </div>

            {/* Card Selo VIP */}
            <div className="bg-surface-card p-5 rounded-2xl border border-brand-border shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-status-vip mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Licença</span>
                  <Crown className="w-4 h-4 text-status-vip" />
                </div>
                <span className="text-2xl font-extrabold text-status-vip block">Vitalícia</span>
              </div>
              <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between text-xs text-text-muted">
                <span>Status de cobrança</span>
                <span className="font-bold text-text-title flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-status-profit" />
                  Isenta
                </span>
              </div>
            </div>

          </div>

          {/* Barra de Ações Rápidas */}
          <div className="bg-surface-card p-6 rounded-2xl border border-brand-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-badge flex items-center justify-center text-brand-primary flex-shrink-0">
                <Calculator className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h4 className="font-bold text-text-title text-sm">Gerenciamento Rápido do Consultório</h4>
                <p className="text-xs text-text-muted">Cadastre despesas mensais, configure kits de materiais ou adicione novos procedimentos</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button 
                onClick={() => setActiveTab('kits')}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-brand-secondary hover:bg-brand-secondary/90 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Kit de Material</span>
              </button>
              <button 
                onClick={() => setActiveTab('procedimentos')}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Precificar Procedimento</span>
              </button>
            </div>
          </div>

        </div>

      </main>

    </div>
  )
}

export default App
