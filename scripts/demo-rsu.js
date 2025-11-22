// scripts/demo-rsu.js

import { network } from "hardhat";

// Connect to the current Hardhat network and get ethers
const { ethers } = await network.connect();

async function main() {
  // Use 3 accounts:
  // - deployer (admin)
  // - merchant (has MERCHANT_ROLE)
  // - customer (simulates a real user)
  const [deployer, merchant, customer] = await ethers.getSigners();

  console.log("Deployer:", deployer.address);
  console.log("Merchant:", merchant.address);
  console.log("Customer:", customer.address);

  // 👉 Your local RSUToken address from the deploy log
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Get a contract instance, connected as the merchant (who can reward/redeem)
  const rsu = await ethers.getContractAt("RSUToken", tokenAddress, merchant);

  // 1) Check initial balances
  console.log("\n== Initial balances ==");
  console.log("Customer RSU:", (await rsu.balanceOf(customer.address)).toString());

  // 2) Reward the customer (simulate paying the bill)
  const rewardAmount = 100n; // 100 RSU
  console.log(`\nMerchant rewards ${rewardAmount} RSU to customer...`);
  const txReward = await rsu.reward(customer.address, rewardAmount);
  await txReward.wait();

  console.log("Customer RSU after reward:", (await rsu.balanceOf(customer.address)).toString());

  // 3) Customer redeems some tokens
  const rsuAsCustomer = rsu.connect(customer);
  const redeemAmount = 30n;
  console.log(`\nCustomer redeems ${redeemAmount} RSU...`);
  const txRedeem = await rsuAsCustomer.redeem(redeemAmount);
  await txRedeem.wait();

  console.log("Customer RSU after redeem:", (await rsu.balanceOf(customer.address)).toString());

  // 4) Customer buys tokens with native coin (optional)
  const buyValue = ethers.parseEther("0.01"); // 0.01 ETH on local network
  console.log(`\nCustomer buys RSU with ${buyValue.toString()} wei...`);
  const txBuy = await rsuAsCustomer.buyTokens({ value: buyValue });
  await txBuy.wait();

  console.log("Customer RSU after buyTokens:", (await rsu.balanceOf(customer.address)).toString());

  console.log("\n✅ Demo finished!");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});