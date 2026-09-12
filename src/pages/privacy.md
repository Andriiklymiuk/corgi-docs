---
title: Privacy policy — corgi phone app
description: What the corgi phone app does with your data — nothing leaves your own laptop.
---

# Privacy policy

*corgi for iPhone (bundle `com.andriiklymiuk.corgi`), last updated 12 September 2026.*

## The short version

The corgi phone app is a remote for the corgi daemon running on **your own
computer**. It talks to that computer and to nobody else. There is no corgi
account, no corgi server, no analytics, no advertising, no crash reporting,
no third-party SDK that phones home. We do not collect any data.

## What the app stores on the phone

- **Your paired laptops**: the address you scanned, the device token that
  laptop minted for this phone, and the end-to-end encryption key derived at
  pairing. Kept in the iOS Keychain, this device only, never backed up.
- **A copy of the board**: sessions, tickets, workspaces, as your laptop last
  reported them, so the app works without a signal. Encrypted at rest with a
  key from the Keychain. *Settings → Forget what is cached* wipes it.
- **Your settings**: tab order, Face ID, hidden workspaces. On the phone only.

Forgetting the last laptop wipes all of it.

## What travels, and where

Every request goes from the phone to your laptop's corgi endpoint — over your
LAN, a Tailscale network, or a tunnel you started (cloudflared, ngrok). With
corgi 2.20.12 and app 1.0.7 or later, every request and response body is
end-to-end encrypted between the phone and the laptop (X25519, HKDF, AES-256-GCM),
so a tunnel provider or the Wi-Fi sees only sealed envelopes.

Push notifications: if you turn them on, the app registers an Expo push token
with **your laptop**, and your laptop sends notifications through Apple's and
Expo's push services. The notification says which session needs you; the
content of your sessions never travels that way.

Siri and Shortcuts, widgets and the Live Activity read the same local copy and
the same laptops; nothing new is sent anywhere.

## What we never do

- No account, no sign-in, no email collection.
- No analytics or tracking of any kind, no advertising identifiers.
- No servers of ours: the app cannot send us anything, and does not.
- No selling or sharing of data — there is none to sell.

## Your laptop

What corgi on the laptop reads (Claude Code transcripts for token counts, the
tracker you configured, your git checkouts) stays on that laptop. See the
[corgi documentation](/docs/intro) for the daemon's own behaviour.

## Contact

Questions: gradli.inc@gmail.com — or open an issue on
[GitHub](https://github.com/andriiklymiuk/corgi/issues).
