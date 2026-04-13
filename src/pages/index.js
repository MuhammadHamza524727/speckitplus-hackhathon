import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        {/* heroInner ensures side-by-side layout via its own flex class */}
        <div className={styles.heroInner}>

          {/* ── LEFT: Text Content ── */}
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>📚 AI-Native Textbook</div>

            <h1 className={styles.heroTitle}>
              Physical AI &amp;
              <span className={styles.heroTitleAccent}> Humanoid Robotics</span>
            </h1>

            <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>

            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>10+</span>
                <span className={styles.statLabel}>Chapters</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>RAG</span>
                <span className={styles.statLabel}>AI Assistant</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>Free</span>
                <span className={styles.statLabel}>Open Access</span>
              </div>
            </div>

            <div className={styles.buttons}>
              <Link
                className={clsx('button button--lg', styles.primaryBtn)}
                to="/docs/chapter1-intro">
                Start Reading →
              </Link>
              <Link
                className={clsx('button button--lg', styles.ghostBtn)}
                to="/docs/chapter2-ros2">
                View Chapters
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Visual / Robot ── */}
          <div className={styles.heroVisual}>
            <div className={styles.robotCircle}>
              <span className={styles.robotEmoji}>🤖</span>
            </div>
            <div className={styles.orbitRing} />
            <div className={styles.orbitRing2} />
            <div className={styles.floatingTag} style={{ top: '8%', right: '0%' }}>ROS 2</div>
            <div className={styles.floatingTag} style={{ bottom: '15%', right: '-8%' }}>SLAM</div>
            <div className={styles.floatingTag} style={{ top: '52%', left: '-12%' }}>Isaac Sim</div>
          </div>

        </div>
      </div>
    </header>
  );
}

function StatsBar() {
  return (
    <div className={styles.statsBar}>
      <div className="container">
        <div className={styles.statsGrid}>
          <div className={styles.statsBarItem}><span>🎯</span> Spec-Driven Development</div>
          <div className={styles.statsBarItem}><span>🔬</span> Cohere + Qdrant RAG</div>
          <div className={styles.statsBarItem}><span>🚀</span> Gazebo &amp; Isaac Sim</div>
          <div className={styles.statsBarItem}><span>📡</span> ROS 2 Humble</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Welcome to ${siteConfig.title}`} description={siteConfig.tagline}>
      <HomepageHeader />
      <StatsBar />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
