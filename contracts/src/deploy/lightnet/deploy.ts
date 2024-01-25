import { AccountUpdate, Lightnet, Mina, PrivateKey } from 'o1js';
import { PollWithMwtAuth } from '../../PollWithMwtAuth.js';

const network = Mina.Network({
  mina: 'http://localhost:8080/graphql',
  archive: 'http://localhost:8282',
  lightnetAccountManager: 'http://localhost:8181',
});
Mina.setActiveInstance(network);


const zkAppKey = PrivateKey.fromBase58('EKEaarGjrcg8ro8hGJRjahdesqLE9fnyBNCzbAzy33j8zMzYmFMh');
const zkAppAddress = zkAppKey.toPublicKey();
const zkApp = new PollWithMwtAuth(zkAppAddress);

const senderKey = (await Lightnet.acquireKeyPair()).privateKey;
const sender = senderKey.toPublicKey();

await PollWithMwtAuth.compile();

let tx = await Mina.transaction({ sender, fee: 10_000_000 }, () => {
  AccountUpdate.fundNewAccount(sender);
  zkApp.deploy();
});
await tx.prove();
// this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
await tx.sign([zkAppKey, senderKey]).send();
