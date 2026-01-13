# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-01-12

### Added
- **Live TV Filters**:
  - Quick-access **Category Chips** (News, Sports, Anime, etc.) in Channel List.
  - Integration with Search and Mode filters for compound filtering.
- **Audio Intelligence**:
  - **Unified Audio Search**: Integrated Radio Browser and iTunes Search.
  - **Category Filtering** for Radio and Podcasts.
  - **USA Content Enforcement**: Default preference for US-based content.

### Fixed
- **TV Guide Stability**: Resolved `toLowerCase` crash caused by non-string data in EPG.
- **TV Guide Performance**: Implemented **Grid Virtualization** (`react-virtuoso`) for lag-free scrolling of 1000+ channels.

### Changed
- **Dashboard Architecture**: Refactored `DesktopPlayer` for modular dashboard integration.
- **Frontend Build**: Optimized chunking and asset loading.

## [2.1.0-hardened] - 2026-01-08

### Added

- **Episodic Memory**: Persistent vector-based memory for user preferences and history.
- **Spoiler Guard**: AI-driven content shielding for EPG and subtitles.
- **Destructive Safety**: Confirmation flow for high-impact actions (delete, reset).
- **Sports Manager**: Real-time scores and notifications (OpenLigaDB).
- **Roommate Protocol**: Ultra-low latency "Hush Mode" via direct transport control.
- **Technical Documentation**: Comprehensive Specs, API Reference, and User Manual.

### Changed

- **Architectural Hardening**: Modularized `main_enhanced.py` with multi-step pipelines.
- **Performance**: Wrapped all blocking AI calls (TTS/STT) in `run_in_executor`.
- **Infrastructure**: Strict GPU/CUDA hardware check enforced at startup.
- **WebSocket Logic**: Extracted message dispatching into dedicated handler for lower complexity.

### Fixed

- **Memory Safety**: Resolved `asyncio.create_task` garbage collection issues.
- **Concurrency**: Fixed set-size-change errors in SportsManager broadcasting.
- **Logic Errors**: Removed duplicate expression keys and dangling returns in mascot logic.

## [1.2.1] - 2026-01-08

### Added

- **Channel Grouping**:
  - Smart grouping of channels by **Genre/Category** (e.g., Animation, Sports, Movies).
  - **Sticky Headers** for group titles while scrolling.
  - Alphabetical sorting for both groups and channels.
- **Anime Mode**:
  - Dedicated **Anime Tab** in the sidebar.
  - Context-aware filtering for Anime, Animation, and Cartoon content.
- **Radio Mode**:
  - Integrated dedicated **Music/Radio Playlist** source.
  - Improved genre categorization (Classic Rock, Pop, Jazz, etc.).

### Fixed

- **TV Guide (EPG)**:
  - Resolved **CORS/CSP issues** by configuring a proper Vite proxy for API requests.
  - Fixed hardcoded URLs preventing EPG data loading.
- **Channel List**:
  - Fixed **zero-height** rendering issue in `ChannelList` CSS.
  - Resolved channel list visibility problems.
- **Connectivity**:
  - Updated WebSocket connection to use relative paths, fixing remote control issues.

## [1.2.0] - 2026-01-07

### Added

- **Audio Normalization**: Integrated `DynamicsCompressorNode` via a central `AudioService` to balance volume levels across different streams.
- **TV Guide (EPG)**: 
  - Integrated **Live XMLTV** ingestion (Pluto TV US) via `EPGService` to replace mock data.
  - Implemented async parsing with `fast-xml-parser` and in-memory TTL caching.
  - New `TVGuide` component with a sleek, themed grid layout.
- **Brand Identity Overhaul**:
  - Full transition to **"Glass & Neon"** premium aesthetics across all UI components.
  - Centralized branding tokens (`branding.ts`) for colors, typography, and effects.
- **Mascot Design**:
  - Introduced **"Lumen"**, the geometric prism mascot.
  - Developed and integrated an **Emotional Spectrum** (5 expressions: Happy, Thinking, Excited, Alert, Relaxed).
  - Created an interactive **Brand Guide** page to document the visual system.
- **Remote Control Service**: Full WebSocket-based remote control functionality with **SEEK** support.
- **4K Support**: Added logic to force the highest available resolution (Target 4K) upon stream start.

### Optimized

- **Media Playback**: 
  - Configured HLS.js for **Low Latency** (target 3-segment buffer).
  - Implemented **Self-Healing** mechanisms (auto-retry on network errors, codec-swapping on media errors).
- **Docker Infrastructure**: 
  - Migrated to a multi-service `docker-compose` architecture (Frontend + Backend).
  - Optimized Nginx with Gzip compression and security headers.
- **Application Startup**: 
  - Implemented Vite manual chunk splitting for `vendor`, `player`, and `ui` bundles.
  - Added React lazy loading for secondary routes to reduce initial bundle size.

---

## [1.1.0] - 2026-01-06

### Changed

- **Repository Restructuring**: Standardized project layout into `/docs`, `/diagrams`, `/config`, and `/server`.
- **Documentation Overhaul**: Migrated all technical diagrams to Mermaid.js format in `/diagrams`.

---

## [1.0.0] - Initial Release

- Core IPTV player functionality with HLS support.
- Channel selection and basic player controls.
- Brand styling and initial UI implementation.
