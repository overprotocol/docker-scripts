const { ethers } = require("ethers")
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default
const AppEth = require("@ledgerhq/hw-app-eth").default

const publicRPCURL = process.env.PUBLIC_RPC_URL
const useLedger = process.env.USE_LEDGER === "true"
const ledgerPath = process.env.LEDGER_PATH || "44'/60'/0'/0/0"

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

class LedgerSigner extends ethers.Signer {
  constructor(transport, path, provider) {
    super()
    this.transport = transport
    this.path = path
    this.app = new AppEth(transport)
    this.provider = provider
  }

  async getAddress() {
    const result = await this.app.getAddress(this.path)
    return result.address
  }

  async signTransaction(transaction) {
    const txData = await ethers.utils.resolveProperties(transaction)
    
    // Remove signature fields for serialization
    const unsignedTx = {
      ...txData,
      v: undefined,
      r: undefined,
      s: undefined
    }
    
    const serializedTx = ethers.utils.serializeTransaction(unsignedTx)
    console.log("Sending transaction to Ledger for signing...")
    
    try {
      // Use the newer API with resolution parameter
      const signature = await this.app.signTransaction(
        this.path, 
        serializedTx.substring(2),
        null // resolution - null for legacy mode
      )
      
      return ethers.utils.serializeTransaction(txData, {
        v: signature.v,
        r: "0x" + signature.r,
        s: "0x" + signature.s,
      })
    } catch (error) {
      console.error("Ledger signing error:", error.message)
      throw error
    }
  }

  connect(provider) {
    return new LedgerSigner(this.transport, this.path, provider)
  }
}

async function createSigner() {
  if (useLedger) {
    console.log("Using Ledger hardware wallet...")
    const transport = await TransportNodeHid.create()
    const signer = new LedgerSigner(transport, ledgerPath, provider)
    const address = await signer.getAddress()
    console.log(`Ledger address: ${address}`)
    return signer
  } else {
    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) {
      console.error("Please provide PRIVATE_KEY environment variable or set USE_LEDGER=true")
      process.exit(1)
    }
    console.log("Using private key...")
    return new ethers.Wallet(privateKey, provider)
  }
}

async function stake() {
  let depositDataPath = process.env.DEPOSIT_DATA_FILE_NAME
  if (!depositDataPath) {
    console.error("Please provide DEPOSIT_DATA_FILE_NAME environment variable")
    process.exit(1)
  }
  depositDataPath = `/app/validator_keys/${depositDataPath}`

  const signer = await createSigner()
  const stakingContract = new ethers.Contract(
    depositContractAddress,
    depositContractABI,
    signer
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
