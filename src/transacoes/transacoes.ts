export interface ITransacao {
  id: number;
  tipo: string;
  descricao: string;
  realizada_em: Date;
}

interface ITransacaoBody {
  valor: number;
  tipo: string;
  descricao: string;
}

import { createClient } from '@libsql/client';
import { insertTransaction } from './storage';

export const transacaoHandler = async (
  { valor, tipo, descricao }: ITransacaoBody,
  id: number
) => {
  const transacao = await insertTransaction(tipo, descricao);
  return transacao;
};
