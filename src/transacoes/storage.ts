import { createClient } from '@libsql/client';

const client = createClient({
  url: 'file:local.db',
});

export const insertTransaction = async (tipo: string, descricao: string) => {
  const result = await client.execute({
    sql: 'INSERT INTO Transacoes (tipo, descricao) VALUES (?, ?)',
    args: [tipo, descricao],
  });

  client.close();

  return result;
};
