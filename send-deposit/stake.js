const { ethers } = require("ethers")

const publicRPCURL = process.env.PUBLIC_RPC_URL

const provider = new ethers.providers.JsonRpcProvider(publicRPCURL)

const depositContractAddress = "0x000000000000000000000000000000000beac017"
const depositContractABI = [
  {
    inputs: [
      { internalType: "bytes", name: "pubkey", type: "bytes" },
      { internalType: "bytes", name: "withdrawal_credentials", type: "bytes" },
      { internalType: "bytes", name: "signature", type: "bytes" },
      { internalType: "bytes32", name: "deposit_data_root", type: "bytes32" },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
]

async function stake() {
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    console.error("Please provide PRIVATE_KEY environment variable")
    process.exit(1)
  }

  let depositDataPath = process.env.DEPOSIT_DATA_FILE_NAME
  if (!depositDataPath) {
    console.error("Please provide DEPOSIT_DATA_FILE_NAME environment variable")
    process.exit(1)
  }
  depositDataPath = `/app/validator_keys/${depositDataPath}` // Naive way to get the path

  const wallet = new ethers.Wallet(privateKey, provider)
  const stakingContract = new ethers.Contract(
    depositContractAddress,
    depositContractABI,
    wallet
  )

  let depositDatas
  depositDatas = require(depositDataPath)
  const amount = ethers.utils.parseUnits(
    depositDatas[0].amount.toString(),
    "gwei"
  )

  for (let i = 0; i < depositDatas.length; i++) {
    const tx = await stakingContract.deposit(
      "0x" + depositDatas[i].pubkey,
      "0x" + depositDatas[i].withdrawal_credentials,
      "0x" + depositDatas[i].signature,
      "0x" + depositDatas[i].deposit_data_root,
      {
        value: amount,
        gasLimit: 2000000,
      }
    )

    try {
      const receipt = await tx.wait()
      console.log(`Transaction ${i + 1}:`)
      console.log(`Transaction Hash: ${receipt.transactionHash}`)
    } catch (error) {
      console.error(`Error in transaction ${i + 1}: ${error.message}`)
    }
  }
}

stake()
  .catch(console.error)
  .finally(() => process.exit())
