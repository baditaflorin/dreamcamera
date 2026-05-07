# Security Policy

## Supported versions

The `main` branch and the latest tagged release are supported.

## Reporting a vulnerability

Please report vulnerabilities through GitHub private vulnerability reporting for:

`https://github.com/baditaflorin/dreamcamera/security/advisories/new`

Do not open a public issue for security-sensitive reports. Include a minimal reproduction, browser/device details, and whether camera or local model access is involved.

## Security expectations

- Camera frames remain local to the browser.
- No secrets belong in frontend code.
- `.env*`, private keys, and credentials are ignored and scanned by the local gitleaks hook.
- Third-party model packs must have clear redistribution and browser execution terms before they are committed.

