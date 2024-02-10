import { Elysia, t } from 'elysia';
import { transacaoHandler } from './transacoes/transacoes';
import { createClient } from '@libsql/client';

const HTTP_PORT = Bun.env.HTTP_PORT ?? 8080;

const client = createClient({
  url: 'file:local.db',
});

client.batch(
  [
    'CREATE TABLE IF NOT EXISTS Transacoes (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo CHAR(1) NOT NULL, descricao VARCHAR(255) not null, realizada_em DATETIME DEFAULT CURRENT_TIMESTAMP)',
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
        return transacaoHandler({ valor, tipo, descricao }, id);
      },
      {
        params: t.Object({
          id: t.Numeric(),
        }),
        body: t.Object({
          valor: t.Numeric(),
          tipo: t.String(),
          descricao: t.String(),
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
