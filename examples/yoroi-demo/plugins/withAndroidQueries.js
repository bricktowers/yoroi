const { withAndroidManifest } = require('@expo/config-plugins');

// Android 11+ hides other apps from `canOpenURL` unless the intent is declared here.
// iOS equivalent: LSApplicationQueriesSchemes in app.json (`yoroi` and `web+cardano`).
module.exports = function withAndroidQueries(config) {
  return withAndroidManifest(config, config => {
    const manifest = config.modResults.manifest;
    if (!manifest.queries) {
      manifest.queries = [];
    }
    manifest.queries.push({
      intent: [
        {
          action: { $: { 'android:name': 'android.intent.action.VIEW' } },
          data: { $: { 'android:scheme': 'yoroi', 'android:host': 'yoroi-wallet.com' } },
        },
      ],
    });

    return config;
  });
};
