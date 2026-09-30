#!/bin/sh
# Печатает для GITHUB_OUTPUT: extensions=["id",...] (изменённые и существующие
# каталоги extensions/<id>) и revoked=true|false (менялся ли revoked.json).
# Использование: scripts/changed-extensions.sh <диапазон git diff>
set -eu

range="$1"
changed=$(git diff --name-only "$range")

ids=$(printf '%s\n' "$changed" \
  | sed -n 's#^extensions/\([^/][^/]*\)/.*#\1#p' \
  | sort -u \
  | while read -r id; do
      [ -d "extensions/$id" ] && printf '%s\n' "$id"
    done)

json=$(printf '%s\n' "$ids" | jq -R -s -c 'split("\n") | map(select(length > 0))')
revoked=false
printf '%s\n' "$changed" | grep -qx 'revoked.json' && revoked=true

echo "extensions=$json"
echo "revoked=$revoked"
