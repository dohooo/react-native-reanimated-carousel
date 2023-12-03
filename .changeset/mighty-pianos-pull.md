---
'react-native-reanimated-carousel': patch
---

Removed the reset logic when user change the defaultIndex prop. (We couldn't update the handlerOffset value when user change the defaultIndex. Because the carousel component already be a non-controlled component. So the subsequent changes of defaultIndex will be ignored.)
