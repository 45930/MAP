import { AccountUpdate, Mina, PrivateKey } from 'o1js';
import { PollWithMwtAuth } from '../../PollWithMwtAuth.js';

const zkAppKey = PrivateKey.random();
const zkAppAddress = zkAppKey.toPublicKey();
const zkApp = new PollWithMwtAuth(zkAppAddress);

const senderKey = PrivateKey.random();
const sender = senderKey.toPublicKey();

await Mina.faucet(sender);

let tx = await Mina.transaction({ sender, fee: 10_000_000 }, () => {
  AccountUpdate.fundNewAccount(sender);
  zkApp.deploy();
});
await tx.prove();
// this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
await tx.sign([zkAppKey, senderKey]).send();
