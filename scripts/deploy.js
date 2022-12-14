const { ethers } = require('hardhat');
const { writeFileSync } = require('fs');

async function deploy(name, ...params) {
  const Contract = await ethers.getContractFactory(name);
  return await Contract.deploy(...params).then(f => f.deployed());
}

async function main() {
  // 先にforwarderをdeploy
  const forwarder = await deploy('MinimalForwarder');
  // forwarderのaddressを渡してdeploy
  const registry = await deploy("Registry", forwarder.address);

  // 後でcontract addressを参照するために、deploy.jsonに出力しておく
  writeFileSync('deploy.json', JSON.stringify({
    MinimalForwarder: forwarder.address,
    Registry: registry.address,
  }, null, 2));

  console.log(`MinimalForwarder: ${forwarder.address}\nRegistry: ${registry.address}`);
}

if (require.main === module) {
  main().then(() => process.exit(0))
    .catch(error => { console.error(error); process.exit(1); });
}