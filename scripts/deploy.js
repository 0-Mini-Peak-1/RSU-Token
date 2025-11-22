// scripts/deploy.js

import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deployer (admin):", deployer.address);

  const rate = 100n; // 1 native coin -> 100 RSU (can be adjusted later)

  const RSUToken = await ethers.getContractFactory("RSUToken", deployer);
  const token = await RSUToken.deploy(rate);

  console.log("Deploying RSUToken...");
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("RSUToken deployed to:", tokenAddress);
  console.log("Admin (DEFAULT_ADMIN_ROLE):", deployer.address);
  console.log("Note: No merchant set yet. Call setMerchant() later.");
}


main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});