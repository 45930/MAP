import { AccountUpdate, Mina, PrivateKey, fetchAccount } from 'o1js';
import { Poll } from './Poll.js';
import { BERKELEY_CONFIG } from './minaConfig.js';
import 'dotenv/config'

Mina.setActiveInstance(Mina.Network(BERKELEY_CONFIG));

const zkAppKey = PrivateKey.random();
console.log('App public key', zkAppKey.toPublicKey().toBase58());
const zkAppAddress = zkAppKey.toPublicKey();
const zkApp = new Poll(zkAppAddress);

const senderKey = PrivateKey.fromBase58(process.env.PRIVATE_KEY!);
const sender = senderKey.toPublicKey();

await Poll.compile();

await fetchAccount({ publicKey: sender });
let tx = await Mina.transaction({ sender, fee: 10_000_000 }, () => {
  AccountUpdate.fundNewAccount(sender);
  zkApp.deploy();
});
await tx.prove();
await tx.sign([zkAppKey, senderKey]).send();
