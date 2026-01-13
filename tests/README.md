# Prism IPTV - Comprehensive E2E Test Suite

## Overview

This comprehensive Playwright test suite validates all system functionality after massive changes. The suite is designed to detect regressions, ensure quality, and provide confidence in deployments.

## Test Categories

### 1. Smoke Tests (`smoke.spec.ts`)
**Purpose**: Validate critical paths and minimum viable functionality

**Coverage**:
- Main page load and 3D scene initialization
- Navigation to key sections (Live TV, TV Guide, Settings)
- Basic channel selection
- Remote server connectivity

**Run Command**: `npm run test:smoke`

**Expected Duration**: ~2-3 minutes

### 2. Integration Tests (`tests/integration/`)

#### API Integration (`api.spec.ts`)
**Purpose**: Validate all API endpoints, WebSocket connections, and external service integrations

**Coverage**:
- Backend API endpoints (`/api/status`, `/api/epg`, `/api/proxy`)
- WebSocket connection and reconnection
- External APIs (IPTV-Org, Radio-Browser, iTunes)
- M3U playlist parsing and transformation
- EPG data processing
- Content filtering
- Error handling and recovery
- Performance and caching
- Concurrent request handling

**Run Command**: `npm run test:integration`

#### AI/Lumen Integration (`ai-lumen.spec.ts`)
**Purpose**: Test Ollama agent communication, TTS, Whisper STT, and lip sync

**Coverage**:
- Lumen WebSocket connection
- VRM mascot loading and rendering
- Brain state machine transitions (IDLE, WATCHING, THINKING, SPEAKING)
- Behavioral animations (zoning, blinking, saccades)
- Media control commands (PLAY, PAUSE, VOLUME, CHANNEL)
- Toast notifications
- Background and accessory updates
- Audio response system and lip sync
- Error handling and recovery

#### WebGL/3D Integration (`webgl-3d.spec.ts`)
**Purpose**: Validate CinemaVoid scene, VRM rendering, and Three.js integration

**Coverage**:
- WebGL context and capabilities
- CinemaVoid scene initialization
- Video texture mapping
- Dynamic lighting system
- VRM model loading and rendering
- Expression and animation system
- Particle effects (SpatialHalo, ThinkingSparks)
- Gestural UI elements
- Chameleon Engine color extraction
- Frame rate and performance
- Error handling and context loss recovery

### 3. Visual Regression Tests (`visual-regression.spec.ts`)
**Purpose**: Pixel-perfect UI comparisons and responsive design verification

**Coverage**:
- Desktop layouts across multiple viewports (1920x1080, 1366x768, 1280x720)
- Mobile and tablet viewports
- UI state variations (active, hover, loading, empty states)
- Theme and color schemes
- 3D scene rendering consistency
- Modal and overlay components
- Animation consistency
- Icon and asset rendering
- Error state UI

**Run Command**: `npm run test:visual`

**Baseline Management**:
- Update snapshots: `npm run test:update-snapshots`
- Snapshots stored in `tests/__screenshots__/`

### 4. Performance Tests (`performance-enhanced.spec.ts`)
**Purpose**: Comprehensive performance benchmarking and optimization validation

**Coverage**:
- Page load performance (< 3s target)
- Core Web Vitals (LCP, CLS, FID)
- Time to Interactive (TTI < 4s)
- Resource loading optimization
- API response times (< 2s SLA)
- WebSocket latency (< 500ms)
- Memory usage and leak detection
- 3D rendering frame rate (> 50 FPS target)
- Long task detection
- GPU acceleration verification
- Bundle size analysis
- Stress testing

**Run Command**: `npm run test:performance`

**Performance Budgets**:
- Initial page load: < 3000ms
- DOM Interactive: < 2500ms
- First Paint: < 1500ms
- First Contentful Paint: < 2000ms
- API responses: < 2000ms
- Memory growth: < 50MB over 10s
- Frame rate: > 50 FPS

### 5. Accessibility Tests (`accessibility.spec.ts`)
**Purpose**: WCAG 2.1 AA compliance and assistive technology compatibility

**Coverage**:
- WCAG 2.1 AA violations detection
- Keyboard navigation (Tab, Enter, Space, Arrow keys)
- Screen reader support (ARIA labels, semantic HTML)
- Color contrast ratios
- Focus indicators visibility
- Form input labels
- Heading structure
- Live regions for dynamic content
- Media accessibility
- High contrast mode support
- Reduced motion preference
- Text resize to 200%

