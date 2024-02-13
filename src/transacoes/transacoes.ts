import { ICreateTransacaoBody } from '../interfaces';

import { Client } from '@libsql/client';
import { insertTransaction, listTransactions } from './storage';

export const createTransactionHandler = async (
  { valor, tipo, descricao, clientId }: ICreateTransacaoBody,
  storage: Client,
  set: Record<string, unknown>,
) => {

  if (clientId > 5) {
    set.status = 404;
    return null;
  }

  const transaction = await insertTransaction({ valor, tipo, descricao, storage, clientId });

  if (transaction === '422') {
    set.status = 422;
    return null
  };
  return transaction;

};

interface IListTransaction {
  storage: Client,
  id: number
  set: Record<string, unknown>
}

export const listTransactionHandler = async ({ id, storage, set }: IListTransaction) => {
  if (id > 5) {
    set.status = 404;
    return null;
  }

  const transaction = await listTransactions({ clientId: id, storage });
  return transaction;

}
