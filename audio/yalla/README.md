# 'Yalla' nudge clips (V2.9: enabled)

The owner picked these from his own supplied recording (clip A, 'yalla wala'). Rights are **unconfirmed**: the owner must confirm them before any store release (see docs/AUDIO_CREDITS.md and docs/OPEN_RULES.md).

| file | tier | phrase | level |
|---|---|---|---|
| yalla_1 | tier1 (~10 s left) | 'yalla wala' (A2) | −33 LUFS, peak −20 dBFS |
| yalla_2 | tier1 | the longer phrase (A3) | −33 LUFS, peak −20 dBFS |
| yalla_3 | tier2 (~5 s left) | A2 with a soft tsk first | −30 LUFS, peak −13 dBFS |
| yalla_4 | tier2 | A3 with a soft tsk first | −30 LUFS, peak −13 dBFS |

All clips are mono, .ogg + .m4a, and play as-is. The tsk is CC0 (Freesound #691913 by hollandm, already in the game as vo/tsk_01).

**Behaviour:**
- A random bot mutters, panned to its seat, on the Effects bus.
- It never plays during response windows, the Double window or the deal buffer.
- It never plays while paused, muted or at Volume / Effects 0, and never over another voice.
- It never repeats the same clip twice in a row.
- Food or drink that lifts my clock above ~10 s stops it at once and re-arms it.

To turn it off, set `"enabled": false` in manifest.json.
