import { AccountUpdate, Mina, PrivateKey, PublicKey, SmartContract, Lightnet } from 'o1js';

export async function setupLocalBlockchainAndAccounts(proofsEnabled = false) {
  const network = Mina.Network({
    mina: 'http://localhost:8080/graphql',
    archive: 'http://localhost:8282',
    lightnetAccountManager: 'http://localhost:8181',
  });
  Mina.setActiveInstance(network);
  
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();
  const userKey = PrivateKey.random();
  const userAddress = userKey.toPublicKey();

  const senderKey = (await Lightnet.acquireKeyPair()).privateKey;
  const sender = senderKey.toPublicKey();

  await Mina.faucet(sender);

  return {
    zkAppPrivateKey,
    zkAppAddress,
    userKey,
    userAddress,
    sender,
    senderKey
  }
}

export async function deploy(
  zkApp: SmartContract,
  zkAppPrivateKey: PrivateKey,
  sender: PublicKey,
  senderKey: PrivateKey,
  deployArgs: any = {}
) {
  let tx = await Mina.transaction({ sender, fee: 100_000_000 }, () => {
    AccountUpdate.fundNewAccount(sender);
    zkApp.deploy(deployArgs);
  });
  await tx.prove();
  // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
  await tx.sign([zkAppPrivateKey, senderKey]).send();
  await new Promise(r => setTimeout(r, 60_000));
}