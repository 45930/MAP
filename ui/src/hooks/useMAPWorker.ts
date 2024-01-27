import MAPWorkerClient from '@/pages/api/MAPWorkerClient';
import { Mina, PublicKey } from 'o1js';
import { useEffect } from 'react';
import ZkappStore from './ZkAppStore';
import { useStore } from '@tanstack/react-store';

export default function useLoad() {
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
        zkappStore.worker = zkappWorkerClient;
      }
    })();
    
  }, [zkappStore]);
}
