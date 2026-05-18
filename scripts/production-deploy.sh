#!/bin/bash

set -euo pipefail

echo "-----------------------------------"
echo "DOWNTOWN PERKS PRODUCTION DEPLOY"
echo "-----------------------------------"

DATE="$(date +%Y-%m-%d-%H%M)"
BRANCH="$(git branch --show-current)"
COMMIT_MESSAGE="${COMMIT_MESSAGE:-PRODUCTION BUILD: map-first system ($DATE)}"

if [ "$BRANCH" != "main" ]; then
  echo "Error: production deploys must run from main. Current branch: $BRANCH"
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "Error: Vercel CLI is not installed or not on PATH."
  exit 1
fi

echo "Installing dependencies..."
npm install

echo "Running lint..."
npm run lint

echo "Running build..."
npm run build

echo "Fetching latest main..."
git fetch origin main

LOCAL_SHA="$(git rev-parse HEAD)"
REMOTE_SHA="$(git rev-parse origin/main)"
BASE_SHA="$(git merge-base HEAD origin/main)"

if [ "$LOCAL_SHA" != "$REMOTE_SHA" ] && [ "$BASE_SHA" != "$REMOTE_SHA" ]; then
  echo "Error: local main has diverged from origin/main."
  echo "Pull/rebase manually before running a production deploy."
  exit 1
fi

if [ "$LOCAL_SHA" != "$REMOTE_SHA" ] && [ "$BASE_SHA" = "$REMOTE_SHA" ]; then
  echo "Local main is ahead of origin/main. Continuing."
fi

if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  echo "Staging local changes..."
  git add .

  if ! git diff --cached --quiet; then
    echo "Committing to main..."
    git commit -m "$COMMIT_MESSAGE"
  else
    echo "No tracked changes to commit."
  fi
else
  echo "Working tree clean. Nothing new to commit."
fi

echo "Pushing main..."
git push origin main

echo "Deploying to Vercel production..."
vercel --prod --confirm

echo "-----------------------------------"
echo "DEPLOY COMPLETE"
echo "-----------------------------------"
