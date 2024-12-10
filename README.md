# Docker Scripts for Over Protocol

Useful scripts to run Over Protocol with Docker 🐳

## Contents
- [Docker Scripts for Over Protocol](#docker-scripts-for-over-protocol)
  - [Contents](#contents)
  - [Initial Set Up](#initial-set-up)
  - [Run a full node](#run-a-full-node)
  - [Run a validator node](#run-a-validator-node)
  - [Q\&A](#qa)

## Initial Set Up

1. Check if the latest version of Docker is available
  
```bash
docker -v
```

2. Export your public IP for discovery

```bash
export PUBLIC_IP=$(curl -s ifconfig.me)
echo $PUBLIC_IP
```

3. Initialize data directory and JWT token

```bash
make init
```

## Run a full node

Run containers using script:

```bash
docker compose -f mainnet.yml up -d
```

To check logs, you can use following command:

```bash
docker logs kairos -f  # For inspect the execution client
docker logs chronos -f # For inspect the consensus client
```

## Run a validator node

To run a validator, you must stake your OVER to the network.

## Q&A

**Q) I would like to run a consensus client without checkpoint sync.**

A) The scripts are based on the usage of our official checkpoint sync URL. If you want to sync your consensus client from genesis,
you could replace `--checkpoint-sync-url` flag into `--genesis-beacon-api-url`.