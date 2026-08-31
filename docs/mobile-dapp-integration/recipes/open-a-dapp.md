# Recipe · Open a dApp in the wallet browser

Hand a URL to Yoroi's built-in dApp browser.

```ts
import { linksYoroiModuleMaker } from '@yoroi/links';

const yoroiLinks = linksYoroiModuleMaker('yoroi');

const link = yoroiLinks.browser.launch.dappUrl({
  dappUrl: 'https://yourdapp.example',
  message: 'Open the marketplace',
});
```

**What the user sees.** The URL loaded in the wallet's browser, where the page can use the
wallet's in-app connector.

**Notes.**

- `http://` is rejected. Use HTTPS.
- This hands over navigation, not a signing request. Nothing comes back — use
  `transfer/request/*` when you need a transaction.
- `redirectTo` has no effect here; there is no result to return.
