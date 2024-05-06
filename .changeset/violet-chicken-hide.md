---
'react-native-reanimated-carousel': patch
---

improve "slow pan" behavior: if it seems that the user intent is to stay on the current page (because they didn't pan very far; maybe they started panning one direction then reversed direction, etc.), _don't_ actually change page upon gesture completion
