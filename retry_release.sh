#!/bin/bash

TAG=$1

if [ -z "$TAG" ]; then
    echo "Usage: ./retry-release.sh v0.1.0"
    exit 1
fi

echo "🔄 Retrying release for $TAG"

echo "Deleting local tag..."
git tag -d "$TAG" 2>/dev/null || echo "Tag not found locally"

echo "Deleting remote tag..."
git push origin --delete "$TAG" 2>/dev/null || echo "Tag not found remotely"

echo "Recreating tag..."
git tag "$TAG"

echo "Pushing tag..."
git push origin "$TAG"

echo "✅ Done! GitHub Actions will rebuild."