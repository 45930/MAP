import { Mina, PublicKey, fetchAccount, UInt64, PrivateKey, AccountUpdate, Field } from 'o1js';
import { IpfsHash, Poll } from './Poll.js'
import { LOCAL_BLOCKCHAIN, networkConfig } from './minaConfig.js';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

const useLocalBlockchain = false;

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
		const ipfsHashFields = this.instances[publicKey58]!.electionDetailsIpfs.get();
		const ipfsHashString = ipfsHashFields.toString();
		return ipfsHashString;
	}

	getVotes(publicKey58: string): Array<number> {
		const option1 = this.instances[publicKey58]!.option1.get();
		const option2 = this.instances[publicKey58]!.option2.get();
		const option3 = this.instances[publicKey58]!.option3.get();
		return [
			Number(option1.toBigInt()),
			Number(option2.toBigInt()),
			Number(option3.toBigInt())
		]
	}

	initZkappInstance(publicKey58: string) {
		console.log('init instance...');
		if(!Object.hasOwn(this.instances, publicKey58)) {
			const publicKey = this.publicKeyFromBase58(publicKey58);
			this.instances[publicKey58] = new this.Poll!(publicKey);
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
			const ipfsHash = 'QmSoEHyCkk2SraufioCnoM8dcaGupkV1J7oCTYwtsXABPT';
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
			await fetchAccount({publicKey: publicKey58});
			this.initZkappInstance(publicKey58);
		}
		this.hasBeenSetup = true;
		console.log('done');
	}

	async createVoteTransaction(sender58: string, publicKey58: string, votes: Array<number>) {
		await this.setup();

		const poll = this.instances[publicKey58];

		const sender = PublicKey.fromBase58(sender58);

		let vote = 0;
		votes.forEach((v, i) => {
			if(v === 1) {
				vote = i + 1;
				return
			}
		});
		try{
			let tx = await Mina.transaction({ sender, fee: 10_000_000 }, () => {
				poll.castVote(Field.from(vote));
			});
			await tx.prove();
			return tx.toJSON();
		} catch {
			return {};
		}
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
			instances: Object.keys(this.instances)
		}
	}

	hasBeenSetup: boolean;
	Poll: null | typeof Poll;
	instances: Record<string, Poll>
	transaction: null | Transaction;

	constructor() {
		this.hasBeenSetup = false;
		this.Poll = Poll;
		this.instances = {};
		this.transaction = null;
	}
}
