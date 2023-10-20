const hre = require("hardhat");

const standalone = process.env['HARDHAT'] === undefined;
if (standalone) {
  console.log("Running in standalone mode");
}

const defaultContractName = "DePhyDIDv0";

const { Command } = require('commander');
const program = new Command();

program
  .requiredOption("-a, --address <CONTRACT_ADDRESS>", "the origin contract address")
  .requiredOption("-c, --contract", "the contract name", defaultContractName)
  .option("-d, --dry", "dry run")
  .option("--compile", "compile the contract", standalone);

program.parse(process.argv);
const options = program.opts();

const compile = options.compile;
const dryRun = options.dry;

const contractAddress = options.address;
if (!contractAddress || contractAddress.trim().length === 0) {
  console.error("`--address` must provide.");
  process.exit(1);
}
const contractName = options.contract;
if (!contractName || contractName.trim().length === 0) {
  console.error("`--contract` must provide.");
  process.exit(1);
}

async function main() {
  if (compile) {
    await hre.run("compile");
  }

  if (dryRun) {
    console.log("Dry run mode, the contract won't actual deploy to the network");
    process.exit(0);
  }

  const ContractFactory = await hre.ethers.getContractFactory(contractName);

  if (dryRun) {
    await hre.upgrades.validateUpgrade(contractAddress, ContractFactory);

    console.log("Dry run mode, the contract won't actual deploy to the network");
    process.exit(0);
  }

  const _upgradedInstance = await hre.upgrades.upgradeProxy(contractAddress, ContractFactory);

  console.log(`Contract upgraded`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
