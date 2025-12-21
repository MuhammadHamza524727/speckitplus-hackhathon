# API Contracts: Chapter 3 - The Digital Twin – Gazebo & Unity

## ROS 2 Interface Contracts

### Sensor Data Topics

#### LiDAR Sensor
- **Topic**: `/scan` or `/robot/scan`
- **Type**: `sensor_msgs/LaserScan`
- **Description**: 2D laser scan data from simulated LiDAR sensor

#### Camera Sensor
- **Topic**: `/camera/image_raw` or `/robot/camera/image_raw`
- **Type**: `sensor_msgs/Image`
- **Description**: Raw image data from simulated camera sensor

#### IMU Sensor
- **Topic**: `/imu` or `/robot/imu`
- **Type**: `sensor_msgs/Imu`
- **Description**: Inertial measurement unit data from simulated IMU

### Robot State Topics

#### Joint States
- **Topic**: `/joint_states`
- **Type**: `sensor_msgs/JointState`
- **Description**: Current joint positions, velocities, and efforts

#### TF Transform
- **Topic**: `/tf` and `/tf_static`
- **Type**: `tf2_msgs/TFMessage`
- **Description**: Robot kinematic tree transforms

## Service Contracts

#### Spawn Entity Service
- **Service**: `/spawn_entity`
- **Type**: `gazebo_msgs/srv/SpawnEntity`
- **Description**: Service to spawn robot models into Gazebo simulation

#### Delete Entity Service
- **Service**: `/delete_entity`
- **Type**: `gazebo_msgs/srv/DeleteEntity`
- **Description**: Service to remove entities from Gazebo simulation