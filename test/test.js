const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DePhyDIDv0", function () {
  it("Test contract", async function () {
    const ContractFactory = await ethers.getContractFactory("DePhyDIDv0");

    const defaultAdmin = (await ethers.getSigners())[0].address;
    const minter = (await ethers.getSigners())[1].address;

    const instance = await upgrades.deployProxy(ContractFactory, [defaultAdmin, minter]);
    await instance.waitForDeployment();

    expect(await instance.name()).to.equal("DePhyDID");
  });
});
