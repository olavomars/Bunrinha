export interface ITransacao {
  id: number;
  tipo: ETipo;
  descricao: string;
  realizada_em: Date;
}

export interface ICreateTransacaoBody {
  valor: number;
  tipo: string;
  descricao: string;
  clientId: number;
}

export interface ItransacaoResponse {
  limite: number;
  saldo: number;
}

export enum ETipo {
  "c" = "c",
  "d" = "d",
}
