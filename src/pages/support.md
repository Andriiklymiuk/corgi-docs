---
title: Support — corgi phone app
description: How to pair the corgi phone app with your laptop, and what to do when it will not connect.
---

# corgi for iPhone — support

The phone app is a remote for the corgi daemon on your own computer: every
Claude Code session, the tickets, the workspaces — and Allow / Deny, Send,
Interrupt, Work on it from wherever you are.

## Setting up

1. On the laptop: `brew install andriiklymiuk/homebrew-tools/corgi`
2. In your project: `claude`, then `/corgi:setup` — Claude configures the daemon,
   the tracker and the hooks for you.
3. `corgi agent up` prints a QR code. Scan it from the app (or paste the link).

Several laptops can be paired; switch between them from the header.

## It says the laptop is not answering

- Is the laptop awake and online? corgi keeps it awake while sessions work
  (`corgi agent status`).
- Run `corgi agent up --fresh` on the laptop for a new link, then pair again.
- On a LAN address (`http://192.168…`), phone and laptop must share the network.
  Use `corgi agent up` with a tunnel or Tailscale to reach it from anywhere.
- The app shows what it cached last; a tap made offline waits in the queue
  (Settings → Waiting to send) and goes when the laptop is back.

## Not encrypted?

Settings shows *end-to-end encrypted* for a laptop on corgi 2.20.12 or newer
paired from app 1.0.7 or newer. Older pairings say *not encrypted*: run
`corgi upd` on the laptop and pair again.

## Notifications don't arrive

Settings → *Approve from the lock screen* needs a build on a real phone, and
the laptop must be reachable to register the token. `corgi agent doctor` on
the laptop lists what is missing.

## Removing a laptop, or everything

Settings → the laptop's menu → **Forget**. Forgetting the last laptop wipes
every cache and key on the phone. On the laptop, `corgi mcp devices revoke
<name>` invalidates a phone's token.

## Contact

gradli.inc@gmail.com · [GitHub issues](https://github.com/andriiklymiuk/corgi/issues)
