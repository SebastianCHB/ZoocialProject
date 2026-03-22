// config
export default ({ config }) => ({
  ...config,
  extra: {
    // runtime
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
});
