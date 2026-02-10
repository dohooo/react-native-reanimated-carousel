// Android dev-client can evaluate route modules before Reanimated's logger
// config is initialized, which causes a hard crash ("level" of undefined).
// Seed a safe default early, then hand off to expo-router entry.
if (globalThis.__reanimatedLoggerConfig == null) {
  globalThis.__reanimatedLoggerConfig = {
    level: 1,
    strict: true,
    logFunction(data) {
      if (data?.level >= 2) {
        console.error(data?.message);
      } else {
        console.warn(data?.message);
      }
    },
  };
}

require("expo-router/entry");
