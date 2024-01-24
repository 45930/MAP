import { Field, Mina, UInt64, Lightnet, PrivateKey, PublicKey } from "o1js";
import { Ballot, PartialBallot, PollWithMwtAuth } from "../src/PollWithMwtAuth.js"
import { deploy, setupLocalBlockchainAndAccounts } from "./testUtils.js"
import { MWT } from "mina-web-tokens";

describe('PollWithMwtAuth', () => {
  let
    zkAppPrivateKey: PrivateKey,
    zkAppAddress: PublicKey,
    userKey: PrivateKey,
    userAddress: PublicKey,
    sender: PublicKey,
    senderKey: PrivateKey
  
  let zkapp: PollWithMwtAuth;

  beforeAll(async () => {
    const d = await setupLocalBlockchainAndAccounts();
    zkAppPrivateKey = d.zkAppPrivateKey;
    zkAppAddress = d.zkAppAddress;
    userKey = d.userKey;
    userAddress = d.userAddress;
    sender = d.sender;
    senderKey = d.senderKey;
    await PollWithMwtAuth.compile();
  });

  beforeEach(async () => {
    const d = await setupLocalBlockchainAndAccounts();
    zkAppPrivateKey = d.zkAppPrivateKey;
    zkAppAddress = d.zkAppAddress;
    userKey = d.userKey;
    userAddress = d.userAddress;
    sender = d.sender;
    senderKey = d.senderKey;
    zkapp = new PollWithMwtAuth(zkAppAddress);
  });

  it('Allows user to participate in poll with MWT auth', async () => {
    await deploy(zkapp, zkAppPrivateKey, sender, senderKey);

    const pb1 = PartialBallot.fromBigInts([0n, 0n, 1n, 0n, 0n, 0n, 0n]);
    const pb2 = PartialBallot.fromBigInts([0n, 0n, 0n, 0n, 0n, 0n, 0n]);
    const ballot = new Ballot({
      partial1: pb1.packed,
      partial2: pb2.packed
    });

    const tokenData = {
      iss: userAddress,
      sub: zkAppAddress,
      exp: UInt64.from((new Date()).getTime() + 15_000),
      scope: Field(1)
    };
    
    const mwt = new MWT(tokenData).sign(userKey);
    let tx = await Mina.transaction({ sender, fee: 100_000_000 }, () => {
      zkapp.castVote(ballot, mwt, tokenData);
    });
    await tx.prove();
    await tx.sign([senderKey]).send();

    tx =await Mina.transaction({ sender, fee: 100_000_000 }, () => {
      zkapp.reduceVotes();
    });
    await tx.prove();
    await tx.sign([senderKey]).send();
    
    const stateValue = zkapp.ballot.get();
    const statePb1 = (new PartialBallot(stateValue.partial1)).toBigInts();
    console.log(statePb1);
    expect(statePb1).toMatchObject([0n, 0n, 1n, 0n, 0n, 0n, 0n]);
    expect(stateValue.partial2.toBigInt()).toBe(0n);
  });
});