**Run Command**: `npm run test:accessibility`

**Standards**:
- WCAG 2.1 Level AA compliance
- Keyboard-only navigation support
- Screen reader compatibility
- Minimum contrast ratio 4.5:1

### 6. Mobile Tests (`mobile.spec.ts`)
**Purpose**: Mobile responsiveness, touch interactions, and mobile-specific features

**Coverage**:
- Mobile layout and responsiveness
- Touch interactions (tap, swipe, long press)
- Tap target sizes (minimum 44x44px)
- Mobile player controls
- Remote control interface (/remote)
- Haptic feedback
- Mobile performance optimization
- Network conditions (3G, offline mode)
- Mobile accessibility
- Orientation handling (portrait/landscape)

**Run Command**: `npm run test:mobile`

**Target Devices**:
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 13)

### 7. User Journey Tests (`journeys.spec.ts`)
**Purpose**: Complete user workflows and edge case scenarios

**Coverage**:
- Auto-play and initial muted state
- Religious content filtering
- Category navigation
- Favorites management
- TV Guide interaction
- Settings and remote status

**Run Command**: `npm run test`

## Test Infrastructure

### Custom Fixtures (`tests/helpers/fixtures.ts`)

**AppPage Object**:
- Navigation helpers (`gotoWithMocks`, `navigateToLiveTV`, etc.)
- Player controls (`playPause`, `mute`, `setVolume`)
- Channel operations (`selectChannel`, `toggleFavorite`)
- Lumen interactions (`waitForLumenReady`, `sendLumenMessage`)
- WebGL checks (`isCanvasRendering`, `getCanvasDimensions`)
- Utility methods (`waitForNoLoadingSpinners`, `captureScreenshot`)

**Auto-Fixtures**:
- `mockData`: Automatically mocks external API calls
- `consoleLogs`: Captures browser console output
- `networkErrors`: Captures network failures

### Test Utilities (`tests/helpers/test-utils.ts`)

**Mock Data**:
- M3U playlists
- HLS streams
- EPG data
- Radio stations
- Podcast feeds

**Helper Functions**:
- `setupMocks`: Configure route mocking
- `waitForAppReady`: Wait for full app initialization
- `waitForVRMLoaded`: Wait for VRM mascot load
- `getWebGLInfo`: Get WebGL context information
- `getPerformanceMetrics`: Collect performance data
- `getMemoryUsage`: Monitor memory usage

## Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm test

# Run specific test category
npm run test:smoke
npm run test:integration
npm run test:visual
npm run test:performance
npm run test:accessibility
npm run test:mobile
```

### Browser-Specific Tests

```bash
# Run on specific browser
npm run test:chrome
npm run test:firefox
npm run test:webkit
npm run test:edge

# Run on all browsers
npm run test:all
```

### Development & Debugging

```bash
# Run tests in headed mode (visible browser)
npm run test:headed

# Debug tests with Playwright Inspector
npm run test:debug

# Interactive UI mode
npm run test:ui

# View test report
npm run test:report
```

### CI/CD Integration

```bash
# Run CI test suite (optimized for CI)
npm run test:ci

# Generate coverage report
npm run test:coverage
```

## Configuration

### Main Config (`playwright.config.ts`)

**Projects**:
- `smoke-chromium`: Critical path validation
- `chromium`, `firefox`, `webkit`, `edge`: Cross-browser testing
- `mobile-chrome`, `mobile-safari`: Mobile testing
- `visual-regression`: Visual snapshot testing
- `performance`: Performance benchmarking
- `accessibility`: A11y compliance

**Settings**:
- Base URL: `http://localhost:5173`
- Parallel execution: 4 workers (local), 1 worker (CI)
- Retries: 2 (CI), 1 (local)
- Timeout: 60s per test
- Trace: Retained on failure
- Screenshots: Only on failure
- Video: Retained on failure

### Environment Variables

```bash
# CI mode
CI=true

# Custom base URL
BASE_URL=http://localhost:3000

# API endpoints
API_BASE_URL=http://localhost:3001
```

## Test Data Management

### Mocking Strategy

1. **External APIs**: All external API calls are mocked in tests
2. **Stream URLs**: HLS streams are mocked with minimal valid manifests
3. **EPG Data**: Static mock data for TV Guide
4. **WebSocket**: Mock messages for Lumen interactions

### Data Files

- Mock data: `tests/helpers/test-utils.ts`
- Visual baselines: `tests/__screenshots__/`
- Test fixtures: `tests/helpers/fixtures.ts`

## CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/playwright.yml`)

**Jobs**:
1. **test**: Full test suite across OS matrix (Ubuntu, Windows, macOS) with sharding
2. **smoke-tests**: Fast critical path validation
3. **visual-regression**: Screenshot comparison
4. **accessibility**: WCAG compliance check
5. **performance**: Performance benchmarking
6. **merge-reports**: Consolidate results
7. **notify**: Alert on failures

**Triggers**:
- Push to main/develop branches
- Pull requests
- Daily schedule (2 AM UTC)
- Manual dispatch

**Artifacts**:
- Test results (30-day retention)
- Screenshots (7-day retention)
- Performance metrics (30-day retention)
- HTML reports (deployed to GitHub Pages)

## Coverage Requirements

### Minimum Coverage Targets

- **Line Coverage**: 80%
- **Critical Path Coverage**: 90%
- **API Endpoints**: 100%
- **UI Components**: 85%

### Coverage Reporting

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open test-results/html-report/index.html
```

## Troubleshooting

### Common Issues

#### 1. Tests timing out
**Solution**: Increase timeout in `playwright.config.ts` or specific test

```typescript
test('long running test', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  // ... test code
});
```

#### 2. VRM not loading in tests
**Solution**: Increase VRM loading timeout

```typescript
await waitForVRMLoaded(page, 60000); // 60 seconds
```

#### 3. Flaky visual regression tests
**Solution**: Disable animations or increase threshold

```typescript
await expect(page).toHaveScreenshot('test.png', {
  animations: 'disabled',
  maxDiffPixels: 100,
});
```

#### 4. WebSocket connection failures
**Solution**: Ensure backend server is running

```bash
cd server && npm run dev
```

#### 5. Permission errors (microphone)
**Solution**: Grant permissions in test

```typescript
await context.grantPermissions(['microphone']);
```

### Debug Commands

```bash
# Show browser console logs
DEBUG=pw:api npm test

# Enable Playwright debug logs
DEBUG=pw:* npm test

# Run single test file
npx playwright test tests/smoke.spec.ts

# Run tests matching pattern
npx playwright test --grep "channel selection"
```

## Best Practices

### Writing Tests

1. **Use Page Object Model**: Utilize `AppPage` fixture for common operations
2. **Mock External Dependencies**: Always mock external APIs
3. **Wait for Stability**: Use `waitForAppReady` before assertions
4. **Clean Test Data**: Reset state between tests
5. **Meaningful Assertions**: Check behavior, not implementation details
6. **Error Messages**: Provide descriptive messages in assertions

### Performance

1. **Parallel Execution**: Tests run in parallel by default
2. **Test Independence**: Each test should be independently executable
3. **Resource Cleanup**: Properly close connections and clean up resources
4. **Selective Testing**: Run only necessary tests during development

### Maintenance

1. **Update Snapshots**: Review visual changes before updating baselines
2. **Monitor Flakiness**: Address flaky tests immediately
3. **Review Coverage**: Regularly check coverage reports
4. **Update Dependencies**: Keep Playwright and dependencies current

## Metrics & Reporting

### Test Metrics

- **Total Tests**: 200+
- **Test Execution Time**: ~30 minutes (full suite)
- **Smoke Test Time**: ~3 minutes
- **Flakiness Rate Target**: < 1%

### Reporting Formats

1. **HTML Report**: Interactive web-based report
2. **JSON Report**: Machine-readable results
3. **JUnit XML**: CI/CD integration
4. **GitHub Annotations**: Inline PR comments

## Support & Resources

### Documentation

- [Playwright Docs](https://playwright.dev)
- [Axe Accessibility](https://www.deque.com/axe/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Internal Resources

- Test utilities: `tests/helpers/`
- Configuration: `playwright.config.ts`
- CI/CD pipeline: `.github/workflows/playwright.yml`

## Changelog

### Version 1.0.0 (Current)
- ✅ Comprehensive smoke tests
- ✅ API integration tests
- ✅ AI/Lumen integration tests
- ✅ WebGL/3D rendering tests
- ✅ Visual regression tests
- ✅ Performance benchmarking
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Mobile test suite
- ✅ CI/CD pipeline
- ✅ Test utilities and fixtures
- ✅ Cross-browser support
- ✅ Parallel execution with sharding

---

**Last Updated**: 2026-01-08
**Test Suite Version**: 1.0.0
**Playwright Version**: 1.57.0
