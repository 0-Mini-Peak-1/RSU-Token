// scripts/set-merchant.js

import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  // Admin (deployer) must run this
  const [admin] = await ethers.getSigners();

  const rsuAddress = "0xC4B281E8C5A9833e2f5C7AA638E54B1af6AC27f5";
  const merchantAddress = "MERCHANT_WALLET_ADDRESS_HERE";

  console.log("Admin:", admin.address);
  console.log("Setting merchant to:", merchantAddress);

  const rsu = await ethers.getContractAt("RSUToken", rsuAddress, admin);

  const tx = await rsu.setMerchant(merchantAddress);
  await tx.wait();

  console.log("✅ Merchant set successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});