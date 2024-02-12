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

  // try {
  //   await storage.execute("UPDATE Clients SET saldo = $1 WHERE id = $2;", [saldo, clientId,])

  // }

  const transactionId = await insertTransaction({ valor, tipo, descricao, storage, clientId });
  const transaction = await findTransactionById({ storage, transactionId })
  return transaction;
};

interface IGetTransactionBody {
  storage: Client,
  transactionId: number
}

export const getTransactionHandler = async (
  { storage, transactionId }: IGetTransactionBody
) => {
  return findTransactionById({ storage, transactionId });
}
