import MAPWorkerClient from '@/pages/api/MAPWorkerClient';
import { Mina, PublicKey } from 'o1js';
import { useEffect } from 'react';
import ZkappStore from './ZkAppStore';
import { useStore } from '@tanstack/react-store';

export default function useMAPWorker() {
  const zkappStore = useStore(ZkappStore);
  useEffect(() => {
    async function timeout(seconds: number): Promise<void> {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, seconds * 1000);
      });
    }

    (async () => {
      if (!zkappStore.instance) {
        console.log('Loading web worker...');
        const zkappWorkerClient = new MAPWorkerClient();
        await timeout(5);

        console.log('Done loading web worker');

        await zkappWorkerClient.setActiveInstanceToLocal();

        const mina = (window as any).mina;

        // if (mina == null) {
        //   setState({ ...state, hasWallet: false });
        //   return;
        // }

        // const publicKeyBase58: string = (await mina.requestAccounts())[0];
        // const publicKey = PublicKey.fromBase58(publicKeyBase58);

        // console.log(`Using key:${publicKey.toBase58()}`);

        // console.log('Checking if fee payer account exists...');

        // const res = await zkappWorkerClient.fetchAccount({
        //   publicKey: publicKey!
        // });
        // const accountExists = res.error == null;
      }
    })();
  }, [zkappStore]);
}
