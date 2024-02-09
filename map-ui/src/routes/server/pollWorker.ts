import { Mina, PublicKey, fetchAccount } from 'o1js';
import { Poll, IpfsHash } from 'voting-playground-contracts';

const network = Mina.Network({
  mina: 'http://localhost:8080/graphql',
  archive: 'http://localhost:8282',
  lightnetAccountManager: 'http://localhost:8181',
});
Mina.setActiveInstance(network);

export const getIpfsHash = async (zkAppAddress: string): Promise<string> => {
  const addressPublicKey = PublicKey.fromBase58(zkAppAddress);
  const acct = await fetchAccount({ publicKey: addressPublicKey });
  const onChainIpfsHash = acct.account!.zkapp!.appState.slice(0, 2)
  return IpfsHash.fromFields(onChainIpfsHash).toString();
}