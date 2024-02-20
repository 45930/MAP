import { Mina, PublicKey, fetchAccount, UInt64, method } from 'o1js';
import { LOCAL_BLOCKCHAIN, networkConfig } from './minaConfig';

const useLocalBlockchain = true;
const utf8Decoder = new TextDecoder('utf-8');

export default class ZkappClient {
	apiHost: string;
	hasBeenSetup: boolean;
	instances: Array<string>;

	// async fetchAccount(publicKey58: string): ReturnType<typeof fetchAccount> {
	// 	const response = await fetch(`${this.apiHost}/status`);
	// 	const instances = (await response.json())['instances'];
	// 	this.instances = instances;
	// 	return
	// }

	// getBalance(publicKey58: string): UInt64 {
	// 	const publicKey = this.publicKeyFromBase58(publicKey58);
	// 	const balance = Mina.getBalance(publicKey);
	// 	return balance;
	// }

	async getIpfsHash(publicKey: string): Promise<string> {
		console.log(`${this.apiHost}/${publicKey}/ipfsHash`);
		const response = await fetch(`${this.apiHost}/${publicKey}/ipfsHash`, {
			method: 'GET',
			mode: 'cors'
		});
		return (await response.json()).ipfsHash;
	}

	// getVotes(): Array<number> {
	// 	const votesFields = this.zkapp!.ballot.get();
	// 	const partial1 = new PartialBallot(votesFields.partial1);
	// 	const partial2 = new PartialBallot(votesFields.partial2);
	// 	const votes = [];
	// 	for (const v in partial1.toBigInts()) {
	// 		votes.push(Number(v));
	// 	}
	// 	for (const v in partial2.toBigInts()) {
	// 		votes.push(Number(v));
	// 	}
	// 	return votes;
	// }

	// initZkappInstance(publicKey58: string) {
	// 	console.log('init instance...');
	// 	const publicKey = this.publicKeyFromBase58(publicKey58);
	// 	this.zkapp = new this.Poll!(publicKey);
	// 	console.log('done');
	// }

	async sendTransaction(transactionJSON: any, transactionFee: number) {
		const { hash } = await (window as any).mina.sendTransaction({
			transaction: transactionJSON,
			feePayer: {
				fee: transactionFee,
				memo: ''
			}
		});
		return hash;
	}

	constructor() {
		this.hasBeenSetup = false;
		this.instances = [];
		this.apiHost = 'http://127.0.0.1:5433';
	}
}
