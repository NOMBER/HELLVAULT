# OBSIGAMA integration notes

HELLVAULT keeps its existing `vault-shards` plugin ID and `data.json` save format. The game bundle in `src/hellvault.js` calls the integration when a story, linear, or arena run ends and flushes partial progress when the view closes or the plugin unloads. The unmodified upstream example in `src/obsigama/index.ts`, apart from its SDK import path, creates `SClient`, imports existing totals, reports runs and partial progress, and provides the settings UI. The vendored SDK handles discovery, consent, the opt-in switch, offline storage, and sync. Its state is separate in `obsigama-sync.json`.

## Verification

- Real Obsidian 1.15.1 with the old save: plugin loads without the hub, the game opens, folder exclusions work, the opt-in and both languages appear, and three disable/enable cycles retain progress. A linear victory was counted once; enabling the switch without the hub shows the missing-hub status.
- Automated tests: story, linear and arena completion invoke the callback once after updating progress; partial progress does not count a run; import is idempotent; consent, backfill, offline queue and retry are exercised against a mock hub; note names are absent from the submitted payload.
- A signed-in OBSIGAMA account and live service were not available. Consent, profile display and real server-side synchronization still need an end-to-end check with the real hub and account.

## Upstream limits and open questions

The exact SDK and integration example from `sdk-v0.1.0` were retained as requested. The example's `playtime_ms` uses wall-clock time since initialization or the previous report, including time in menus, and caps each report at four hours. Accurate active-run timing needs a coordinated change to the upstream example.

The provided manifest limits arena wave scores to 1,000 and kills per arena run to 20,000; higher scores are rejected by the SDK rather than sent to the leaderboard. Story times outside 60–86,400 seconds are also outside the leaderboard limits. These limits should be reviewed with the OBSIGAMA server before changing the shared manifest. Counter deltas also have manifest-defined caps. All 21 achievement IDs match the game.
