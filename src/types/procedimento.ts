export type StatusSemaforo = 'VERDE' | 'AMARELO' | 'VERMELHO';

export interface Procedimento {
  id: string;
  nome: string;
  codigoTuss?: string;
  tempoMinutos: number;
  kitMaterialId?: string;
  kitMaterialNome?: string;
  custoTempoClinico: number;
  custoKitMaterial: number;
  custoBiosseguranca: number;
  custoProtetico: number;
  custoDiretoTotal: number;
  precoMinimo: number;
  precoSugerido: number;
  precoPraticado?: number;
  lucroEstimadoReais: number;
  margemRealPercentual: number;
  statusSemaforo: StatusSemaforo;
  ativo: boolean;
}

export interface ProcedimentoFormData {
  nome: string;
  codigoTuss?: string;
  tempoMinutos: number;
  kitMaterialId?: string;
  custoProtetico: number;
  precoPraticado?: number;
  margemLucroDesejada?: number;
}
