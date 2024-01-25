import { Mina, PrivateKey } from "o1js";
import { Store } from "@tanstack/store";

import { PollWithMwtAuth } from "../../../contracts/src/PollWithMwtAuth"

const network = Mina.Network({
  mina: 'http://localhost:8080/graphql',
  archive: 'http://localhost:8282',
  lightnetAccountManager: 'http://localhost:8181',
});
Mina.setActiveInstance(network);

const zkAppKey = PrivateKey.fromBase58('EKEaarGjrcg8ro8hGJRjahdesqLE9fnyBNCzbAzy33j8zMzYmFMh');
const zkAppAddress = zkAppKey.toPublicKey();
const zkApp = new PollWithMwtAuth(zkAppAddress);

const ZkappStore = new Store({
  address: zkAppAddress.toBase58(),
  instance: zkApp,
  mina: Mina
});

export default ZkappStore;