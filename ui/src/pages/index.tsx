
import Head from 'next/head';
import Image from 'next/image';
import { useEffect } from 'react';
import styles from '../styles/Home.module.css';
import heroMinaLogo from '../../public/assets/hero-mina-logo.svg';
import arrowRightSmall from '../../public/assets/arrow-right-small.svg';
import PollSummary from '@/components/PollSummary';
import Link from 'next/link.js';

export default function Home() {

  return (
    <>
      <Head>
        <title>Mina Action Polls</title>
        <meta name="description" content="Polling app using o1js and Mina" />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div>
          <h1>Mina Action Polls</h1>
        </div>
        <Link href={`/polls/1`}>
          <PollSummary title="Test Poll 1" summary="A sample UI text to fill in the poll summary" />
        </Link>
        <Link href={`/polls/2`}>
          <PollSummary title="Test Poll 2" summary="A sample UI text to fill in the poll summary" />
        </Link>
        <Link href={`/polls/3`}>
          <PollSummary title="Test Poll 3" summary="A sample UI text to fill in the poll summary" />
        </Link>
      </main>
    </>
  );
}
