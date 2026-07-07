# Downtown Perks / BASE44 Codex Notes

Work token-light by default.

- Start with the exact route, file, branch, port, or deployment named by the user.
- Prefer targeted `rg`, `git diff -- <file>`, and small browser checks over whole-repo or whole-dataset reads.
- Cap command output with narrow file lists, line ranges, and summarized Playwright results.
- Do not load all map inventory, all media, all prior deployments, or all related repos unless the task explicitly asks for a full audit.
- For map and panel regressions, verify one or two representative routes first, then patch the shared source pattern.
- Preserve unrelated dirty files. Stage and commit only files intentionally changed for the current task.
- For deployment requests, verify branch, clean/dirty state, build result, and the canonical URL separately before reporting success.
