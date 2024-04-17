Kwil playground
====

## Requirements

- Deno
- Docker
- Kwil

## Single node

Start PostgreSQL container

```
docker run -d -p 5440:5432 -e "POSTGRES_HOST_AUTH_METHOD=trust" -e PGDATA=/var/lib/postgresql/data/pgdata -v ./kwil-testnet/node0/pg_mount:/var/lib/postgresql/data --name kwil-pg-node0 -d kwildb/postgres:latest
```

Generate Kwil genesis

```
kwil-admin setup testnet --chain-id "kwil-chain-tmp" -v 1 --hostnames "localhost" --output-dir ./kwil-testnet
```

Start Kwil node

```
kwild --root-dir ./kwil-testnet/node0 --app.pg-db-port 5440
```

## Multiple nodes


Start PostgreSQL containers

```
docker run -d -p 5440:5432 -e "POSTGRES_HOST_AUTH_METHOD=trust" -e PGDATA=/var/lib/postgresql/data/pgdata -v ./kwil-testnet/node0/pg_mount:/var/lib/postgresql/data --name kwil-pg-node0 -d kwildb/postgres:latest
```

```
docker run -d -p 5441:5432 -e "POSTGRES_HOST_AUTH_METHOD=trust" -e PGDATA=/var/lib/postgresql/data/pgdata -v ./kwil-testnet/node1/pg_mount:/var/lib/postgresql/data --name kwil-pg-node1 -d kwildb/postgres:latest
```

```
docker run -d -p 5442:5432 -e "POSTGRES_HOST_AUTH_METHOD=trust" -e PGDATA=/var/lib/postgresql/data/pgdata -v ./kwil-testnet/node2/pg_mount:/var/lib/postgresql/data --name kwil-pg-node2 -d kwildb/postgres:latest
```

Generate Kwil genesis

```
kwil-admin setup testnet --chain-id "kwil-chain-tmp" -v 3 --hostnames "localhost,localhost,localhost" --output-dir ./kwil-testnet
```

Start Kwil nodes

```
kwild --root-dir ./kwil-testnet/node0 --app.pg-db-port 5440
```

```
kwild --root-dir ./kwil-testnet/node1 --app.pg-db-port 5441
```

```
kwild --root-dir ./kwil-testnet/node2 --app.pg-db-port 5442
```

## Deploy DB

```
export KWIL_PRIV_KEY="c71d41fa79464fa467aee3f56436b366baa2e738d07808b6cbf1219f43152a61"
kwil-cli database deploy --path=./setup.kf --kwil-provider="http://localhost:8080" --chain-id "kwil-chain-tmp" --private-key $KWIL_PRIV_KEY --sync
```

## Run POC

```
deno run --allow-all poc.ts
```
