import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';
import Head from '@docusaurus/Head';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Woof explanations - 10 min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <>
      <Head>
        <link rel="apple-touch-icon" sizes="57x57" href="img/browser/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="img/browser/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="img/browser/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="img/browser/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="img/browser/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="img/browser/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="img/browser/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="img/browser/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="img/browser/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="img/browser/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="img/browser/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="img/browser/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="img/browser/favicon-16x16.png" />
        <link rel="manifest" href="img/browser/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="img/browser/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Layout
        description="Corgi docs for how to use corgi cli">
        <HomepageHeader />
        <main>
          <HomepageFeatures />
        </main>
      </Layout>
    </>
  );
}
