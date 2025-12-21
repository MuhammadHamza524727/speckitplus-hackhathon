// module.exports = {
//   docs: [
//     {
//       type: 'category',
//       label: 'Physical AI & Humanoid Robotics',
//       items: [
//         'chapter1-intro',
//         'chapter2-ros2',
//       ],
//     },
//     {
//       type: 'category',
//       label: 'Module 2: The Digital Twin',
//       collapsed: false,
//       items: [
//         {
//           type: 'category',
//           label: 'Gazebo & Unity',
//           items: [
//             'chapter3-digital-twin/01-gazebo-setup',
//             'chapter3-digital-twin/02-urdf-sdf-humanoid',
//             'chapter3-digital-twin/03-sensor-plugins',
//             'chapter3-digital-twin/04-unity-intro'
//           ]
//         }
//       ],
//     },
//   ],
// };

module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Chapter 1: Introduction',
      collapsed: false,
      items: [
        'chapter1-intro',
        'test-ragchatbot',
      ],
    },
    {
      type: 'category',
      label: 'Chapter 2: ROS 2',
      collapsed: false,
      items: [
        'chapter2-ros2',
      ],
    },
    {
      type: 'category',
      label: 'Chapter 3: Digital Twin (Gazebo & Unity)',
      collapsed: false,
      items: [
        'chapter3-digital-twin/gazebo-setup',
        'chapter3-digital-twin/urdf-sdf-humanoid',
        'chapter3-digital-twin/sensor-plugins',
        'chapter3-digital-twin/unity-intro',
      ],
    },
    {
      type: 'category',
      label: 'Chapter 4: AI-Robot Brain (Isaac Platform)',
      collapsed: false,
      items: [
        'chapter4-isaac/isaac-sim-intro',
        'chapter4-isaac/synthetic-data',
        'chapter4-isaac/isaac-ros-vslam',
        'chapter4-isaac/nav2-sim-to-real',
      ],
    },
    {
      type: 'category',
      label: 'Chapter 5: Future Topics (Placeholder)',
      collapsed: true,
      items: [
        'chapter4-isaac/future-topics',
      ],
    },
  ],
};
