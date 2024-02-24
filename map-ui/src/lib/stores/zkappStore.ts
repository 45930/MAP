import { writable } from 'svelte/store';

class ZkappClient {
	account: any;
	connected: boolean;
	apiHost: string;
	hasBeenSetup: boolean;
	instances: Array<string>;

	async getStatus() {
		const response = await fetch(`${this.apiHost}/status`);
		const status = await response.json();
		this.instances = status.instances;
		this.hasBeenSetup = status.hasBeenSetup;
		return status;
	}

	async getIpfsHash(publicKey: string): Promise<string> {
		const response = await fetch(`${this.apiHost}/${publicKey}/ipfsHash`);
		return (await response.json()).ipfsHash;
	}

	async vote(publicKey: string, votes: Array<number>) {
		const resp = await fetch(`${this.apiHost}/${publicKey}/vote`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				sender: this.account[0],
				votes
			})
		});
		return await resp.json();
	}

	async connect() {
		if (!this.connected) {
			const account = await (window as any).mina.requestAccounts().catch((err: any) => err);

			console.log(account);
			this.connected = true;
			this.account = account;
		}
	}

	async sendTransaction(transactionJSON: any, transactionFee: number) {
		const { hash } = await (window as any).mina.sendTransaction({
			transaction: JSON.stringify(transactionJSON),
			feePayer: {
				memo: ''
			}
		});
		return hash;
	}

	constructor() {
		this.connected = false;
		this.hasBeenSetup = false;
		this.instances = [];
		this.apiHost = 'http://127.0.0.1:5433';
	}
}

const zkappClient = new ZkappClient();

export default writable(zkappClient);
