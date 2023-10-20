const hre = require("hardhat");

const standalone = process.env['HARDHAT'] === undefined;
if (standalone) {
  console.log("Running in standalone mode");
}

const defaultContractName = "DePhyDIDv0";

const { Command } = require('commander');
const program = new Command();

program
  .requiredOption("-c, --contract", "the contract name", defaultContractName)
  .option("--admin <ADMIN_ADDRESS>", "the minter address")
  .option("--minter <MINTER_ADDRESS>", "the minter address")
  .option("-d, --dry", "dry run")
  .option("--compile", "compile the contract", standalone);

program.parse(process.argv);
const options = program.opts();

const compile = options.compile;
const dryRun = options.dry;

const contractName = options.contract;
if (!contractName || contractName.trim().length === 0) {
  console.error("`--contract` must provide.");
  process.exit(1);
}

async function main() {
  if (compile) {
    await hre.run("compile");
  }
  
  const deployer = (await hre.ethers.getSigners())[0];
  const adminAddress = options.admin ?? deployer.address;
  const minterAddress = options.minter ?? deployer.address;

  console.log(`NFT Admin: ${adminAddress}`);
  console.log(`NFT Minter: ${minterAddress}`);

  const ContractFactory = await hre.ethers.getContractFactory(contractName);

  if (dryRun) {
    await hre.upgrades.validateImplementation(ContractFactory);

    console.log("Dry run mode, the contract won't actual deploy to the network");
    process.exit(0);
  }

  const instance = await hre.upgrades.deployProxy(ContractFactory, [adminAddress, minterAddress]);
  await instance.waitForDeployment();

  console.log(`Proxy deployed to ${await instance.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
