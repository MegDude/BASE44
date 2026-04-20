#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR" || exit 1

status=0

print_section() {
  printf '\n----------------------------------\n%s\n' "$1"
}

load_env_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$file"
    set +a
    echo "Loaded $(basename "$file")"
  fi
}

echo "🔍 Downtown Perks Health Check"

auto_branch="$(git branch --show-current 2>/dev/null || true)"

print_section "1. Git Status"
git status -sb || status=1

print_section "2. Current Branch"
echo "$auto_branch"
if [[ "$auto_branch" != "main" ]]; then
  echo "❌ Expected branch main"
  status=1
else
  echo "✅ On main"
fi

print_section "3. Remote"
git remote -v || status=1

print_section "4. Last Commit"
git log -1 --oneline || status=1

print_section "5. Loading env files"
load_env_file .env
load_env_file .env.local
load_env_file .env.production

print_section "6. Checking build"
if npm run lint && npm run typecheck && npm run build; then
  echo "✅ Lint, typecheck, and build passed"
else
  echo "❌ Validation failed"
  status=1
fi

print_section "7. Checking env vars"
required_vars=(
  VITE_BASE44_APP_ID
  VITE_BASE44_APP_BASE_URL
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  NEXT_PUBLIC_MAP_PROVIDER_KEY
  NEXT_PUBLIC_APP_URL
)

missing_count=0
for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "❌ Missing $var"
    missing_count=$((missing_count + 1))
  else
    echo "✅ $var set"
  fi
done

if [[ $missing_count -gt 0 ]]; then
  status=1
fi

print_section "8. Result"
if [[ $status -eq 0 ]]; then
  echo "GREEN: pipeline checks passed and required env vars are present"
else
  echo "YELLOW/RED: review the failures above before deploying"
fi

exit $status
