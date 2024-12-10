#!/bin/bash

# 1. Generate a JWT token
mkdir -p $(pwd)/jwttoken
if [[ ! -f $(pwd)/jwttoken/jwt.hex ]]
then
  openssl rand -hex 32 | tr -d "\n" | tee > $(pwd)/jwttoken/jwt.hex
else
  echo "$(pwd)/jwttoken/jwt.hex already exists!"
fi

# 2. Generate data directories
mkdir -p $(pwd)/datadir/execution
mkdir -p $(pwd)/datadir/consensus