import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Physical AI & Humanoid Robotics',
    Svg: require('../../static/img/robot.svg').default,
    description: (
      <>
        Learn about the cutting-edge field of Physical AI and humanoid robotics,
        combining artificial intelligence with mechanical engineering to create
        intelligent, embodied systems.
      </>
    ),
  },
  {
    title: 'ROS 2 Framework',
    Svg: require('../../static/img/ros.svg').default,
    description: (
      <>
        Master the Robot Operating System 2 (ROS 2), the middleware framework
        that serves as the nervous system for robotic applications.
      </>
    ),
  },
  {
    title: 'Step-by-Step Learning',
    Svg: require('../../static/img/education.svg').default,
    description: (
      <>
        Comprehensive, student-centered content with step-by-step explanations,
        practical examples, and hands-on exercises.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {/* RoboTech */}
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
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