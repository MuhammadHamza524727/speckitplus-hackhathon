import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    icon: '🤖',
    title: 'Physical AI & Humanoid Robotics',
    description:
      'Foundations of embodied intelligence — how AI moves from virtual to physical, humanoid design principles, and sensor-driven cognition.',
    tag: 'Chapter 1',
    tagColor: 'green',
    link: '/docs/chapter1-intro',
    cta: 'Read Chapter 1',
  },
  {
    icon: '📡',
    title: 'ROS 2 — Robotic Nervous System',
    description:
      'Master ROS 2 nodes, topics, services, actions, rclpy, launch files, and URDF — the complete middleware for humanoid robot control.',
    tag: 'Chapter 2',
    tagColor: 'teal',
    link: '/docs/chapter2-ros2',
    cta: 'Read Chapter 2',
  },
  {
    icon: '🌐',
    title: 'Digital Twins & Gazebo Simulation',
    description:
      'Build realistic digital twins using Gazebo Harmonic, URDF/SDF humanoid models, sensor plugins, and Unity Robotics Hub integration.',
    tag: 'Chapter 3',
    tagColor: 'gold',
    link: '/docs/chapter3-digital-twin/01-gazebo-setup',
    cta: 'Explore Chapter 3',
  },
  {
    icon: '🚀',
    title: 'NVIDIA Isaac Sim Platform',
    description:
      'High-fidelity simulation with Isaac Sim, synthetic data generation, Isaac ROS vSLAM, and Nav2 sim-to-real transfer pipelines.',
    tag: 'Chapter 4',
    tagColor: 'green',
    link: '/docs/chapter4-isaac/01-isaac-sim-intro',
    cta: 'Explore Chapter 4',
  },
  {
    icon: '💬',
    title: 'AI Book Assistant (RAG)',
    description:
      'Select any text on any page and instantly query the AI assistant. Powered by Cohere embeddings + Qdrant vector search for book-grounded answers.',
    tag: 'AI Feature',
    tagColor: 'teal',
    link: '/docs/test-ragchatbot',
    cta: 'Try AI Assistant',
  },
  {
    icon: '🎯',
    title: 'Nav2 — Sim to Real Transfer',
    description:
      'Production-ready navigation stacks — deploy Nav2 from simulation to real hardware with sensor fusion, costmaps, and behavior trees.',
    tag: 'Chapter 4 · Advanced',
    tagColor: 'gold',
    link: '/docs/chapter4-isaac/04-nav2-sim-to-real',
    cta: 'Learn Nav2',
  },
];

const TAG_STYLES = {
  green: styles.tagGreen,
  teal:  styles.tagTeal,
  gold:  styles.tagGold,
};

function Feature({ icon, title, description, tag, tagColor, link, cta }) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <Link to={link} className={styles.featureCardLink}>
        <div className={styles.featureCard}>
          {/* top accent bar injected via CSS ::before */}
          <div className={styles.featureTop}>
            <span className={clsx(styles.featureTag, TAG_STYLES[tagColor])}>{tag}</span>
          </div>
          <div className={styles.featureIcon}>{icon}</div>
          <h3 className={styles.featureTitle}>{title}</h3>
          <p className={styles.featureDesc}>{description}</p>
          <div className={styles.featureFooter}>
            <span className={styles.featureCta}>{cta} →</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Curriculum Overview</div>
          <h2 className={styles.sectionTitle}>
            Everything You Need to Master Physical AI
          </h2>
          <p className={styles.sectionSubtitle}>
            Click any card to jump directly into that chapter — from ROS 2 fundamentals
            to production Nav2 deployments.
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
