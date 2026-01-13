# Prism IPTV Documentation

Welcome to the technical documentation for Prism IPTV.

## 📂 Directory Structure

| Folder | Description |
|--------|-------------|
| `/diagrams` | Mermaid.js source files for architecture and flows |
| `/architecture` | C4 Model diagrams |
| `/processes` | Sequence diagrams for key user flows |
| `/database` | Data models and ERDs |

## 📐 Architecture

### System Context
![System Context](../diagrams/architecture/c4-context.mmd)

### Container Architecture
![Container](../diagrams/architecture/c4-container.mmd)

### Component Architecture
![Component](../diagrams/architecture/c4-component.mmd)

## 🔄 Core Processes

### Instant Zapping
One of the key features is the "zero-latency" feel when switching channels.
![Zapping](../diagrams/processes/channel-zapping.mmd)

### Remote Control Pairing
The interaction between the mobile PWA and the desktop player via the local node server.
![Remote Pairing](../diagrams/processes/remote-pairing.mmd)

## 💾 Data Models
The application relies on CLIENT-SIDE persistence using standard browser APIs.
![ERD](../diagrams/database/erd.mmd)
