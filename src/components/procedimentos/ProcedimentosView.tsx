import React, { useState, useEffect, useMemo } from 'react'
import { 
  Activity, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Package, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info
} from 'lucide-react'
import { api } from '../../services/api'
import type { Procedimento, ProcedimentoFormData, StatusSemaforo } from '../../types/procedimento'
import type { KitMaterial } from '../../types/kit'

export function ProcedimentosView() {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  const [kits, setKits] = useState<KitMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | StatusSemaforo>('TODOS')
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  // Modal State
  const [modalAberto, setModalAberto] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  // Form State
  const [formNome, setFormNome] = useState('')
  const [formCodigoTuss, setFormCodigoTuss] = useState('')
  const [formTempoMinutos, setFormTempoMinutos] = useState('45')
  const [formKitMaterialId, setFormKitMaterialId] = useState<string>('')
  const [formCustoProtetico, setFormCustoProtetico] = useState('0,00')
  const [formMargemLucro, setFormMargemLucro] = useState('30,00')
  const [formPrecoPraticado, setFormPrecoPraticado] = useState('')

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [resProc, resKits] = await Promise.all([
        api.get<Procedimento[]>('/procedimentos'),
        api.get<KitMaterial[]>('/kits-materiais')
      ])
      setProcedimentos(resProc.data)
      setKits(resKits.data)
    } catch {
      setFeedbackMsg({
        tipo: 'erro',
        texto: 'Não foi possível carregar os procedimentos ou kits. Verifique se o backend está online.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const formatCurrency = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00'
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  // Métricas do Topo
  const metricas = useMemo(() => {
    const total = procedimentos.length
    const verdes = procedimentos.filter(p => p.statusSemaforo === 'VERDE').length
    const amarelos = procedimentos.filter(p => p.statusSemaforo === 'AMARELO').length
    const vermelhos = procedimentos.filter(p => p.statusSemaforo === 'VERMELHO').length
    return { total, verdes, amarelos, vermelhos }
  }, [procedimentos])

  // Filtragem
  const procedimentosFiltrados = useMemo(() => {
    return procedimentos.filter(p => {
      const matchBusca = 
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (p.codigoTuss && p.codigoTuss.includes(busca))
      
      const matchStatus = filtroStatus === 'TODOS' || p.statusSemaforo === filtroStatus
      return matchBusca && matchStatus
    })
  }, [procedimentos, busca, filtroStatus])

  // Abre Modal de Criação
  const handleNovoProcedimento = () => {
    setEditingId(null)
    setFormNome('')
    setFormCodigoTuss('')
    setFormTempoMinutos('45')
    setFormKitMaterialId('')
    setFormCustoProtetico('0,00')
    setFormMargemLucro('30,00')
    setFormPrecoPraticado('')
    setModalAberto(true)
  }

  // Abre Modal de Edição
  const handleEditarProcedimento = (p: Procedimento) => {
    setEditingId(p.id)
    setFormNome(p.nome)
    setFormCodigoTuss(p.codigoTuss || '')
    setFormTempoMinutos(p.tempoMinutos.toString())
    setFormKitMaterialId(p.kitMaterialId || '')
    setFormCustoProtetico(p.custoProtetico.toFixed(2).replace('.', ','))
    setFormMargemLucro('30,00')
    setFormPrecoPraticado(p.precoPraticado ? p.precoPraticado.toFixed(2).replace('.', ',') : '')
    setModalAberto(true)
  }

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formNome.trim() || !formTempoMinutos) return

    setSalvando(true)
    setFeedbackMsg(null)

    const precoPraticadoNum = formPrecoPraticado ? parseFloat(formPrecoPraticado.replace(',', '.')) : undefined
    const custoProteticoNum = formCustoProtetico ? parseFloat(formCustoProtetico.replace(',', '.')) : 0
    const margemNum = formMargemLucro ? parseFloat(formMargemLucro.replace(',', '.')) : 30

    const payload: ProcedimentoFormData = {
      nome: formNome.trim(),
      codigoTuss: formCodigoTuss.trim() || undefined,
      tempoMinutos: parseInt(formTempoMinutos, 10),
      kitMaterialId: formKitMaterialId || undefined,
      custoProtetico: isNaN(custoProteticoNum) ? 0 : custoProteticoNum,
      precoPraticado: isNaN(precoPraticadoNum || NaN) ? undefined : precoPraticadoNum,
      margemLucroDesejada: isNaN(margemNum) ? 30 : margemNum
    }

    try {
      if (editingId) {
        await api.put(`/procedimentos/${editingId}`, payload)
        setFeedbackMsg({ tipo: 'sucesso', texto: 'Procedimento atualizado e recalculado com sucesso!' })
      } else {
        await api.get('/procedimentos') // refresh base
        await api.post('/procedimentos', payload)
        setFeedbackMsg({ tipo: 'sucesso', texto: 'Novo procedimento precificado e cadastrado com sucesso!' })
      }
      setModalAberto(false)
      carregarDados()
    } catch {
      setFeedbackMsg({
        tipo: 'erro',
        texto: 'Erro ao salvar procedimento. Verifique os valores informados.'
      })
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async (id: string, nome: string) => {
    if (!window.confirm(`Deseja realmente desativar o procedimento "${nome}"?`)) return

    try {
      await api.delete(`/procedimentos/${id}`)
      setFeedbackMsg({ tipo: 'sucesso', texto: `Procedimento "${nome}" removido do catálogo ativo.` })
      carregarDados()
    } catch {
      setFeedbackMsg({ tipo: 'erro', texto: 'Erro ao remover procedimento.' })
    }
  }

  return (
    <div className="space-y-6">

      {/* Alerta de Feedback */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm shadow-xs transition-all ${
          feedbackMsg.tipo === 'sucesso' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center space-x-2">
            {feedbackMsg.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="font-medium">{feedbackMsg.texto}</span>
          </div>
          <button 
            onClick={() => setFeedbackMsg(null)}
            className="text-xs font-bold hover:opacity-70 p-1"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Header com Cards de Visão Geral (Semáforo Inteligente) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-surface-card p-5 rounded-2xl border border-brand-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Total no Catálogo</span>
            <div className="text-2xl font-extrabold text-text-title mt-1">{metricas.total}</div>
            <span className="text-[11px] text-text-muted mt-0.5 block">Procedimentos ativos</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Verde */}
        <div className="bg-surface-card p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Margem Saudável</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">{metricas.verdes}</div>
            <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Gerando lucro livre real</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Amarelo */}
        <div className="bg-surface-card p-5 rounded-2xl border border-amber-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Atenção / Apertado</span>
            </div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">{metricas.amarelos}</div>
            <span className="text-[11px] text-amber-600/80 mt-0.5 block">Sem prejuízo, mas lucro baixo</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
        </div>

        {/* Vermelho */}
        <div className="bg-surface-card p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Prejuízo Oculto</span>
            </div>
            <div className="text-2xl font-extrabold text-rose-700 mt-1">{metricas.vermelhos}</div>
            <span className="text-[11px] text-rose-600/80 mt-0.5 block">Cobrando abaixo do custo</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Busca e Ação */}
      <div className="bg-surface-card p-4 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Campo de Busca */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Buscar por nome ou código TUSS..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm text-text-body placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-active"
          />
        </div>

        {/* Filtros por Semáforo */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setFiltroStatus('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filtroStatus === 'TODOS'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'bg-surface-app text-text-muted hover:bg-slate-200'
            }`}
          >
            Todos ({metricas.total})
          </button>
          <button
            onClick={() => setFiltroStatus('VERDE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filtroStatus === 'VERDE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Saudáveis ({metricas.verdes})</span>
          </button>
          <button
            onClick={() => setFiltroStatus('AMARELO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filtroStatus === 'AMARELO'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Atenção ({metricas.amarelos})</span>
          </button>
          <button
            onClick={() => setFiltroStatus('VERMELHO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filtroStatus === 'VERMELHO'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Prejuízo ({metricas.vermelhos})</span>
          </button>
        </div>

        {/* Botão Novo Procedimento */}
        <button
          onClick={handleNovoProcedimento}
          className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-active transition-all shadow-md flex items-center justify-center space-x-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Procedimento</span>
        </button>
      </div>

      {/* Tabela Inteligente com Semáforo */}
      <div className="bg-surface-card rounded-2xl border border-brand-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-muted">
            <Activity className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-active" />
            <p className="text-sm font-semibold">Calculando custos e margens da clínica...</p>
          </div>
        ) : procedimentosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h4 className="font-bold text-text-title text-base">Nenhum procedimento encontrado</h4>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              {busca ? 'Tente buscar com outro termo ou limpe o filtro.' : 'Comece cadastrando seu primeiro procedimento com tempo de cadeira e materiais.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-brand-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Procedimento</th>
                  <th className="py-3.5 px-4">Tempo Cadeira</th>
                  <th className="py-3.5 px-4">Kit de Materiais</th>
                  <th className="py-3.5 px-4">Custo Direto</th>
                  <th className="py-3.5 px-4">Preço Mínimo</th>
                  <th className="py-3.5 px-4">Preço Sugerido</th>
                  <th className="py-3.5 px-4">Preço Cobrado</th>
                  <th className="py-3.5 px-4 text-center">Diagnóstico / Margem</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {procedimentosFiltrados.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Procedimento */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-text-title leading-snug">{p.nome}</div>
                        {p.codigoTuss && (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            TUSS {p.codigoTuss}
                          </span>
                        )}
                      </td>

                      {/* Tempo Cadeira */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 text-text-body font-medium">
                          <Clock className="w-3.5 h-3.5 text-text-muted" />
                          <span>{p.tempoMinutos} min</span>
                        </div>
                      </td>

                      {/* Kit Usado */}
                      <td className="py-4 px-4">
                        {p.kitMaterialNome ? (
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-brand-primary text-xs font-semibold border border-purple-100 max-w-[180px] truncate">
                            <Package className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{p.kitMaterialNome}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted font-normal italic">
                            Apenas Biossegurança
                          </span>
                        )}
                      </td>

                      {/* Custo Direto (com detalhe) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-text-title">{formatCurrency(p.custoDiretoTotal)}</div>
                        <div className="text-[10px] text-text-muted">
                          Cadeira: {formatCurrency(p.custoTempoClinico)}
                        </div>
                      </td>

                      {/* Preço Mínimo (Breakeven) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">{formatCurrency(p.precoMinimo)}</div>
                        <span className="text-[10px] text-text-muted">Cobre custos</span>
                      </td>

                      {/* Preço Sugerido (Markup) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-brand-primary">{formatCurrency(p.precoSugerido)}</div>
                        <span className="text-[10px] text-brand-primary/80">Meta ideal</span>
                      </td>

                      {/* Preço Cobrado Atualmente */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {p.precoPraticado ? (
                          <div className="font-extrabold text-base text-text-title">
                            {formatCurrency(p.precoPraticado)}
                          </div>
                        ) : (
                          <span className="text-xs text-rose-500 font-semibold italic">Não informado</span>
                        )}
                      </td>

                      {/* Semáforo de Margem */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {p.statusSemaforo === 'VERDE' && (
                          <div className="inline-flex flex-col items-center px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="text-xs font-extrabold flex items-center space-x-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>Margem Saudável</span>
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                              Lucro: +{formatCurrency(p.lucroEstimadoReais)} ({p.margemRealPercentual}%)
                            </span>
                          </div>
                        )}

                        {p.statusSemaforo === 'AMARELO' && (
                          <div className="inline-flex flex-col items-center px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="text-xs font-extrabold flex items-center space-x-1">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              <span>Atenção</span>
                            </span>
                            <span className="text-[10px] font-semibold text-amber-700 mt-0.5">
                              Lucro: +{formatCurrency(p.lucroEstimadoReais)} ({p.margemRealPercentual}%)
                            </span>
                          </div>
                        )}

                        {p.statusSemaforo === 'VERMELHO' && (
                          <div className="inline-flex flex-col items-center px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
                            <span className="text-xs font-extrabold flex items-center space-x-1">
                              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                              <span>Prejuízo Oculto</span>
                            </span>
                            <span className="text-[10px] font-bold text-rose-700 mt-0.5">
                              Abaixo do ponto de custo!
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEditarProcedimento(p)}
                            title="Editar procedimento"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-primary hover:bg-purple-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExcluir(p.id, p.nome)}
                            title="Remover procedimento"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição Inteligente */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-card rounded-2xl border border-brand-border shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header do Modal */}
            <div className="p-6 border-b border-brand-border flex items-center justify-between sticky top-0 bg-surface-card z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-primary flex items-center justify-center font-bold">
                  🦷
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-text-title">
                    {editingId ? 'Editar Procedimento' : 'Novo Procedimento'}
                  </h3>
                  <p className="text-xs text-text-muted">
                    Vincule o tempo de cadeira e materiais para calcular a margem exata.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="p-2 rounded-xl text-text-muted hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              
              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-text-title uppercase tracking-wider mb-1.5">
                  Nome do Procedimento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Restauração Resina Composta 1 Face"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-active"
                />
              </div>

              {/* TUSS + Tempo de Cadeira */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-title uppercase tracking-wider mb-1.5">
                    Código TUSS (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 31001258"
                    value={formCodigoTuss}
                    onChange={(e) => setFormCodigoTuss(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-active"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-title uppercase tracking-wider mb-1.5">
                    Tempo de Cadeira (Minutos) *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Ex: 45"
                      value={formTempoMinutos}
                      onChange={(e) => setFormTempoMinutos(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-active"
                    />
                  </div>
                </div>
              </div>

              {/* Kit de Materiais */}
              <div>
                <label className="block text-xs font-bold text-text-title uppercase tracking-wider mb-1.5">
                  Kit de Materiais
                </label>
                <select
                  value={formKitMaterialId}
                  onChange={(e) => setFormKitMaterialId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-active"
                >
                  <option value="">Apenas Biossegurança Padrão (Sem kit específico)</option>
                  {kits.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nome} ({formatCurrency(k.custoEstimado)})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-text-muted mt-1 block">
                  O custo do kit é somado automaticamente ao custo do tempo clínico da cadeira.
                </span>
              </div>

              {/* Protético + Margem Desejada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-title uppercase tracking-wider mb-1.5">
                    Custo de Protético / Terceiros (R$)
                  </label>
                  <div className="relative">
                    <span className="text-xs font-bold text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2">R$</span>
                    <input
                      type="text"
                      placeholder="0,00"
                      value={formCustoProtetico}
                      onChange={(e) => setFormCustoProtetico(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-active"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-title uppercase tracking-wider mb-1.5">
                    Margem de Lucro Alvo (%)
                  </label>
                  <div className="relative">
                    <span className="text-xs font-bold text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2">%</span>
                    <input
                      type="text"
                      placeholder="30,00"
                      value={formMargemLucro}
                      onChange={(e) => setFormMargemLucro(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-active"
                    />
                  </div>
                </div>
              </div>

              {/* Preço Praticado */}
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <label className="block text-xs font-extrabold text-brand-primary uppercase tracking-wider mb-1.5">
                  Preço que você cobra atualmente (R$)
                </label>
                <div className="relative">
                  <span className="text-sm font-bold text-brand-primary absolute left-3.5 top-1/2 -translate-y-1/2">R$</span>
                  <input
                    type="text"
                    placeholder="Ex: 220,00"
                    value={formPrecoPraticado}
                    onChange={(e) => setFormPrecoPraticado(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-purple-200 rounded-xl text-base font-extrabold text-text-title focus:outline-none focus:ring-2 focus:ring-brand-active shadow-xs"
                  />
                </div>
                <span className="text-[11px] text-text-muted mt-1.5 block">
                  O sistema comparará esse valor com o preço mínimo e sugerido para acender o Semáforo de Margem.
                </span>
              </div>

              {/* Rodapé do Modal com Ações */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-5 py-2.5 rounded-xl border border-brand-border font-semibold text-sm text-text-muted hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-active transition-all shadow-md flex items-center space-x-2 disabled:opacity-60"
                >
                  {salvando ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      <span>Salvando e calculando...</span>
                    </>
                  ) : (
                    <span>{editingId ? 'Salvar Alterações' : 'Cadastrar Procedimento'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
