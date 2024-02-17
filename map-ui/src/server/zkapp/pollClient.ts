/**
 * This file and pattern was lifted from https://github.com/t4top/mina-wordle-game/blob/main/ui/src/lib/zkapp/zkapp_client.ts
 *
 * TY t4top!
 *
 */

import { Mina, PublicKey, fetchAccount, UInt64, PrivateKey, AccountUpdate } from 'o1js';
import { IpfsHash, PartialBallot, Poll } from 'voting-playground-contracts';
import { LOCAL_BLOCKCHAIN, networkConfig } from './minaConfig';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

const useLocalBlockchain = true;

export default class ZkappClient {
	setActiveInstance() {
		const network = useLocalBlockchain ? LOCAL_BLOCKCHAIN : Mina.Network(networkConfig);
		Mina.setActiveInstance(network);
	}

	publicKeyFromBase58(publicKey58: string) {
		return PublicKey.fromBase58(publicKey58);
	}

	loadContract() {
		console.log('loading contract...');
		this.Poll = Poll;
		console.log('done');
	}

	async compileContract() {
		console.log('compiling contract...');
		await this.Poll!.compile();
		console.log('done');
	}

	async fetchAccount(publicKey58: string): ReturnType<typeof fetchAccount> {
		const publicKey = this.publicKeyFromBase58(publicKey58);
		return await fetchAccount({ publicKey });
	}

	getBalance(publicKey58: string): UInt64 {
		const publicKey = this.publicKeyFromBase58(publicKey58);
		const balance = Mina.getBalance(publicKey);
		return balance;
	}

	getIpfsHash(): string {
		const ipfsHashFields = this.zkapp!.electionDetailsIpfs.get();
		const ipfsHashString = ipfsHashFields.toString();
		return ipfsHashString;
	}

	getVotes(): Array<number> {
		const votesFields = this.zkapp!.ballot.get();
		const partial1 = new PartialBallot(votesFields.partial1);
		const partial2 = new PartialBallot(votesFields.partial2);
		const votes = [];
		for (const v in partial1.toBigInts()) {
			votes.push(Number(v));
		}
		for (const v in partial2.toBigInts()) {
			votes.push(Number(v));
		}
		return votes;
	}

	initZkappInstance(publicKey58: string) {
		console.log('init instance...');
		const publicKey = this.publicKeyFromBase58(publicKey58);
		this.zkapp = new this.Poll!(publicKey);
		console.log('done');
	}

	async setupZkappInstance(publicKey58: string) {
		if (this.hasBeenSetup) return;

		console.log('setting up Zkapp...');
		this.loadContract();
		await this.compileContract();
		if (useLocalBlockchain) {
			const zkAppKey = PrivateKey.random();
			const zkAppAddress = zkAppKey.toPublicKey();
			const senderKey = LOCAL_BLOCKCHAIN.testAccounts[0].privateKey;
			const sender = senderKey.toPublicKey();
			const zkApp = new Poll(zkAppAddress);
			const ipfsHash = 'QmPKD74Pfc6aH5Suh1EXqjbfKBYDs5QVARxmpqsNKMKxe3';
			const packedIpfsHash = IpfsHash.fromString(ipfsHash);

			let tx = await Mina.transaction({ sender, fee: 10_000_000 }, () => {
				AccountUpdate.fundNewAccount(sender);
				zkApp.deploy();
			});
			await tx.prove();
			// this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
			await tx.sign([zkAppKey, senderKey]).send();

			tx = await Mina.transaction({ sender, fee: 10_000_000 }, () => {
				zkApp.setElectionDetails(packedIpfsHash);
			});
			await tx.prove();
			console.log('send transaction...');
			await tx.sign([senderKey]).send();
			this.initZkappInstance(zkAppAddress.toBase58());
		} else {
			this.initZkappInstance(publicKey58);
		}
		this.hasBeenSetup = true;
		console.log('done');
	}

	async createVoteTransaction() {
		// todo
	}

	async proveTransaction() {
		await this.transaction!.prove();
	}

	async getTransactionJSON() {
		return this.transaction!.toJSON();
	}

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

	hasBeenSetup: boolean;
	Poll: null | typeof Poll;
	zkapp: null | Poll;
	transaction: null | Transaction;

	constructor() {
		this.hasBeenSetup = false;
		this.Poll = Poll;
		this.zkapp = null;
		this.transaction = null;
	}
}
