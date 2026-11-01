export interface KitMaterial {
  id: string
  nome: string
  custoEstimado: number
  descricaoItens?: string | null
  kitBiosseguranca: boolean
  ativo: boolean
}

export interface KitMaterialRequestPayload {
  nome: string
  custoEstimado: number
  descricaoItens?: string
  kitBiosseguranca: boolean
}
