const accountExists = res.error == null;

await zkappWorkerClient.loadContract();

console.log('Compiling zkApp...');
setDisplayText('Compiling zkApp...');
await zkappWorkerClient.compileContract();
console.log('zkApp compiled');
setDisplayText('zkApp compiled...');

const zkappPublicKey = PublicKey.fromBase58(ZKAPP_ADDRESS);

await zkappWorkerClient.initZkappInstance(zkappPublicKey);

console.log('Getting zkApp state...');
setDisplayText('Getting zkApp state...');
await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
const currentNum = await zkappWorkerClient.getNum();
console.log(`Current state in zkApp: ${currentNum.toString()}`);
setDisplayText('');
