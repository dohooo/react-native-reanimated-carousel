// Typefaces used by the scene demos. Each weight is its own family, because
// Android ignores `fontWeight` for custom fonts. Scenes ask SceneScreen for the
// faces they use, so a scene page only downloads what it renders.
export const SCENE_FONT_FILES = {
  "Bricolage-Medium": require("@expo-google-fonts/bricolage-grotesque/500Medium/BricolageGrotesque_500Medium.ttf"),
  "Bricolage-SemiBold": require("@expo-google-fonts/bricolage-grotesque/600SemiBold/BricolageGrotesque_600SemiBold.ttf"),
  "Bricolage-Bold": require("@expo-google-fonts/bricolage-grotesque/700Bold/BricolageGrotesque_700Bold.ttf"),
  "Bricolage-ExtraBold": require("@expo-google-fonts/bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.ttf"),
  "Instrument-Regular": require("@expo-google-fonts/instrument-sans/400Regular/InstrumentSans_400Regular.ttf"),
  "Instrument-Medium": require("@expo-google-fonts/instrument-sans/500Medium/InstrumentSans_500Medium.ttf"),
  "Instrument-SemiBold": require("@expo-google-fonts/instrument-sans/600SemiBold/InstrumentSans_600SemiBold.ttf"),
  "Instrument-Bold": require("@expo-google-fonts/instrument-sans/700Bold/InstrumentSans_700Bold.ttf"),
  "JetBrainsMono-Regular": require("@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf"),
  "JetBrainsMono-Medium": require("@expo-google-fonts/jetbrains-mono/500Medium/JetBrainsMono_500Medium.ttf"),
  "JetBrainsMono-SemiBold": require("@expo-google-fonts/jetbrains-mono/600SemiBold/JetBrainsMono_600SemiBold.ttf"),
  "JetBrainsMono-Bold": require("@expo-google-fonts/jetbrains-mono/700Bold/JetBrainsMono_700Bold.ttf"),
  "Fraunces-SemiBold": require("@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf"),
  "Fraunces-Bold": require("@expo-google-fonts/fraunces/700Bold/Fraunces_700Bold.ttf"),
  "Garamond-Regular": require("@expo-google-fonts/eb-garamond/400Regular/EBGaramond_400Regular.ttf"),
  "Garamond-Italic": require("@expo-google-fonts/eb-garamond/400Regular_Italic/EBGaramond_400Regular_Italic.ttf"),
  "Garamond-Medium": require("@expo-google-fonts/eb-garamond/500Medium/EBGaramond_500Medium.ttf"),
  "Garamond-SemiBold": require("@expo-google-fonts/eb-garamond/600SemiBold/EBGaramond_600SemiBold.ttf"),
} as const;

export type SceneFont = keyof typeof SCENE_FONT_FILES;
