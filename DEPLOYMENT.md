# Firebase Deployment Guide

This guide covers how to deploy the VR FPS Cafe PWA to Firebase Hosting.

## Prerequisites

1. **Firebase CLI**: Install globally if not already installed
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Account**: Make sure you're logged in
   ```bash
   firebase login
   ```

3. **Project Setup**: The project is already configured to use the `fps-vr` Firebase project.

## Manual Deployment

### Quick Deploy (All Services)
```bash
npm run deploy
```

### Deploy Specific Services

**Hosting Only:**
```bash
npm run deploy:hosting
```

**Firestore Rules:**
```bash
npm run deploy:firestore
```

**Storage Rules:**
```bash
npm run deploy:storage
```

## Automated Deployment (GitHub Actions)

The project includes a GitHub Actions workflow that automatically deploys to Firebase when you push to the `main` or `master` branch.

### Setup for Automated Deployment

1. **Generate Firebase Service Account Key:**
   ```bash
   firebase projects:list
   firebase projects:list --token
   ```

2. **Add GitHub Secret:**
   - Go to your GitHub repository settings
   - Navigate to Secrets and Variables > Actions
   - Add a new secret named `FIREBASE_SERVICE_ACCOUNT_FPS_VR`
   - Paste the service account JSON content

3. **Push to Main Branch:**
   The deployment will automatically trigger when you push to the main branch.

## Local Development

### Start Firebase Emulators
```bash
npm run emulators
```

### Export/Import Emulator Data
```bash
# Export current emulator data
npm run emulators:export

# Start emulators with imported data
npm run emulators:import
```

## Build Process

The deployment process:
1. Builds the Vite project (`npm run build`)
2. Outputs to `dist/` directory
3. Deploys to Firebase Hosting
4. Configures SPA routing (all routes serve `index.html`)

## Environment Variables

For production deployment, make sure to:
1. Set up environment variables in Firebase Console
2. Update Firebase configuration in your app
3. Configure any API keys or secrets

## Troubleshooting

### Common Issues

1. **Build Fails:**
   - Check for TypeScript/JavaScript errors
   - Ensure all dependencies are installed
   - Verify Vite configuration

2. **Deployment Fails:**
   - Check Firebase project permissions
   - Verify service account key
   - Ensure you're logged into Firebase CLI

3. **Routing Issues:**
   - Verify `firebase.json` rewrite rules
   - Check that `index.html` is in the correct location

### Useful Commands

```bash
# Check Firebase project status
firebase projects:list

# View deployment history
firebase hosting:releases

# Rollback to previous version
firebase hosting:rollback

# Clear cache and redeploy
firebase hosting:clear
```

## Performance Optimization

- The build process generates optimized assets
- Service worker caching is configured
- Static assets are served with appropriate cache headers
- SPA routing ensures fast navigation

## Security

- Firestore and Storage rules are deployed with the project
- Environment variables should be set in Firebase Console
- API keys should never be committed to version control 