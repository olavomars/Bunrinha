import { Client } from '@libsql/client';
import { TransactionTypes } from '../interfaces';

export interface IInsertTransactionParams {
  tipo: string,
  descricao: string,
  valor: number,
  storage: Client,
  clientId: number
}

interface IGetClientInfo {
  storage: Client,
  clientId: number,
}

const getClientLimitAndSaldo = async ({ storage, clientId }: IGetClientInfo) => {

  const clientRows = (await storage.execute({
    sql: 'SELECT saldo, limite FROM Clients where id = ?',
    args: [clientId]
  })).rows;

  const limite: number = Number(clientRows[0]!.limite);
  const saldo: number = Number(clientRows[0]!.saldo);

  return {
    limite,
    saldo
  }
};

const insertTransactionResult = async ({ storage, tipo, descricao, valor, clientId }: IInsertTransactionParams) => {
  const type = tipo === TransactionTypes.DEBITO ? 'saldo' : 'limite';
  const result = await storage.batch(
    [
      {
        sql: 'INSERT INTO Transacoes (tipo, descricao, valor, clientId) VALUES (?, ?, ?, ?)',
        args: [tipo, descricao, valor, clientId],
      },
      {
        sql: `update Clients set ${type} = ${type} - ? where id = ?`,
        args: [valor, clientId],
      },
      {
        sql: 'select saldo, limite from Clients where id = ?',
        args: [clientId],
      }
    ],
    "write"
  );
  const rows = result[2].rows[0];
  return {
    limite: rows.limite,
    saldo: rows.saldo
  }

};

export const insertTransaction = async ({ tipo, descricao, valor, storage, clientId }: IInsertTransactionParams) => {
  const isDebitTransaction = tipo === TransactionTypes.DEBITO;

  if (!isDebitTransaction) {
    const { limite } = await getClientLimitAndSaldo({ storage, clientId });

    const isValidCreditTransaction = limite - valor >= 0;

    if (!isValidCreditTransaction) {
      return '422'
    }

    const result = await insertTransactionResult({ tipo, descricao, valor, storage, clientId });
    return result;
  }

  const { limite, saldo } = await getClientLimitAndSaldo({ storage, clientId });

  const isInconsistentBalance = -valor < -(limite + saldo);

  if (isInconsistentBalance) {
    return '422'
  }

  const result = await insertTransactionResult({ tipo, descricao, valor, storage, clientId });
  return result;

}

export const listTransactions = async ({ clientId, storage }: IGetClientInfo) => {
  const result = await storage.batch([{
    sql: "select saldo as total, CURRENT_TIMESTAMP as data_extrato, limite from Clients where id = ?",
    args: [clientId]
  },
  {
    sql: 'select valor, tipo, descricao, realizada_em from Transacoes where clientId = ? order by realizada_em desc limit 10',
    args: [clientId]
  }],
    "write"
  );

  const rows = result[0] as any;
  const firstRow = rows[0];

  const saldo = {
    total: firstRow.total,
    data_extrato: firstRow.data_extrato,
    limite: firstRow.limite
  }

  const transactions = result[1].rows.map(r => {
    return {
      valor: r.valor,
      tipo: r.tipo,
      descricao: r.descricao,
      realizada_em: r.realizada_em,
    }
  })

  return {
    saldo,
    ultimas_transacoes: transactions
  }
}
