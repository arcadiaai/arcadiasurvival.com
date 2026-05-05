---
title: Manual
description: Full user-facing reference for ARCADIA features.
---

## Hardware overview

ARCADIA ships as a complete grab-and-go kit, packed in a waterproof hard-shell case with custom foam cutouts. Total kit weight: 35 lb.

The kit includes:

- The ARCADIA appliance — small, fanless, 128 GB unified memory, 1 TB NVMe SSD
- Waterproof hard-shell carrying case
- USB speaker/microphone puck (hands-free voice)
- USB-C expansion hub
- 256 GB USB flash drive
- **EcoFlow River 3** portable power station (free) — runs the unit for hours unplugged
- **100 W foldable solar panel** (free) — recharge the River 3 indefinitely from sun
- Power cord, quickstart card, printed manual, license card

Performance and runtime:

- 47–54 tokens/sec on the local language model
- 1 TB internal NVMe SSD; optional external storage for video
- 100–150 W typical draw; runs on wall power, generator, the included River 3, or any compatible inverter
- Creates its own LAN — no router required

## Connecting

ARCADIA creates a private WiFi network with no internet. Any device with a browser joins:

| | |
| --- | --- |
| Network | `ARCADIA` |
| Password | `survival` |

Multiple devices connect simultaneously. Each device gets its own session and chat history (stored locally in the browser, not on the appliance).

For an ethernet uplink to your home network — useful for downloading optional content packs and updates — plug a cable from your router into the unit. Home-network devices can reach ARCADIA at `https://arcadia.local`.

## The web interface

The sidebar exposes every capability:

### Ask AI

Type a question; ARCADIA responds with an LLM-generated answer plus citations to the on-device library. The agent selector above the input lets you focus on one of eight domains: Survival, Agriculture, Medical, Technical, Civics, Comms, Navigation, Security.

### Search

Full-text search across the entire knowledge base. Results are grouped by source.

### Browse

The library by category — including military manuals, medical references, plant identification, agricultural extensions, and more.

### Maps

OpenStreetMap-derived planet tiles plus a Photon geocoder. Search any address worldwide, offline. Pan, zoom, drop pins.

### Voice

Browser-based: tap the microphone, speak, hear ARCADIA respond out loud.

### Video Archive

Curated video instruction with on-device transcripts.

## Optional content packs

After installing the base unit, you can add:

- **Translate** — 24 language pairs, on-device translation
- **Khan Academy** — full offline course library
- **Plants For A Future** — herb and edible plant database
- **Aviation & Maritime** — approach plates, charts, manuals

Install via the Settings page when an internet uplink is connected. The packs are large (multi-GB); plan accordingly.

## Updating

Software updates land via a signed update channel. The appliance checks daily; you'll see "Software up to date" or an "Update available" prompt on the Settings page. Updates are signed offline and verified on-device — no internet handshake reveals the update server's secrets.

## Troubleshooting

If the unit doesn't appear on WiFi after three minutes:

1. Power-cycle: hold the power button for ten seconds, wait, restart.
2. Plug a monitor and keyboard into the back; the boot sequence should show.

If "Ask AI" returns slow answers, check the Settings page for model status. The CPU fallback is much slower than the GPU path.

For anything else, the [FAQ](/faq) and [Quickstart](/quickstart) cover most situations.
