import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>RxCld Web3 Tools</title>
        <meta
          name="description"
          content="Sign transactions without broadcasting them"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>

        <h1 className={styles.title}>
          RxCld Web3 Tools
        </h1>

        <p className={styles.description}>
          Sign transactions without broadcasting them
        </p>

        <div className={styles.grid}>
          <Link className={styles.card} href="/raw-tx">
            <h2>Raw tx</h2>
            <p>Sign and get raw transaction</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
