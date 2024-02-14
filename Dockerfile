FROM oven/bun

WORKDIR /app

COPY . .

RUN bun install 

CMD ["bun", "run", "dev"]

EXPOSE 8080
