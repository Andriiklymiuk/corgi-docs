import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import CodeBlock from '@theme/CodeBlock'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './index.module.css';
import Head from '@docusaurus/Head';

function TerminalBlock({ label, language, children }: { label: string; language: string; children: string }) {
  return (
    <div className={styles.terminal}>
      <div className={styles.terminalChrome}>
        <span className={styles.terminalDot} aria-hidden />
        <span className={styles.terminalLabel}>{label}</span>
      </div>
      <CodeBlock language={language}>{children}</CodeBlock>
    </div>
  );
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <div className={clsx(styles.heroLogo, styles.heroFadeIn)}>
          <img src="/corgi/img/logo.svg" alt="Corgi logo" />
        </div>
        <h1 className={clsx(styles.heroTitle, styles.heroFadeIn)}>
          {siteConfig.title.replace(' 🐶', '')} <span className={styles.heroAccent}>🐶</span>
        </h1>
        <p className={clsx(styles.heroTagline, styles.heroFadeInDelay)}>{siteConfig.tagline}</p>

        <div className={clsx(styles.installShell, styles.heroFadeInDelay, 'installTabsRoot')}>
          <Tabs groupId="install">
            <TabItem value="brew" label="Homebrew" default>
              <TerminalBlock label="zsh — macOS / Linux" language="bash">
                {"brew install andriiklymiuk/homebrew-tools/corgi"}
              </TerminalBlock>
            </TabItem>
            <TabItem value="script" label="Install script">
              <TerminalBlock label="zsh — no Homebrew needed" language="bash">
                {"curl -fsSL https://raw.githubusercontent.com/Andriiklymiuk/corgi/main/install.sh | sh"}
              </TerminalBlock>
            </TabItem>
            <TabItem value="powershell" label="PowerShell">
              <TerminalBlock label="pwsh — Windows" language="powershell">
                {"irm https://raw.githubusercontent.com/Andriiklymiuk/corgi/main/install.ps1 | iex"}
              </TerminalBlock>
            </TabItem>
          </Tabs>
        </div>

        <div className={clsx(styles.installShell, styles.tryItBlock, styles.heroFadeInDelay2)}>
          <TerminalBlock label="try it" language="bash">
            {"corgi -h # verify install\n\n# expo + hono server example\ncorgi run -t https://github.com/Andriiklymiuk/corgi_examples/blob/main/honoExpoTodo/hono-bun-expo.corgi-compose.yml"}
          </TerminalBlock>
        </div>

        <div className={clsx(styles.ctaRow, styles.heroFadeInDelay2)}>
          <Link className={styles.primaryButton} to="/docs/intro">
            Woof explanations <span aria-hidden>·</span> 10 min ⏱️
          </Link>
          <Link
            className={styles.secondaryButton}
            to="https://marketplace.visualstudio.com/items?itemName=Corgi.corgi">
            <span aria-hidden>{"</>"}</span> Vscode extension
          </Link>
        </div>
      </div>
    </header>
  );
}

function YouTubeVideo() {
  return (
    <div className="container margin-top--xl margin-bottom--xl">
      <div className="row">
        <div className="col col--8 col--offset-2">
          <div className="text--center margin-bottom--lg">
            <h2>Watch How It Works</h2>
          </div>
          <div className="video-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src="https://www.youtube.com/embed/rlMCjs4EoFs?si=65B1lHOxA1LN16Uf"
              title="Corgi Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen>
            </iframe>
          </div>
        </div>
      </div>
    </div>
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
        <meta name="msapplication-TileImage" content="img/browser/ms-icon-144x144.png" />
        <link rel="shortcut icon" href="img/favicon.ico" />
      </Head>
      <Layout
        description="Compose and share projects with your peers">
        <HomepageHeader />
        <main>
          <YouTubeVideo />
          <HomepageFeatures />
        </main>
      </Layout>
    </>
  );
}