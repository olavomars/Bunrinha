import { Elysia, t } from 'elysia';
import { createTransactionHandler, getTransactionHandler } from './transacoes/transacoes';
import { createClient } from '@libsql/client';

const HTTP_PORT = Bun.env.HTTP_PORT ?? 8080;

const client = createClient({
  url: 'file:local.db',
});

// 1	100000	0
// 2	80000	0
// 3	1000000	0
// 4	10000000	0
// 5	500000	0


client.batch(

  [
    'CREATE TABLE IF NOT EXISTS Clients (id INTEGER PRIMARY KEY AUTOINCREMENT, limite INTEGER NOT NULL, saldo INTEGER NOT NULL)',
    'INSERT OR IGNORE INTO Clients (id, limite, saldo) VALUES (1, 1000, 1000)',
    'INSERT OR IGNORE INTO Clients (id, limite, saldo) VALUES (2, 1000, 1000)',
    'INSERT OR IGNORE INTO Clients (id, limite, saldo) VALUES (3, 1000, 1000)',
    'INSERT OR IGNORE INTO Clients (id, limite, saldo) VALUES (4, 1000, 1000)',
    'INSERT OR IGNORE INTO Clients (id, limite, saldo) VALUES (5, 1000, 1000)',
    'CREATE TABLE IF NOT EXISTS Transacoes (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo CHAR(1) NOT NULL, descricao VARCHAR(255) not null, valor INTEGER NOT NULL, clientId INTEGER NOT NULL, realizada_em DATETIME DEFAULT CURRENT_TIMESTAMP)',
  ],
  'write'
);

const app = new Elysia().listen(HTTP_PORT).state('storage', { client });


app.group('/clientes', (app) =>
  app
    .post(
      '/:id/transacoes',
      ({ params: { id }, body: { valor, tipo, descricao }, store }) => {
        const { client } = store.storage;
        return createTransactionHandler({ valor, tipo, descricao, clientId: id }, client);
      },
      {
        params: t.Object({
          id: t.Numeric(),
        }),
        body: t.Object({
          valor: t.Numeric({ minimum: 1 }),
          tipo: t.String({ maxLength: 1, pattern: '^[cd]+$', error: "Tipo de transação inválida" }),
          descricao: t.String({ minLength: 1, maxLength: 10 }),
        }),
      }
    )
    .get(':id/extrato', () => {
      console.log('extrato');
    })
);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
