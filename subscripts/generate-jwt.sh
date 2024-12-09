#!/bin/bash
# Borrowed from EthStaker's prepare for the merge guide
# See https://github.com/remyroy/ethstaker/blob/main/prepare-for-the-merge.md#configuring-a-jwt-token-file

mkdir -p $(pwd)/jwttoken
if [[ ! -f $(pwd)/jwttoken/jwt.hex ]]
then
  openssl rand -hex 32 | tr -d "\n" | tee > $(pwd)/jwttoken/jwt.hex
else
  echo "$(pwd)/jwttoken/jwt.hex already exists!"
fi