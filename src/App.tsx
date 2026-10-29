import { useState, useEffect } from 'react'
import { 
  Clock, 
  Package, 
  Activity, 
  Calculator, 
  Crown, 
  Sparkles
} from 'lucide-react'
import { api } from './services/api'
import { HoraClinicaView } from './components/clinica/HoraClinicaView'

export function App() {
  const [activeTab, setActiveTab] = useState<'hora' | 'kits' | 'procedimentos' | 'simulador'>('hora')
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    // Testa a comunicacao HTTP (CORS + REST) com o backend Spring Boot
    api.get('/hora-clinica/resumo')
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
            <p className="text-xs text-text-muted mt-0.5">
              {activeTab === 'hora' && 'Configure suas contas mensais e sua agenda para descobrir seu custo exato por hora e minuto'}
              {activeTab === 'kits' && 'Cadastre kits de materiais rápidos sem complicação de estoque'}
              {activeTab === 'procedimentos' && 'Defina o preço dos seus procedimentos com margem protegida'}
              {activeTab === 'simulador' && 'Simule parcelamento, descontos no PIX e parcerias por comissão'}
            </p>
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
        <div className="p-8 max-w-6xl">
          {activeTab === 'hora' && <HoraClinicaView />}

          {activeTab === 'kits' && (
            <div className="bg-surface-card p-12 rounded-2xl border border-brand-border text-center text-text-muted">
              <Package className="w-12 h-12 text-brand-accent mx-auto mb-3" />
              <h3 className="font-bold text-text-title text-lg">Kits de Materiais (Próximo Passo)</h3>
              <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                No Baby Step 5 & 6, criaremos os cards de kits de materiais rápidos (Kit Resina, Kit Biossegurança, Kit Cirurgia) sem a burocracia de dar baixa em insumos.
              </p>
            </div>
          )}

          {activeTab === 'procedimentos' && (
            <div className="bg-surface-card p-12 rounded-2xl border border-brand-border text-center text-text-muted">
              <Activity className="w-12 h-12 text-brand-accent mx-auto mb-3" />
              <h3 className="font-bold text-text-title text-lg">Catálogo de Procedimentos & Semáforo</h3>
              <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                No Baby Step 7 & 8, ligaremos o tempo de cadeira aos kits de materiais para gerar a tabela de procedimentos com o Semáforo de Margem.
              </p>
            </div>
          )}

          {activeTab === 'simulador' && (
            <div className="bg-surface-card p-12 rounded-2xl border border-brand-border text-center text-text-muted">
              <Sparkles className="w-12 h-12 text-brand-accent mx-auto mb-3" />
              <h3 className="font-bold text-text-title text-lg">Simulador Financeiro Completo</h3>
              <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                No Baby Step 9 & 10, adicionaremos o simulador de parcelas no Cartão (1x a 12x), o cálculo de Desconto no PIX, auditoria de Convênio e Comissão de parceria.
              </p>
            </div>
          )}
        </div>

      </main>

    </div>
  )
}

export default App
