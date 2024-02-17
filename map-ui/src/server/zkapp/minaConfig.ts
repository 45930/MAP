import { Mina } from 'o1js';

export const BERKELEY_CONFIG = {
	mina: 'https://proxy.berkeley.minaexplorer.com/graphql'
};

export const LIGHTNET_CONFIG = {
	mina: 'http://localhost:8080/graphql',
	archive: 'http://localhost:8282',
	lightnetAccountManager: 'http://localhost:8181'
};

export const LOCAL_BLOCKCHAIN = Mina.LocalBlockchain({ proofsEnabled: false });

export const networkConfig = LIGHTNET_CONFIG;
