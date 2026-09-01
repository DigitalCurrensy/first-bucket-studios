# Security

Walk URLs are public certificates. There are no accounts and no server-side user data.

If you find a vulnerability (XSS on a walk, a path that executes a certificate as code, anything that leaves this device without consent), **do not** open a public issue.

Report it privately:

- GitHub **Security advisory** on [DigitalCurrensy/first-bucket-studios](https://github.com/DigitalCurrensy/first-bucket-studios/security/advisories/new)
- Or a private note to the repo owner, **DigitalCurrensy**

Include: the walk or path, the browser, and a minimal repro. We will answer.

Out of scope:

- “Save does not download inside an iframe.” That is a host limit. See [SUPPORT.md](SUPPORT.md).
- League names in the book. That is [NOTICE](NOTICE), not a CVE.
- A fork that retunes mulberry32. That is a broken pin, not a security hole.
