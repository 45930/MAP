import { AccountUpdate, Mina, PrivateKey, PublicKey, SmartContract } from 'o1js';

export function setupLocalBlockchainAndAccounts(proofsEnabled = false) {
  let Local = Mina.LocalBlockchain({ proofsEnabled });
  Mina.setActiveInstance(Local);
  
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();
  const userKey = PrivateKey.random();
  const userAddress = userKey.toPublicKey();

  const sender = Local.testAccounts[0].publicKey;
  const senderKey = Local.testAccounts[0].privateKey;

  const fundedAccounts = Local.testAccounts.slice(1);

  return {
    zkAppPrivateKey,
    zkAppAddress,
    userKey,
    userAddress,
    sender,
    senderKey,
    fundedAccounts
  }
}

export async function deploy(
  zkApp: SmartContract,
  zkAppPrivateKey: PrivateKey,
  sender: PublicKey,
  senderKey: PrivateKey,
  deployArgs: any = {}
) {
  let tx = await Mina.transaction(sender, () => {
    AccountUpdate.fundNewAccount(sender);
    zkApp.deploy(deployArgs);
  });
  await tx.prove();
  // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
  await tx.sign([zkAppPrivateKey, senderKey]).send();
}