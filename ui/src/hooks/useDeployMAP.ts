import { useEffect } from 'react';

export default function useDeployMap() {
  useEffect(() => {
    (async () => {
      const { AccountUpdate, Mina, PrivateKey} = await import('o1js');
      const { PollWithMwtAuth } = await import("../../../contracts/build/src/election_contracts/PollWithMwtAuth")
      
      const Local = Mina.LocalBlockchain();
      Mina.setActiveInstance(Local);
      
      await PollWithMwtAuth.compile();

      const sender = Local.testAccounts[0].publicKey;
      const senderKey = Local.testAccounts[0].privateKey;

      const zkAppKey = PrivateKey.random();
      const zkAppAddress = zkAppKey.toPublicKey();
      const zkApp = new PollWithMwtAuth(zkAppAddress);
      
      let tx = await Mina.transaction({ sender, fee: 100_000_000 }, () => {
        AccountUpdate.fundNewAccount(sender);
        zkApp.deploy();
      });
      await tx.prove();
      // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
      await tx.sign([zkAppKey, senderKey]).send();

      console.log(tx.toPretty());
    })();
  }, []);
}