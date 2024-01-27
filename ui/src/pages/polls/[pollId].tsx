import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from "next/router";

import styles from '../../styles/Home.module.css';
import { ZkappStore } from '@/hooks';
import { useStore } from '@tanstack/react-store';
import useMAPWorker from '@/hooks/useMAPWorker';

const PollDetails = () => {
  const router = useRouter();
  const zkappStore = useStore(ZkappStore);
  useMAPWorker();
  const {
    query: { pollId },
  } = router;

  return(
    <>
      <Head>
        <title>Mina Action Polls</title>
        <meta name="description" content="Polling app using o1js and Mina" />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Link href="/"><h2>Home</h2></Link>
        <div>This is poll {pollId}</div>
        <div>Current poll state: {zkappStore.worker ? zkappStore.worker.getAppState() : ''}</div>
      </main>
    </>
  )
}

export default PollDetails;