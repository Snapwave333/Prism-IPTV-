# Discrepancy Documentation & RCA

## 1. Issue Tracking (Closed-Loop)

| ID | Issue Description | Severity | RCA | Resolution | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| DR-001 | Async IO Blocking in main_enhanced.py | High | Synchronous STT calls on event loop. | Wrapped in `run_in_executor`. | Verified via latency audit. |
| DR-002 | Duplicate Expression Keys | Low | Merge conflict artifacts. | Deduplicated keys in `animation_controller.py`. | Verified via asset scan. |
| DR-003 | Unused Placeholder (mock_scores) | Med | Vestigial code from development. | Replaced with `OpenLigaDB` polling. | Verified via functionality test. |

## 2. Systemic Analysis
The primary systemic bottleneck identified during development was **Event Loop Saturation** due to heavy transformer inference. This was resolved by the mandatory **GPU Hard-Link** and non-blocking orchestration.

## 3. Action Tracking
- **[CLOSED]** Hardening v2.1 implementation.
- **[CLOSED]** Documentation synchronization.
- **[CLOSED]** Final E2E Audit re-execution.
