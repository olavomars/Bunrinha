export interface ITransacao {
  id: number;
  tipo: keyof typeof TransactionTypes,
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

export const TransactionTypes = {
  CREDITO: 'c',
  DEBITO: 'd',
};
