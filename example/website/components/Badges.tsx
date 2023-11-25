export const Badges = () => {
  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginTop: 12, justifyContent: "center" }}>
      {
        [
          {
            label: "Hacktober Badge",
            url: "https://img.shields.io/badge/hacktoberfest-2022-blueviolet",
          },
          {
            label: "platforms",
            url: "https://img.shields.io/badge/platforms-Android%20%7C%20iOS%20%7C%20Web-brightgreen.svg?style=flat-square&colorB=191A17",
          },
          {
            label: "npm",
            url: "https://img.shields.io/npm/v/react-native-reanimated-carousel.svg?style=flat-square",
          },
          {
            label: "npm",
            url: "https://img.shields.io/npm/dm/react-native-reanimated-carousel.svg?style=flat-square&colorB=007ec6",
          },
          {
            label: "npm",
            url: "https://img.shields.io/npm/dw/react-native-reanimated-carousel.svg?style=flat-square&colorB=007ec6",
          },
          {
            label: "github issues",
            url: "https://img.shields.io/github/issues/dohooo/react-native-reanimated-carousel.svg?style=flat-square",
          },
          {
            label: "github closed issues",
            url: "https://img.shields.io/github/issues-closed/dohooo/react-native-reanimated-carousel.svg?style=flat-square&colorB=44cc11",
          },
          {
            label: "discord chat",
            url: "https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord",
          },
        ].map((badge, index) => {
          return (
            <img src={badge.url} alt={badge.label} key={index} style={{ marginRight: 5, marginBottom: 8 }} />
          );
        })
      }
    </div>
  );
};
