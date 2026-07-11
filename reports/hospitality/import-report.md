# Hospitality map import report

- Canonical source: `src/data/imports/downtown_perks_hospitality_map_copy_deck.csv`
- Total CSV records: 142
- Existing map records enriched in place: 127
- New hospitality child records added: 15
- Hotel Van Zandt child offers: 9
- Fairmont Austin child offers: 6
- Import strategy: existing IDs are merged; only `new_enriched_hospitality_record` rows are appended.
- Offer validity: dated offers resolve to active, ending soon, or expired at runtime; undated offers require verification.

The two available external CSV copies were byte-identical. The unsuffixed PERKS MEDIA path supplied with the brief was not present, so the identical `(1).csv` copy is the canonical source.
