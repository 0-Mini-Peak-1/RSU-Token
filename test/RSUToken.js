const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RSU Token", function () {
  async function deployFixture() {
    const [deployer, merchant, customer] = await ethers.getSigners();
    const rate = 100n;

    const RestaurantToken = await ethers.getContractFactory("RSU Token");
    const token = await RestaurantToken.deploy(merchant.address, rate);

    await token.waitForDeployment();

    return { token, deployer, merchant, customer, rate };
  }

  it("sets roles correctly", async function () {
    const { token, deployer, merchant } = await deployFixture();

    const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
    const MERCHANT_ROLE = await token.MERCHANT_ROLE();

    expect(await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.be.true;
    expect(await token.hasRole(MERCHANT_ROLE, merchant.address)).to.be.true;
  });

  it("merchant can reward customer", async function () {
    const { token, merchant, customer } = await deployFixture();

    const rewardAmount = 50n;
    await token.connect(merchant).reward(customer.address, rewardAmount);

    const balance = await token.balanceOf(customer.address);
    expect(balance).to.equal(rewardAmount);
  });

  it("merchant can redeem from customer", async function () {
    const { token, merchant, customer } = await deployFixture();

    // reward first
    await token.connect(merchant).reward(customer.address, 100n);
    // redeem
    await token.connect(merchant).redeemFrom(customer.address, 40n);

    const balance = await token.balanceOf(customer.address);
    expect(balance).to.equal(60n);
  });

  it("buyTokens mints based on rate", async function () {
    const { token, customer, rate } = await deployFixture();

    // send 1e16 wei (0.01 ETH) as example
    const value = ethers.parseEther("0.01");

    await token.connect(customer).buyTokens({ value });

    const expected = value * rate;
    const balance = await token.balanceOf(customer.address);

    expect(balance).to.equal(expected);
  });
});
