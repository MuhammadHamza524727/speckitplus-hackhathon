# Data Model: Chapter 3 - The Digital Twin – Gazebo & Unity

## Entities

### Gazebo Simulation Environment
- **Name**: Gazebo Simulation Environment
- **Description**: Physics-based simulation platform for robot testing and development
- **Relationships**:
  - Hosts URDF/SDF Robot Models
  - Interfaces with ROS 2 Bridge
  - Uses Sensor Plugins for data generation

### URDF/SDF Robot Models
- **Name**: URDF/SDF Robot Model
- **Description**: Standardized robot description format defining geometry, kinematics, and physical properties
- **Fields**:
  - model_name: string (name of the robot model)
  - format: enum (URDF or SDF)
  - links: array of link definitions
  - joints: array of joint definitions
  - physical_properties: object (mass, inertia, etc.)
- **Relationships**:
  - Used by Gazebo Simulation Environment
  - Contains Sensor Plugins

### Sensor Plugins
- **Name**: Sensor Plugin
- **Description**: Simulation components that generate realistic sensor data for robot perception
- **Fields**:
  - plugin_type: enum (LiDAR, Camera, IMU)
  - topic_name: string (ROS topic where data is published)
  - sensor_parameters: object (range, resolution, etc.)
- **Relationships**:
  - Belongs to URDF/SDF Robot Model
  - Interfaces with ROS 2 Bridge

### Unity Integration
- **Name**: Unity Integration
- **Description**: High-fidelity visualization platform connecting to ROS 2
- **Fields**:
  - connection_type: string (TCP/IP bridge)
  - visualization_quality: enum (high-fidelity)
  - interaction_methods: array (human-robot interaction capabilities)
- **Relationships**:
  - Interfaces with ROS 2 Bridge
  - Alternative to Gazebo visualization

## State Transitions

### Simulation Lifecycle
1. **Configuration** → **Initialized**: Gazebo environment and robot model loaded
2. **Initialized** → **Running**: Simulation started with physics active
3. **Running** → **Paused**: Simulation paused for adjustments
4. **Running/Paused** → **Stopped**: Simulation terminated

## Validation Rules

### From Functional Requirements
- FR-001: Gazebo Harmonic must be compatible with ROS 2 Humble
- FR-002: URDF/SDF models must be properly formatted and importable into Gazebo
- FR-003: Physics parameters (gravity, collisions) must be configurable in Gazebo
- FR-004: Sensor plugins must generate realistic data matching real hardware specifications
- FR-005: Launch examples must run successfully without errors in standard ROS 2 environment
- FR-006: <gazebo> tags must be properly configured for plugins and simulation parameters
- FR-007: Unity integration must provide high-fidelity rendering capabilities
- FR-008: Content must be structured as MDX subfiles in designated directory
- FR-009: Practical exercises must be testable by students with expected outcomes