#!/usr/bin/env bash
# Generate a CycloneDX SBOM for a built Sentinel VA image and commit it under sbom/.
# Run AFTER `docker build` and BEFORE pushing, as part of the release SOP.
# Requires syft (https://github.com/anchore/syft). Install: 
#   curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /tmp/bin
#
#   ./scripts/generate-sbom.sh 0.7.7            # uses digitalkali/sentinel-va:0.7.7
#   ./scripts/generate-sbom.sh 0.7.7 my/img:tag # explicit image ref
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="${1:?usage: generate-sbom.sh <version> [image-ref]}"
IMAGE="${2:-digitalkali/sentinel-va:$VERSION}"
OUT="sbom/sentinel-va-${VERSION}.cdx.json"

SYFT="$(command -v syft || echo /tmp/bin/syft)"
if [ ! -x "$SYFT" ] && ! command -v syft >/dev/null 2>&1; then
  echo "Error: syft not found. Install with:" >&2
  echo "  curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /tmp/bin" >&2
  exit 1
fi

mkdir -p sbom
echo "Generating CycloneDX SBOM for $IMAGE -> $OUT"
"$SYFT" "$IMAGE" -o cyclonedx-json > "$OUT"

# Quick sanity summary.
python3 - "$OUT" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
comps = d.get("components", [])
libs = sum(1 for c in comps if c.get("type") == "library")
print(f"  {d.get('bomFormat')} {d.get('specVersion')}: {len(comps)} components ({libs} libraries)")
PY
echo "Done. Commit $OUT with the release."
