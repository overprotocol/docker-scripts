# Docker Scripts for Over Protocol

Useful scripts to run Over Protocol with Docker 🐳

## Contents
- [Docker Scripts for Over Protocol](#docker-scripts-for-over-protocol)
  - [Contents](#contents)
  - [Initial Set Up](#initial-set-up)
  - [Run a full node](#run-a-full-node)
  - [Run a validator node](#run-a-validator-node)
    - [Generate validator keys](#generate-validator-keys)
    - [Send deposit transactions](#send-deposit-transactions)
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

To run a validator, you must stake your OVER to the network. You can refer to our [official docs](https://docs.over.network/operators/operate-validators) to send deposit transactions,
or use the following guides if you prefer Docker.

### Generate validator keys

Our [staking-deposit-cli](https://github.com/overprotocol/staking-deposit-cli) provides a handy tool to generate a validator key and deposit data.
Run following commands to generate:

```bash
docker run -it --rm -v $(pwd)/validator_keys:/app/validator_keys overfoundation/staking-deposit-cli:latest new-mnemonic
```

`deposit_data-*.json` and `keystore-m_*.json` will be generated inside `./validator_keys` folder.

### Send deposit transactions

You can use our Docker container to send deposit transactions. First, build the staking container:

```bash
docker build -t over-staking send-deposit/.
```

Then run the container with your private key and deposit data:

```bash
docker run -v $(pwd)/validator_keys:/app/validator_keys \
  -e PUBLIC_RPC_URL=PUBLIC_RPC_URL \
  -e PRIVATE_KEY=YOUR_PRIVATE_KEY_WITH_0x_PREFIX \
  -e DEPOSIT_DATA_FILE_NAME=YOUR_DEPOSIT_DATA_FILE_NAME \
  over-staking
```

You need three environment variables:
- `PUBLIC_RPC_URL`: Refer to [Network Configurations](https://docs.over.network/operators/run-a-node#network-configurations-).
- `YOUR_PRIVATE_KEY_WITH_0x_PREFIX`: The private key that has enough fund.
- `YOUR_DEPOSIT_DATA_FILE_NAME`: File name that starts with `deposit_data-`.

The result will be printed like:

```plaintext
Transaction 1:
Transaction Hash: 0x512157ba292f64b048ba449fbc44bacb598dec365e597a954fbb3c43f2cf14ec
Transaction 2:
Transaction Hash: 0x559a315785a069fffd023f03fe9b06d2640a32067042f7a37aff6c63a3cf79db
// ...
```

## Q&A

**Q) I would like to run a consensus client without checkpoint sync.**

A) The scripts are based on the usage of our official checkpoint sync URL. If you want to sync your consensus client from genesis,
you could replace `--checkpoint-sync-url` flag into `--genesis-beacon-api-url`.