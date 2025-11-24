// scripts/deploy.js
// Hardhat v3 deploy script (ESM)
// Works for Sepolia + localhost

import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  // Get signer (deployer)
  const [deployer] = await ethers.getSigners();

  console.log("=======================================");
  console.log("Deploying RSUToken...");
  console.log("Deployer address:", deployer.address);
  console.log("=======================================");

  // Set token exchange rate
  const rate = 100n;

  // Compile and deploy contract
  const RSUToken = await ethers.getContractFactory("RSUToken", deployer);
  const token = await RSUToken.deploy(rate);

  console.log("Waiting for deployment...");
  await token.waitForDeployment();

  const deployedAddress = await token.getAddress();

  console.log("=======================================");
  console.log("RSUToken successfully deployed!");
  console.log("Contract address:", deployedAddress);
  console.log("Admin assigned:", deployer.address);
  console.log("Rate:", rate.toString(), "RSU per 1 ETH");
  console.log("=======================================");
}

main().catch((err) => {
  console.error("❌ Deployment failed:");
  console.error(err);
  process.exitCode = 1;
});
