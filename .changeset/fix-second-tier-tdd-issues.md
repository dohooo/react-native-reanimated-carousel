---
"react-native-reanimated-carousel": patch
---

Fix four high-confidence issues with TDD-first coverage:

- Fix non-loop + `overscrollEnabled={false}` behavior so right overdrag is clamped instead of bouncing past bounds.
- Harden visible range calculation for invalid runtime sizes (for example, `viewSize` becoming `NaN`) to avoid blank rendering in non-loop scenarios.
- Improve Pagination accessibility defaults and add `paginationItemAccessibility` overrides for `Pagination.Basic` and `Pagination.Custom`.
- Guard `customAnimation` output by sanitizing style values and normalizing `zIndex` to finite integers to reduce native crash risk.

Also adds focused regression tests for gesture translation clamping, visibility range fallbacks, pagination accessibility labels, and animation style sanitization.
