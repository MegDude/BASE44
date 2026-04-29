# Downtown Perks Deployment Workflow

## Branch model

- `main` = production only
- `agent/*` = experimental preview branches
- `deploy-*` = temporary deployment references only

Do not manually redeploy a failed preview before the branch builds locally and the fix has been pushed.

## Required local workflow

From the repo root:

```bash
npm install
npm run build
git add .
git commit -m "clear message"
git push
```

If `npm run build` fails, stop. Fix the branch before pushing.

## Production deploy helper

For a production push from `main`, use:

```bash
./scripts/production-deploy.sh
```

What it does:

1. installs dependencies
2. runs lint
3. runs a production build
4. verifies you are on `main`
5. stages and commits local changes if needed
6. pushes `main`
7. runs `vercel --prod --confirm`

It does not auto-switch branches. If you are not already on `main`, it exits.

## Guardrails in this repo

1. GitHub Actions now validates pushes on:
   - `main`
   - `agent/**`
   - `deploy-*`
2. Local git pre-push hook runs `npm run preview:validate`
3. Vercel remains Vite-only:
   - framework: `vite`
   - output: `dist`

## Install the local pre-push hook

```bash
npm run hooks:install
```

This sets:

```bash
git config core.hooksPath .githooks
```

## Preview recovery pattern

If a preview branch fails in Vercel:

1. Check the missing import or missing file in build logs.
2. Fix the branch locally.
3. Run `npm run build`.
4. Push one clean commit.
5. Wait for the new Vercel preview deployment.
6. Only use Vercel "Redeploy" if a new deployment does not appear.

## Merge standard

Only merge to `main` when all of the following are true:

- local `npm run build` passes
- GitHub Actions passes
- Vercel preview is `Ready`
- the preview route loads without missing imports or dead routes
