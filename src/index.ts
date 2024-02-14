import { Elysia, t } from 'elysia';
import { createTransactionHandler, listTransactionHandler } from './transacoes/transacoes';
import { createClient } from '@libsql/client';

const HTTP_PORT = Bun.env.HTTP_PORT ?? 8080;

const client = createClient({
  url: 'file:local.db',
});

client.batch(
  [
    'CREATE TABLE IF NOT EXISTS Clients (id INTEGER PRIMARY KEY AUTOINCREMENT, limite INTEGER NOT NULL, saldo INTEGER NOT NULL)',
    'INSERT OR IGNORE INTO Clients (id, limite, saldo) VALUES (1, 100000, 0)',
    'INSERT OR IGNORE INTO Clients (id, limite, saldo) VALUES (2, 80000, 0)',
    'INSERT OR IGNORE INTO Clients (id, limite, saldo) VALUES (3, 1000000, 0)',
    'INSERT OR IGNORE INTO Clients (id, limite, saldo) VALUES (4, 10000000, 0)',
    'INSERT OR IGNORE INTO Clients (id, limite, saldo) VALUES (5, 500000, 0)',
    'CREATE TABLE IF NOT EXISTS Transacoes (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo CHAR(1) NOT NULL, descricao VARCHAR(255) not null, valor INTEGER NOT NULL, clientId INTEGER NOT NULL, realizada_em DATETIME DEFAULT CURRENT_TIMESTAMP)',
  ],
  'write'
);

const app = new Elysia().listen(HTTP_PORT).state('storage', { client });
    app.onError(({ code, error }) => {
        console.log(error)
        return new Response(error.toString())
    })
    .get('/', () => {
        throw new Error('Server is during maintenance')

        return 'unreachable'
    })

app.group('/clientes', (app) =>
  app
    .post(
      '/:id/transacoes',
      ({ params: { id }, body: { valor, tipo, descricao }, store, set }) => {
        const { client } = store.storage;
        return createTransactionHandler({ valor, tipo, descricao, clientId: id }, client, set);
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
    .get(':id/extrato', ({ params: { id }, store, set }) => {
      const { client } = store.storage;
      return listTransactionHandler({ id, storage: client, set });
    }, {
      params: t.Object({
        id: t.Numeric(),
      })
    })
);

console.log(
  `t a amais🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
