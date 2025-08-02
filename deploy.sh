#!/bin/bash

# VR FPS Cafe PWA Deployment Script

set -e

echo "🚀 VR FPS Cafe PWA Deployment Script"
echo "====================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase. Please run:"
    echo "   firebase login"
    exit 1
fi

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -b, --build-only    Only build, don't deploy"
    echo "  -H, --hosting-only  Deploy only hosting"
    echo "  -F, --firestore     Deploy only Firestore rules"
    echo "  -S, --storage       Deploy only Storage rules"
    echo "  -a, --all           Deploy everything (default)"
    echo "  -p, --preview       Preview deployment without actually deploying"
    echo ""
    echo "Examples:"
    echo "  $0                 # Deploy everything"
    echo "  $0 -H              # Deploy only hosting"
    echo "  $0 -b              # Build only"
    echo "  $0 -p              # Preview deployment"
}

# Parse command line arguments
BUILD_ONLY=false
HOSTING_ONLY=false
FIRESTORE_ONLY=false
STORAGE_ONLY=false
DEPLOY_ALL=true
PREVIEW=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            DEPLOY_ALL=false
            shift
            ;;
        -H|--hosting-only)
            HOSTING_ONLY=true
            DEPLOY_ALL=false
            shift
            ;;
        -F|--firestore)
            FIRESTORE_ONLY=true
            DEPLOY_ALL=false
            shift
            ;;
        -S|--storage)
            STORAGE_ONLY=true
            DEPLOY_ALL=false
            shift
            ;;
        -a|--all)
            DEPLOY_ALL=true
            shift
            ;;
        -p|--preview)
            PREVIEW=true
            shift
            ;;
        *)
            echo "❌ Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Build the project
echo "📦 Building project..."
npm run build

if [ "$BUILD_ONLY" = true ]; then
    echo "✅ Build completed successfully!"
    exit 0
fi

# Determine deployment target
if [ "$PREVIEW" = true ]; then
    echo "👀 Previewing deployment..."
    if [ "$HOSTING_ONLY" = true ]; then
        firebase deploy --only hosting --dry-run
    elif [ "$FIRESTORE_ONLY" = true ]; then
        firebase deploy --only firestore --dry-run
    elif [ "$STORAGE_ONLY" = true ]; then
        firebase deploy --only storage --dry-run
    else
        firebase deploy --dry-run
    fi
    echo "✅ Preview completed!"
    exit 0
fi

# Deploy based on options
echo "🚀 Deploying to Firebase..."
if [ "$HOSTING_ONLY" = true ]; then
    echo "📤 Deploying hosting only..."
    firebase deploy --only hosting
elif [ "$FIRESTORE_ONLY" = true ]; then
    echo "📤 Deploying Firestore rules only..."
    firebase deploy --only firestore
elif [ "$STORAGE_ONLY" = true ]; then
    echo "📤 Deploying Storage rules only..."
    firebase deploy --only storage
else
    echo "📤 Deploying everything..."
    firebase deploy
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your app is live at: https://fps-vr.web.app"
echo "📊 Firebase Console: https://console.firebase.google.com/project/fps-vr/overview" 