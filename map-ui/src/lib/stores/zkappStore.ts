import { writable } from 'svelte/store';

class ZkappClient {
	apiHost: string;
	hasBeenSetup: boolean;
	instances: Array<string>;

	async getStatus() {
		const response = await fetch(`${this.apiHost}/status`);
		return await response.json();
	}

	async getIpfsHash(publicKey: string): Promise<string> {
		const response = await fetch(`${this.apiHost}/${publicKey}/ipfsHash`);
		return (await response.json()).ipfsHash;
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

	constructor() {
		this.hasBeenSetup = false;
		this.instances = [];
		this.apiHost = 'http://127.0.0.1:5433';
	}
}

const zkappClient = new ZkappClient();

export default writable(zkappClient);
