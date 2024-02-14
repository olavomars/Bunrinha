FROM oven/bun

WORKDIR /app

COPY . .

RUN bun install --production

EXPOSE 8080

CMD ["bun", "run", "src/index.ts"]

