# Quickstart Guide: NVIDIA Isaac Platform

## Prerequisites

- NVIDIA GPU with RTX 3080 or equivalent (10GB+ VRAM recommended)
- Ubuntu 22.04 LTS
- ROS 2 Humble Hawksbill installed
- Docker and NVIDIA Container Toolkit

## Installation Steps

### 1. Install Isaac Sim
```bash
# Download Omniverse Launcher from NVIDIA
# Install Isaac Sim through the launcher
# Verify installation
isaac-sim --version
```

### 2. Set up Isaac ROS Workspace
```bash
# Create workspace
mkdir -p ~/isaac_ros_ws/src
cd ~/isaac_ros_ws

# Clone Isaac ROS packages
git clone -b ros2 https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_visual_slam.git src/isaac_ros_visual_slam

# Build workspace
source /opt/ros/humble/setup.bash
colcon build --symlink-install
source install/setup.bash
```

### 3. Load USD Assets
```bash
# Download Fourier H1 or other humanoid USD assets
# Place in Isaac Sim assets directory
# Verify asset loading in Isaac Sim GUI
```

### 4. Run Visual SLAM Example
```bash
# Launch Isaac Sim with a scene
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam_isaac_sim.launch.py
```

## Basic Workflow

1. **Create Simulation Environment**
   - Open Isaac Sim
   - Load humanoid robot model (e.g., Fourier H1)
   - Configure scene lighting and physics

2. **Generate Synthetic Data**
   - Configure Replicator domain randomization
   - Set up sensor parameters
   - Generate annotated dataset

3. **Run Perception Pipeline**
   - Launch Isaac ROS visual SLAM
   - Feed synthetic data to perception stack
   - Verify SLAM performance

4. **Test Navigation**
   - Configure Nav2 for bipedal robot
   - Plan and execute navigation in simulation
   - Validate sim-to-real transfer

## Troubleshooting

- **VRAM Issues**: Reduce rendering resolution or disable some visual effects
- **CUDA Errors**: Verify NVIDIA drivers and CUDA installation
- **ROS Connection**: Check ROS_DOMAIN_ID and network configuration
- **Asset Loading**: Verify USD file format and path permissions