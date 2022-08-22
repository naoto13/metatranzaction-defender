import { ethers } from 'ethers';
import { createInstance } from './forwarder';
import { signMetaTxRequest } from './signer';

// 通常のtransactionを発行する
// async function sendTx(registry, name) {
//   console.log(`Sending register tx to set name=${name}`);
//   return registry.register(name);
// }

// meta transactionを発行する
async function sendMetaTx(registry, provider, signer, name) {
  console.log(`Sending register meta-tx to set name=${name}`);
  const url = process.env.REACT_APP_WEBHOOK_URL;
  if (!url) throw new Error(`Missing relayer url`);

  const forwarder = createInstance(provider);
  const from = await signer.getAddress();
  const data = registry.interface.encodeFunctionData('register', [name]);
  const to = registry.address;
  // const gas = 32000;
  const gas = 1000000;

  // const value = 100;
  // const nonce = 100;
  // const gaslimit = 32000;
  console.log(`forwarder=${forwarder}, from=${from}`);
  console.log(`data=${data}, to=${to}`);
  
  const request = await signMetaTxRequest(signer.provider, forwarder, { to, from, gas, data });
  // const request = await signMetaTxRequest(signer.provider, forwarder, { to, from, value, nonce, gaslimit, data });

  console.log(`request=${request}`);
  console.log(`JSON.stringify(request)=${JSON.stringify(request)}`);


  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: { 'Content-Type': 'application/json' },
  });
}

// submitボタンが押されたら、この関数が呼ばれます
export async function registerName(registry, provider, name) {
  console.log("registerName");
  if (!name) throw new Error(`Name cannot be empty`);
  if (!window.ethereum) throw new Error(`User wallet not found`);

  console.log("window.ethereum.enable()");
  await window.ethereum.enable();
  const userProvider = new ethers.providers.Web3Provider(window.ethereum);
  const userNetwork = await userProvider.getNetwork();
  console.log("userProvider:"+userProvider);
  console.log("userNetwork:"+userNetwork);
  console.log("userNetwork.chainId:"+userNetwork.chainId);
  // if (userNetwork.chainId !== 100) throw new Error(`Please switch to xDAI for signing`);
  if (userNetwork.chainId !== 5) throw new Error(`Please switch to goeli for signing`);

  const signer = userProvider.getSigner();
  console.log("signer:"+signer);
  // 自分のaddress
  // const from = await signer.getAddress();
  // const balance = await provider.getBalance(from);
  
  // const canSendTx = balance.gt(1e15);
  // // 一定の残高があれば通常のtransactionを発行する
  // if (canSendTx) return sendTx(registry.connect(signer), name);
  // // 一定の残高がなければmeta transactionを発行する
  // else return sendMetaTx(registry, provider, signer, name);
  return sendMetaTx(registry, provider, signer, name);
}
