import { Mina, PublicKey, fetchAccount, UInt64, PrivateKey, AccountUpdate } from 'o1js';
import { IpfsHash, PartialBallot, Poll } from 'voting-playground-contracts';
import { LOCAL_BLOCKCHAIN, networkConfig } from './minaConfig.js';

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

	getIpfsHash(publicKey58: string): string {
		const ipfsHashFields = this.instnaces[publicKey58]!.electionDetailsIpfs.get();
		const ipfsHashString = ipfsHashFields.toString();
		return ipfsHashString;
	}

	getVotes(publicKey58: string): Array<number> {
		const votesFields = this.instnaces[publicKey58]!.ballot.get();
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
		if(!Object.hasOwn(this.instnaces, publicKey58)) {
			const publicKey = this.publicKeyFromBase58(publicKey58);
			this.instnaces[publicKey58] = new this.Poll!(publicKey);
		}
		console.log('done');
	}

	async setup() {
		if (this.hasBeenSetup) return;

		this.setActiveInstance();

		console.log('setting up Zkapp...');
		this.loadContract();
		await this.compileContract();
		
		this.hasBeenSetup = true;
		console.log('done');
	}

	async setupZkappInstance(publicKey58: string) {
		await this.setup();
		
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

	status() {
		return {
			hasBeenSetup: this.hasBeenSetup,
			instnaces: Object.keys(this.instnaces)
		}
	}

	hasBeenSetup: boolean;
	Poll: null | typeof Poll;
	instnaces: Record<string, Poll>
	transaction: null | Transaction;

	constructor() {
		this.hasBeenSetup = false;
		this.Poll = Poll;
		this.instnaces = {};
		this.transaction = null;
	}
}
