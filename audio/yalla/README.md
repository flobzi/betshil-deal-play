# 'Yalla' nudge clips (parked — disabled)

V2.7 owner: the nudge hook is in the code but **disabled**. No audio ships here; all candidates were rejected.

When the final clips are approved:
1. Name them `yalla_1`, `yalla_2`, … with both `.ogg` and `.m4a` (mono, about 0.5–1.5 s, soft and muffled, pre-levelled to about −33 LUFS for tier 1 and −30 LUFS for tier 2, peak ≤ −9 dBFS; they play as-is).
2. List them in `manifest.json` under `tier1` (at about 10 s left on my turn) and `tier2` (at about 5 s, more impatient), and set `"enabled": true`.
3. Add the source and licence to AUDIO_CREDITS.md. Use real recordings only, with no AI or TTS.

Behaviour once enabled: a random bot mutters, panned to its seat. It never plays during response windows, the Double window or the deal buffer, never while paused or muted, and never over another voice.
