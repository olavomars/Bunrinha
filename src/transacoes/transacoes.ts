import { ICreateTransacaoBody } from '../interfaces';

import { Client } from '@libsql/client';
import { findTransactionById, insertTransaction } from './storage';

export const createTransactionHandler = async (
  { valor, tipo, descricao, clientId }: ICreateTransacaoBody,
  storage: Client,
) => {
  //todo
  if (clientId > 5) {
    return null;
  }

  const transaction = await insertTransaction({ valor, tipo, descricao, storage, clientId });
  return transaction;
};

interface IGetTransactionBody {
  storage: Client,
  transactionId: number
}
