# Research Notes: Chapter 3 - The Digital Twin – Gazebo & Unity

## Overview
Research for implementing Chapter 3 covering Gazebo Harmonic setup, URDF/SDF for humanoid robots, physics simulation, sensor plugins, and Unity integration.

## Key Technologies

### Gazebo Harmonic
- Latest version of Gazebo simulation platform
- Uses Ignition Gazebo (now called Gazebo) with ROS 2 bridge
- Command: `gz sim` (new name for `gazebo`)
- Integration with ROS 2 Humble via ros_gz_sim package

### ROS 2 Bridge
- Package: `ros_gz_sim`
- Provides ROS 2 interface to Gazebo simulation
- Allows ROS 2 nodes to interact with Gazebo
- Command: `ros2 launch ros_gz_sim` to start simulation

### libgazebo_ros plugins
- Standard plugins for sensors (camera, LiDAR, IMU)
- Loaded via `<gazebo>` tags in URDF files
- Publish sensor data to ROS 2 topics
- Examples: libgazebo_ros_camera.so, libgazebo_ros_laser.so, libgazebo_ros_imu.so

### Simulation Pipeline
URDF → Gazebo → ROS 2 Bridge → RViz (visualization)

### Sensor Plugins Details
- LiDAR: libgazebo_ros_laser.so - publishes sensor_msgs/LaserScan
- Camera: libgazebo_ros_camera.so - publishes sensor_msgs/Image
- IMU: libgazebo_ros_imu.so - publishes sensor_msgs/Imu

### Unity Integration
- Unity Robotics Hub: https://github.com/Unity-Technologies/Unity-Robotics-Hub
- Unity ROS# package for ROS 2 communication
- Uses TCP/IP bridge between Unity and ROS 2
- Allows bidirectional communication

## Decision: Technology Stack
Rationale: Using Gazebo Harmonic with ROS 2 bridge provides the most robust simulation environment for humanoid robotics with extensive documentation and community support. Unity integration adds high-fidelity visualization capabilities.

## Alternatives Considered
- Webots: Alternative simulation platform but less ROS 2 integration
- PyBullet: Good for physics but lacks the sensor simulation capabilities of Gazebo
- Stage: 2D simulator but not suitable for 3D humanoid robots