import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Search, 
  X, 
  DollarSign, 
  FileText,
  Sparkles,
  Info
} from 'lucide-react'
import { api } from '../../services/api'
import type { KitMaterial, KitMaterialRequestPayload } from '../../types/kit'

export function KitsMateriaisView() {
  const [kits, setKits] = useState<KitMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form State
  const [formNome, setFormNome] = useState('')
  const [formCusto, setFormCusto] = useState('')
  const [formDescricao, setFormDescricao] = useState('')
  const [formBiosseguranca, setFormBiosseguranca] = useState(false)

  const carregarKits = async () => {
    try {
      setLoading(true)
      const res = await api.get<KitMaterial[]>('/kits-materiais')
      setKits(res.data)
    } catch {
      setFeedbackMsg({
        tipo: 'erro',
        texto: 'Não foi possível carregar os kits de materiais. Verifique se o backend está ativo.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarKits()
  }, [])

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return 'R$ 0,00'
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const abrirModalNovo = () => {
    setEditingId(null)
    setFormNome('')
    setFormCusto('')
    setFormDescricao('')
    setFormBiosseguranca(false)
    setModalOpen(true)
  }

  const abrirModalEdicao = (kit: KitMaterial) => {
    setEditingId(kit.id)
    setFormNome(kit.nome)
    setFormCusto(kit.custoEstimado.toString())
    setFormDescricao(kit.descricaoItens || '')
    setFormBiosseguranca(kit.kitBiosseguranca)
    setModalOpen(true)
  }

  const fecharModal = () => {
    setModalOpen(false)
    setEditingId(null)
  }

  const handleSalvarKit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formNome.trim() || !formCusto) return

    setSaving(true)
    setFeedbackMsg(null)

    const payload: KitMaterialRequestPayload = {
      nome: formNome.trim(),
      custoEstimado: parseFloat(formCusto.replace(',', '.')),
      descricaoItens: formDescricao.trim() || undefined,
      kitBiosseguranca: formBiosseguranca
    }

    try {
      if (editingId) {
        await api.put(`/kits-materiais/${editingId}`, payload)
        setFeedbackMsg({ tipo: 'sucesso', texto: 'Kit de material atualizado com sucesso!' })
      } else {
        await api.post('/kits-materiais', payload)
        setFeedbackMsg({ tipo: 'sucesso', texto: 'Novo kit de material cadastrado com sucesso!' })
      }
      fecharModal()
      carregarKits()
    } catch {
      setFeedbackMsg({ tipo: 'erro', texto: 'Erro ao salvar o kit de material.' })
    } finally {
      setSaving(false)
    }
  }

  const handleRemoverKit = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente remover o kit "${nome}"?`)) return

    try {
      await api.delete(`/kits-materiais/${id}`)
      setFeedbackMsg({ tipo: 'sucesso', texto: `Kit "${nome}" removido.` })
      carregarKits()
    } catch {
      setFeedbackMsg({ tipo: 'erro', texto: 'Erro ao remover o kit.' })
    }
  }

  const kitsFiltrados = kits.filter(k => 
    k.nome.toLowerCase().includes(search.toLowerCase()) || 
    (k.descricaoItens && k.descricaoItens.toLowerCase().includes(search.toLowerCase()))
  )

  const kitBio = kits.find(k => k.kitBiosseguranca)
  const custoMedio = kits.length > 0 
    ? kits.reduce((acc, k) => acc + Number(k.custoEstimado), 0) / kits.length 
    : 0

  if (loading) {
    return (
      <div className="p-12 text-center text-text-muted">
        <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Carregando catálogo de kits de materiais...</p>
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

      {/* CARDS DE RESUMO DO TOPO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Total de Kits */}
        <div className="bg-surface-card p-5 rounded-2xl border border-brand-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Kits Cadastrados</span>
              <Package className="w-4 h-4 text-brand-accent" />
            </div>
            <span className="text-3xl font-extrabold text-text-title block">{kits.length}</span>
          </div>
          <p className="text-xs text-text-muted mt-2">Sem necessidade de dar baixa em insumos individuais</p>
        </div>

        {/* Card 2: Kit Biossegurança Ativo */}
        <div className="bg-gradient-to-br from-brand-sidebar to-brand-primary text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-white/80 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-status-profit" />
                Kit Biossegurança / EPIs
              </span>
              <Sparkles className="w-4 h-4 text-brand-badge" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight block">
              {kitBio ? formatCurrency(kitBio.custoEstimado) : 'Não definido'}
            </span>
          </div>
          <p className="text-xs text-white/80 mt-2">
            {kitBio ? 'Gasto fixo por paciente em cada consulta' : 'Cadastre um kit marcado como biossegurança'}
          </p>
        </div>

        {/* Card 3: Custo Médio dos Kits */}
        <div className="bg-surface-card p-5 rounded-2xl border border-brand-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Custo Médio por Kit</span>
              <DollarSign className="w-4 h-4 text-status-profit" />
            </div>
            <span className="text-3xl font-extrabold text-status-profit block">
              {formatCurrency(custoMedio)}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-2">Média ponderada dos kits do consultório</p>
        </div>

      </div>

      {/* BARRA DE AÇÕES & BUSCA */}
      <div className="bg-surface-card p-4 rounded-2xl border border-brand-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Campo de Busca */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar kit por nome ou material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-app border border-brand-border rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-brand-primary transition"
          />
        </div>

        {/* Botão de Criação */}
        <button
          onClick={abrirModalNovo}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Kit de Material</span>
        </button>

      </div>

      {/* GRID DE CARDS DOS KITS */}
      {kitsFiltrados.length === 0 ? (
        <div className="bg-surface-card p-12 text-center rounded-2xl border-2 border-dashed border-brand-border text-text-muted">
          <Package className="w-10 h-10 text-brand-accent/50 mx-auto mb-3" />
          <h4 className="font-bold text-text-title text-sm">Nenhum kit de material encontrado</h4>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            {search ? 'Tente buscar por outro termo ou limpe a barra de pesquisa.' : 'Clique no botão acima para cadastrar seu primeiro kit com custo estimado.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kitsFiltrados.map((kit) => (
            <div
              key={kit.id}
              className={`bg-surface-card rounded-2xl border p-5 flex flex-col justify-between shadow-xs transition-all hover:shadow-md ${
                kit.kitBiosseguranca 
                  ? 'border-brand-primary/40 ring-2 ring-brand-badge' 
                  : 'border-brand-border'
              }`}
            >
              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    {kit.kitBiosseguranca && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Biossegurança / EPIs
                      </span>
                    )}
                    <h4 className="font-bold text-text-title text-base leading-snug">{kit.nome}</h4>
                  </div>

                  <span className="text-lg font-extrabold text-brand-primary whitespace-nowrap bg-brand-badge/60 px-3 py-1 rounded-xl">
                    {formatCurrency(kit.custoEstimado)}
                  </span>
                </div>

                {/* Composição / Itens (Opcional) */}
                {kit.descricaoItens ? (
                  <div className="p-3 rounded-xl bg-surface-app border border-brand-border text-xs text-text-muted leading-relaxed mb-4">
                    <span className="font-semibold text-text-title block mb-1 flex items-center gap-1 text-[11px]">
                      <FileText className="w-3 h-3 text-brand-accent" />
                      Composição estimada:
                    </span>
                    <p className="line-clamp-3 text-[11px]">{kit.descricaoItens}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-text-muted italic mb-4">
                    Composição detalhada não informada (valor fechado).
                  </p>
                )}
              </div>

              {/* Rodapé com Ações */}
              <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                <span className="text-[11px] text-text-muted">
                  {kit.kitBiosseguranca ? 'Padrão da cadeira' : 'Vinculável a procedimentos'}
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => abrirModalEdicao(kit)}
                    className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-brand-badge rounded-lg transition"
                    title="Editar kit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoverKit(kit.id, kit.nome)}
                    className="p-1.5 text-text-muted hover:text-status-danger hover:bg-rose-50 rounded-lg transition"
                    title="Excluir kit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-card rounded-2xl border border-brand-border w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-brand-border flex items-center justify-between bg-surface-app">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-brand-primary" />
                <h3 className="font-bold text-text-title text-base">
                  {editingId ? 'Editar Kit de Material' : 'Novo Kit de Material'}
                </h3>
              </div>
              <button onClick={fecharModal} className="text-text-muted hover:text-text-title p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSalvarKit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-body mb-1">
                  Nome do Kit: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Kit Restauração em Resina Composta"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-badge transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-body mb-1">
                  Custo Médio Estimado por Atendimento (R$): *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: 25.00"
                    value={formCusto}
                    onChange={(e) => setFormCusto(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-app border border-brand-border rounded-xl text-sm font-bold text-text-title outline-none focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-badge transition"
                  />
                  <DollarSign className="w-4 h-4 text-text-muted absolute right-3.5 top-3" />
                </div>
                <span className="text-[11px] text-text-muted mt-1 block">
                  Valor médio do material gasto neste tipo de procedimento.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-text-body">
                    Composição dos Itens (Opcional):
                  </label>
                  <span className="text-[11px] text-text-muted flex items-center gap-1" title="Apenas descritivo para você lembrar o que o kit contempla">
                    <Info className="w-3.5 h-3.5 text-brand-accent" />
                    Sem controle de estoque
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Ex: Ácido fosfórico, adesivo, resina composta nano-híbrida, microbrush, tiras de lixa e matriz."
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-app border border-brand-border rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-badge transition resize-none"
                />
              </div>

              {/* Checkbox Biossegurança */}
              <div className="p-3.5 rounded-xl bg-surface-app border border-brand-border flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="check-bio"
                  checked={formBiosseguranca}
                  onChange={(e) => setFormBiosseguranca(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-brand-primary rounded border-brand-border focus:ring-brand-primary"
                />
                <label htmlFor="check-bio" className="text-xs cursor-pointer select-none">
                  <span className="font-bold text-text-title block">É o Kit de Biossegurança / EPIs?</span>
                  <span className="text-[11px] text-text-muted leading-relaxed block mt-0.5">
                    Marque esta opção se este for o kit padrão de paramentação (luvas, máscara, babador, sugador) gasto em toda consulta.
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-brand-border flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Kit'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}

export default KitsMateriaisView
