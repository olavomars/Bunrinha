import { Client } from '@libsql/client';

export interface IInsertTransactionParams {
  tipo: string,
  descricao: string,
  valor: number,
  storage: Client,
  clientId: number
}

/*
  insert transaction and update client limite and saldo and return
*/

export const insertTransaction = async ({ tipo, descricao, valor, storage, clientId }: IInsertTransactionParams) => {
  const row = await storage.execute({
    sql: 'INSERT INTO Transacoes (tipo, descricao, valor, clientId) VALUES (?, ?, ?, ?)',
    args: [tipo, descricao, valor, clientId],
  });

  return Number(row.lastInsertRowid);
};

interface IFindTransactionParams {
  transactionId: number,
  storage: Client
}

export const findTransactionById = async ({ transactionId, storage }: IFindTransactionParams) => {
  const row = await storage.execute({
    sql: 'SELECT * FROM Transacoes WHERE id = ?',
    args: [transactionId]
  })

  return row;
}
