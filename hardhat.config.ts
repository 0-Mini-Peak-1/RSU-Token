import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "dotenv/config";

const { SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

export default defineConfig({
  solidity: "0.8.20",
  plugins: [hardhatToolboxMochaEthers],
  networks: {
    // Local Hardhat network
    hardhat: {
      type: "edr-simulated",
      chainId: 31337,
    },

    // Sepolia testnet
    sepolia: {
      type: "http",
      url: SEPOLIA_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
  },
});
