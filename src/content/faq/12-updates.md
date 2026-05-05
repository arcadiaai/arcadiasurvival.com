---
question: How do updates work?
category: support
order: 410
---

Updates are signed at build time and verified on-device against a public key baked into your unit at provisioning. The appliance checks daily over a tiny authenticated update channel; the bytes are signed and verified before applying. Nothing is ever installed unless your unit signs off on it cryptographically.
