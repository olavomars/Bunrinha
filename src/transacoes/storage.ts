import { Client } from '@libsql/client';

export interface IInsertTransactionParams {
  tipo: string,
  descricao: string,
  valor: number,
  storage: Client,
  clientId: number
}

export const insertTransaction = async ({ tipo, descricao, valor, storage, clientId }: IInsertTransactionParams) => {
  const isDebitTransaction = tipo === 'd';

  if (!isDebitTransaction) return 'c'


  const clientRows = (await storage.execute({
    sql: 'SELECT saldo, limite FROM Clients where id = ?',
    args: [clientId]
  })).rows;

  const limite: number = Number(clientRows[0]!.limite);
  const saldo: number = Number(clientRows[0]!.saldo);

  const isInconsistentBalance = -valor < -(limite + saldo);

  if (isInconsistentBalance) {
    return '422'
  }

  const result = await storage.batch(
    [
      {
        sql: 'INSERT INTO Transacoes (tipo, descricao, valor, clientId) VALUES (?, ?, ?, ?)',
        args: [tipo, descricao, valor, clientId],
      },
      {
        sql: 'update Clients set saldo = saldo - ? where id = ?',
        args: [valor, clientId],
      },
      {
        sql: 'select saldo, limite from Clients where id = ?',
        args: [clientId]
      }
    ],
    "write"
  );

  const rows = result[2].rows[0];
  return {
    limite: rows.limite,
    saldo: rows.saldo
  }
}
