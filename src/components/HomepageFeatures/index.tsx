import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: '👩‍💻🫱🏽‍🫲🏾🧑🏻‍💻 Made for fullstack',
    description: (
      <>
        You can start any server, app, website inside of corgi easily. <code>.env</code> will be wired up and ready to go in each one.
      </>
    ),
  },
  {
    title: '🙌 Pizza circle',
    description: (
      <>
        Corgi is designed for teams, so you can share your setup (populated database, required tech, etc),
        and your peers can reproduce whatever is going on in minutes.
      </>
    ),
  },
  {
    title: '🛠️ Useful tools',
    description: (
      <>
        We also include some helpful things, like auto opening docker on db starts and db population from your data, so you don't have to.
      </>
    ),
  },
  {
    title: '👓 Transparent',
    description: (
      <>
        When you create database service, it created files on your local, as helpers, so you understand what is going on.
      </>
    ),
  },
  {
    title: '🚀 Written in Go',
    description: (
      <>
        It is written in go, so it is pretty fast. Services run concurrently when it is useful.
      </>
    ),
  },
  {
    title: '💪 Brings you up to speed',
    description: (
      <>
        Save a lot of time in context switching between projects and laptops.
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
