import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from "next/router";

import styles from '../../styles/Home.module.css';
import { useContext } from 'react';
import { ZkappStore } from '@/hooks';
import { useStore } from '@tanstack/react-store';

const PollDetails = () => {
  const router = useRouter();
  const zkappStore = useStore(ZkappStore);
  const {
    query: { pollId },
  } = router;
  const appState = zkappStore.mina.getAccount(zkappStore.instance.address).zkapp?.appState;
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
        <div>Poll deployed at: {zkappStore.address}, with state: {appState?.toString()}</div>
      </main>
    </>
  )
}

export default PollDetails;