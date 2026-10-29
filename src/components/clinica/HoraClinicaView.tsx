import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Percent, 
  Trash2, 
  Plus, 
  Save, 
  Check, 
  AlertCircle,
  HelpCircle,
  Building2
} from 'lucide-react'
import { api } from '../../services/api'
import type { ResumoHoraClinica, ConfigClinica } from '../../types/clinica'

export function HoraClinicaView() {
  const [resumo, setResumo] = useState<ResumoHoraClinica | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingRotina, setSavingRotina] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  // Estado do formulário de rotina
  const [formRotina, setFormRotina] = useState<Partial<ConfigClinica>>({
    diasTrabalhoSemana: 5,
    horasPorDia: 8,
    percentualOciosidade: 20,
    metaSalarialLiquida: 10000,
    custoSublocacaoPorHora: 0
  })

  // Estado para novo custo fixo
  const [novoCustoNome, setNovoCustoNome] = useState('')
  const [novoCustoValor, setNovoCustoValor] = useState('')
  const [salvandoCusto, setSalvandoCusto] = useState(false)

  const carregarDados = async () => {
    try {
      setLoading(true)
      const res = await api.get<ResumoHoraClinica>('/hora-clinica/resumo')
      setResumo(res.data)
      setFormRotina(res.data.config)
    } catch {
      setFeedbackMsg({
        tipo: 'erro',
        texto: 'Não foi possível carregar os dados. Verifique se o backend está rodando na porta 8080.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return 'R$ 0,00'
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleSalvarRotina = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingRotina(true)
    setFeedbackMsg(null)

    try {
      await api.put('/config-clinica', {
        diasTrabalhoSemana: Number(formRotina.diasTrabalhoSemana),
        horasPorDia: Number(formRotina.horasPorDia),
        percentualOciosidade: Number(formRotina.percentualOciosidade),
        metaSalarialLiquida: Number(formRotina.metaSalarialLiquida),
        custoSublocacaoPorHora: Number(formRotina.custoSublocacaoPorHora) || 0,
        aliquotaImpostoPadrao: formRotina.aliquotaImpostoPadrao || 6,
        taxaCartaoPadrao: formRotina.taxaCartaoPadrao || 3.5,
        margemLucroPadrao: formRotina.margemLucroPadrao || 30
      })

      // Recarrega o resumo para atualizar a hora clínica instantaneamente
      const res = await api.get<ResumoHoraClinica>('/hora-clinica/resumo')
      setResumo(res.data)
      setFeedbackMsg({ tipo: 'sucesso', texto: 'Rotina de trabalho atualizada e Hora Clínica recalculada com sucesso!' })
    } catch {
      setFeedbackMsg({ tipo: 'erro', texto: 'Erro ao salvar a rotina de atendimento.' })
    } finally {
      setSavingRotina(false)
    }
  }

  const handleAdicionarCustoFixo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoCustoNome.trim() || !novoCustoValor) return

    setSalvandoCusto(true)
    setFeedbackMsg(null)

    try {
      await api.post('/custos-fixos', {
        nome: novoCustoNome.trim(),
        valorMensal: parseFloat(novoCustoValor.replace(',', '.'))
      })

      setNovoCustoNome('')
      setNovoCustoValor('')

      // Atualiza o resumo
      const res = await api.get<ResumoHoraClinica>('/hora-clinica/resumo')
      setResumo(res.data)
      setFeedbackMsg({ tipo: 'sucesso', texto: 'Conta mensal adicionada com sucesso!' })
    } catch {
      setFeedbackMsg({ tipo: 'erro', texto: 'Erro ao adicionar a conta mensal.' })
    } finally {
      setSalvandoCusto(false)
    }
  }

  const handleRemoverCustoFixo = async (id: string) => {
    if (!confirm('Deseja realmente remover esta despesa mensal?')) return

    try {
      await api.delete(`/custos-fixos/${id}`)
      const res = await api.get<ResumoHoraClinica>('/hora-clinica/resumo')
      setResumo(res.data)
      setFeedbackMsg({ tipo: 'sucesso', texto: 'Despesa removida.' })
    } catch {
      setFeedbackMsg({ tipo: 'erro', texto: 'Erro ao remover a despesa.' })
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-text-muted">
        <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Carregando estrutura e custos do consultório...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs transition-all ${
          feedbackMsg.tipo === 'sucesso' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center space-x-2">
            {feedbackMsg.tipo === 'sucesso' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedbackMsg.texto}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-700 ml-4">✕</button>
        </div>
      )}

      {/* CARDS INDICADORES PRINCIPAIS DO TOPO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Custo da Hora Clínica */}
        <div className="bg-gradient-to-br from-brand-sidebar to-brand-primary text-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-white/70 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">Custo da Hora Clínica</span>
              <Clock className="w-4 h-4 text-brand-badge" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight block">
              {formatCurrency(resumo?.horaClinica)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
            <span>Minuto de cadeira:</span>
            <span className="font-bold text-white">{formatCurrency(resumo?.minutoClinico)} / min</span>
          </div>
        </div>

        {/* Card 2: Horas Produtivas / Mês */}
        <div className="bg-surface-card p-5 rounded-2xl border border-brand-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Horas Produtivas / Mês</span>
              <Calendar className="w-4 h-4 text-brand-accent" />
            </div>
            <span className="text-2xl font-extrabold text-text-title block">
              {resumo?.horasProdutivasMes ?? 0}h
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between text-xs text-text-muted">
            <span>Com {formRotina.percentualOciosidade}% ociosidade:</span>
            <span className="font-semibold text-text-title">{formRotina.diasTrabalhoSemana} dias/sem &bull; {formRotina.horasPorDia}h/dia</span>
          </div>
        </div>

        {/* Card 3: Total Custos Fixos */}
        <div className="bg-surface-card p-5 rounded-2xl border border-brand-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Contas Mensais Fixas</span>
              <Building2 className="w-4 h-4 text-brand-accent" />
            </div>
            <span className="text-2xl font-extrabold text-text-title block">
              {formatCurrency(resumo?.totalCustosFixos)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between text-xs text-text-muted">
            <span>Contas cadastradas:</span>
            <span className="font-semibold text-text-title">{resumo?.custosFixos?.length ?? 0} ativas</span>
          </div>
        </div>

        {/* Card 4: Custo Estrutural Total */}
        <div className="bg-surface-card p-5 rounded-2xl border border-brand-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-status-profit mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Custo Estrutural Total</span>
              <TrendingUp className="w-4 h-4 text-status-profit" />
            </div>
            <span className="text-2xl font-extrabold text-status-profit block">
              {formatCurrency(resumo?.custoEstruturalMensal)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between text-xs text-text-muted">
            <span>Fixos + Pró-labore ({formatCurrency(formRotina.metaSalarialLiquida)})</span>
          </div>
        </div>

      </div>

      {/* DUAS COLUNAS: LADO A (ROTINA) & LADO B (CONTAS FIXAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LADO A: ROTINA DE TRABALHO & PRÓ-LABORE (5 Colunas) */}
        <div className="lg:col-span-5 bg-surface-card p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <h3 className="font-bold text-text-title text-base flex items-center space-x-2">
                <span>1. Minha Rotina & Meta Salarial</span>
              </h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Configure quantas horas você atende e quanto deseja levar limpo para casa por mês.
              </p>
            </div>

            <form onSubmit={handleSalvarRotina} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-body mb-1">
                  Dias de atendimento por semana:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="7"
                    required
                    value={formRotina.diasTrabalhoSemana ?? ''}
                    onChange={(e) => setFormRotina({ ...formRotina, diasTrabalhoSemana: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-badge transition"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-text-muted pointer-events-none">dias/semana</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-body mb-1">
                  Horas de atendimento por dia:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    value={formRotina.horasPorDia ?? ''}
                    onChange={(e) => setFormRotina({ ...formRotina, horasPorDia: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-badge transition"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-text-muted pointer-events-none">horas/dia</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-text-body">
                    Taxa estimada de ociosidade / faltas (%):
                  </label>
                  <span className="text-[11px] text-text-muted flex items-center space-x-1" title="Faltas de pacientes, janelas na agenda e intervalos">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-accent" />
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="99"
                    required
                    value={formRotina.percentualOciosidade ?? ''}
                    onChange={(e) => setFormRotina({ ...formRotina, percentualOciosidade: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-badge transition"
                  />
                  <Percent className="w-4 h-4 text-text-muted absolute right-3.5 top-3" />
                </div>
                <span className="text-[11px] text-text-muted mt-1 block">Média recomendada para autônomos: 20% a 30%</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-body mb-1">
                  Meta de Pró-labore Líquido Mensal (R$):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="100"
                    min="0"
                    required
                    value={formRotina.metaSalarialLiquida ?? ''}
                    onChange={(e) => setFormRotina({ ...formRotina, metaSalarialLiquida: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm font-bold text-text-title outline-none focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-badge transition"
                  />
                  <DollarSign className="w-4 h-4 text-text-muted absolute right-3.5 top-3" />
                </div>
                <span className="text-[11px] text-text-muted mt-1 block">Quanto você quer levar limpo no bolso todo mês</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-body mb-1">
                  Custo de sublocação por hora (R$):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formRotina.custoSublocacaoPorHora ?? 0}
                    onChange={(e) => setFormRotina({ ...formRotina, custoSublocacaoPorHora: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-badge transition"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-text-muted pointer-events-none">R$/hora</span>
                </div>
                <span className="text-[11px] text-text-muted mt-1 block">Deixe 0 se o consultório for próprio/aluguel fixo</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingRotina}
                  className="w-full px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingRotina ? 'Recalculando...' : 'Salvar e Recalcular Hora'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LADO B: MINHAS CONTAS MENSAIS FIXAS (7 Colunas) */}
        <div className="lg:col-span-7 bg-surface-card p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-text-title text-base">2. Minhas Contas Mensais Fixas</h3>
                <p className="text-xs text-text-muted mt-0.5">Cadastre aluguel, condomínio, internet, secretária, anuidade CRO, software, etc.</p>
              </div>
              <span className="text-xs font-bold text-brand-primary bg-brand-badge px-3 py-1 rounded-xl self-start sm:self-auto">
                Total: {formatCurrency(resumo?.totalCustosFixos)}
              </span>
            </div>

            {/* Formulário de Adição Rápida */}
            <form onSubmit={handleAdicionarCustoFixo} className="p-4 rounded-xl bg-surface-app border border-brand-border mb-5">
              <span className="text-xs font-bold text-text-title block mb-2">+ Adicionar Nova Conta Mensal</span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7">
                  <input
                    type="text"
                    placeholder="Ex: Aluguel do consultório"
                    value={novoCustoNome}
                    onChange={(e) => setNovoCustoNome(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-brand-border rounded-xl text-xs outline-none focus:border-brand-primary transition"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="R$ Valor"
                    value={novoCustoValor}
                    onChange={(e) => setNovoCustoValor(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-brand-border rounded-xl text-xs font-semibold outline-none focus:border-brand-primary transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={salvandoCusto}
                    className="w-full h-full min-h-[34px] px-3 py-2 bg-brand-secondary hover:bg-brand-secondary/90 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Lista de Custos Fixos */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {(!resumo?.custosFixos || resumo.custosFixos.length === 0) ? (
                <div className="p-8 text-center border-2 border-dashed border-brand-border rounded-xl text-text-muted">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-brand-accent/50" />
                  <p className="text-xs font-medium">Nenhum custo fixo cadastrado ainda.</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Adicione acima suas contas para calcular sua hora clínica real.</p>
                </div>
              ) : (
                resumo.custosFixos.map((custo) => (
                  <div
                    key={custo.id}
                    className="p-3.5 rounded-xl bg-white border border-brand-border flex items-center justify-between hover:border-brand-active/40 transition group shadow-2xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                      <span className="text-xs font-semibold text-text-title">{custo.nome}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-xs font-extrabold text-text-title">
                        {formatCurrency(custo.valorMensal)}
                      </span>
                      <button
                        onClick={() => handleRemoverCustoFixo(custo.id)}
                        className="text-slate-300 hover:text-status-danger p-1 rounded-lg transition"
                        title="Remover custo fixo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs text-text-muted">
            <span>O valor das contas é somado à sua meta salarial para calcular sua hora clínica.</span>
          </div>
        </div>

      </div>

    </div>
  )
}

export default HoraClinicaView
