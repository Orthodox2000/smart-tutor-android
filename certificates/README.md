# Certificates

This directory holds **sensitive** Google Play and Android signing credentials.

> **Never commit plaintext certificate or key files to git.**

## Contents

| File | Purpose |
|------|---------|
| `upload_cert.der` | Google Play App Signing - Upload certificate |
| `deployment_cert.der` | Google Play App Signing - Deployment certificate |
| `play-store-credentials.json` | Digital Asset Links / Play API credentials |

## Encryption Workflow

### Encrypt (before committing)

```powershell
.\encrypt-certificates.ps1
.\encrypt-certificates.ps1 -DeleteOriginals   # removes raw files
```

This produces AES-256-CBC `.enc` files alongside (or in place of) the originals.
The `.enc` files **are safe to commit**; the raw files are **not**.

### Decrypt (after cloning)

```powershell
.\decrypt-certificates.ps1
```

Enter the shared team password when prompted. Raw files will be restored.

## .gitignore Rules

The following patterns are ignored globally:

```
certificates/*.der
certificates/*.pem
certificates/*.p12
certificates/*.pfx
certificates/*.jks
certificates/*.keystore
```

`.enc` files are **not** ignored so the encrypted versions can be version-controlled.

## Password Management

- Use a strong, unique password (minimum 16 characters recommended).
- Share the password **out-of-band** (not in git, not in Slack/email).
- Consider a password manager or team vault (1Password, Bitwarden, etc.).
- Rotate the password if a team member leaves.
