import {  Mina, PrivateKey, PublicKey } from "o1js";
import { IpfsHash, Poll } from "./Poll.js";
import { BERKELEY_CONFIG } from "./minaConfig.js";
import 'dotenv/config'

const ipfsHash = 'QmSoEHyCkk2SraufioCnoM8dcaGupkV1J7oCTYwtsXABPT';
const packedIpfsHash = IpfsHash.fromString(ipfsHash);

Mina.setActiveInstance(Mina.Network(BERKELEY_CONFIG));
const fee = 0.1 * 10e9;

const zkAppAddress = PublicKey.fromBase58('B62qqy4mWSPJ5gDQDC4HADZYdQ3yCTxZDS9SAib4L7eTqakBoktmq1q')
const zkApp = new Poll(zkAppAddress);

const senderKey = PrivateKey.fromBase58(process.env.PRIVATE_KEY!);
const sender = senderKey.toPublicKey();

console.log('compile the contract...');
await Poll.compile();
try {
  // call update() and send transaction
  console.log('build transaction and create proof...');
  let tx = await Mina.transaction({ sender, fee }, () => {
    zkApp.setElectionDetails(packedIpfsHash);
  });
  await tx.prove();
  console.log('send transaction...');
  await tx.sign([senderKey]).send();
} catch (err) {
  console.log(err);
}