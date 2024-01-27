import { Mina, PublicKey, fetchAccount } from 'o1js';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import { PollWithMwtAuth } from '../../../../contracts/src/PollWithMwtAuth';

const state = {
  PollWithMwtAuth: null as null | typeof PollWithMwtAuth,
  zkapp: null as null | PollWithMwtAuth,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToLocal: async (args: {}) => {
    const network = Mina.Network({
      mina: 'http://localhost:8080/graphql',
      archive: 'http://localhost:8282',
      lightnetAccountManager: 'http://localhost:8181',
    });
    Mina.setActiveInstance(network);
  },
  loadContract: async (args: {}) => {
    const { PollWithMwtAuth } = await import('../../../../contracts/build/src/PollWithMwtAuth.js');
    state.PollWithMwtAuth = PollWithMwtAuth;
  },
  compileContract: async (args: {}) => {
    await state.PollWithMwtAuth!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.PollWithMwtAuth!(publicKey);
  },
  getBallots: async (args: {}) => {
    const ballot = await state.zkapp!.ballot.get();
    return JSON.stringify(ballot);
  },
  proveUpdateTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  },
  getAppState: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    const zkapp = new PollWithMwtAuth(publicKey);
    return zkapp.ballot;
  }
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== 'undefined') {
  addEventListener(
    'message',
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );
}

console.log('Web Worker Successfully Initialized.');