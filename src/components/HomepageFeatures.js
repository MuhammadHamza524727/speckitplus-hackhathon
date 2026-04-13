import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    icon: '🤖',
    title: 'Physical AI & Humanoid Robotics',
    description:
      'Learn about cutting-edge Physical AI and humanoid robotics — combining artificial intelligence with mechanical engineering to create intelligent, embodied systems.',
    tag: 'Core Concepts',
  },
  {
    icon: '📡',
    title: 'ROS 2 Framework',
    description:
      'Master the Robot Operating System 2 (ROS 2), the middleware framework that serves as the nervous system for all modern robotic applications.',
    tag: 'Middleware',
  },
  {
    icon: '🎓',
    title: 'Step-by-Step Learning',
    description:
      'Comprehensive, student-centered content with step-by-step explanations, practical examples, hands-on exercises, and real simulation environments.',
    tag: 'Education',
  },
  {
    icon: '🔬',
    title: 'Simulation Environments',
    description:
      'Hands-on experience with Gazebo Harmonic and NVIDIA Isaac Sim — industry-standard simulation platforms used in professional robotics development.',
    tag: 'Simulation',
  },
  {
    icon: '💬',
    title: 'AI Book Assistant',
    description:
      'Select any text on the page and ask the AI assistant for deeper explanations. Powered by Cohere + Qdrant RAG for accurate, book-grounded answers.',
    tag: 'AI-Powered',
  },
  {
    icon: '🚀',
    title: 'Production-Ready Skills',
    description:
      'From sensor fusion to Nav2 navigation stacks — develop production-ready skills that translate directly to real-world robotics engineering careers.',
    tag: 'Industry',
  },
];

function Feature({ icon, title, description, tag }) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <div className={styles.featureCard}>
        <div className={styles.featureTag}>{tag}</div>
        <div className={styles.featureIcon}>{icon}</div>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDesc}>{description}</p>
        <div className={styles.featureFooter}>
          <span className={styles.featureArrow}>Learn more →</span>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>What You Will Learn</div>
          <h2 className={styles.sectionTitle}>Everything You Need to Master Robotics</h2>
          <p className={styles.sectionSubtitle}>
            A structured curriculum from fundamentals to advanced deployment, with AI-powered assistance throughout.
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
