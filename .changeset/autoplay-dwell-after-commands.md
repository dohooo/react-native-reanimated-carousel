---
"react-native-reanimated-carousel": patch
---

Restart the autoplay interval after `ref.scrollTo`, `ref.next` and `ref.prev` (for example a pagination tap), so the next autoplay step no longer comes early. A command that interrupts an autoplay transition no longer stops autoplay.
