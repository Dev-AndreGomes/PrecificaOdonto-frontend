export interface CustoFixo {
  id: string
  nome: string
  valorMensal: number
  ativo: boolean
}

export interface ConfigClinica {
  id: string
  diasTrabalhoSemana: number
  horasPorDia: number
  percentualOciosidade: number
  metaSalarialLiquida: number
  custoSublocacaoPorHora: number
  aliquotaImpostoPadrao: number
  taxaCartaoPadrao: number
  margemLucroPadrao: number
}

export interface ResumoHoraClinica {
  config: ConfigClinica
  totalCustosFixos: number
  horasProdutivasMes: number
  custoEstruturalMensal: number
  horaClinica: number
  minutoClinico: number
  custosFixos: CustoFixo[]
}
