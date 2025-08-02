# VR FPS Cafe PWA

A Progressive Web App for VR FPS Game Cafe management and booking.

## 🚀 Quick Deploy

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase account with `fps-vr` project

### One-Command Deployment
```bash
# Install dependencies
npm install

# Deploy everything
npm run deploy

# Or use the deployment script
./deploy.sh
```

### Manual Deployment Options
```bash
# Deploy only hosting
npm run deploy:hosting

# Deploy only Firestore rules
npm run deploy:firestore

# Deploy only Storage rules
npm run deploy:storage

# Build only (no deploy)
npm run build
```

### Automated Deployment
The project includes GitHub Actions for automated deployment on push to main branch. See [DEPLOYMENT.md](./DEPLOYMENT.md) for setup instructions.

## 📱 Features

- Progressive Web App (PWA) with offline support
- VR FPS game booking and management
- Real-time updates with Firebase
- Responsive design for all devices
- Service worker for caching

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Firebase emulators
npm run emulators
```

### Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Firebase Setup
The project is configured to use the `fps-vr` Firebase project with:
- Hosting for the web app
- Firestore for data storage
- Storage for file uploads
- Authentication for user management

### Environment Variables
Create a `.env` file for local development:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=fps-vr.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fps-vr
VITE_FIREBASE_STORAGE_BUCKET=fps-vr.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Firebase Configuration](./firebase.json) - Firebase project settings
- [Vite Configuration](./vite.config.js) - Build tool configuration

## 🌐 Live Demo

- **Production**: https://fps-vr.web.app
- **Firebase Console**: https://console.firebase.google.com/project/fps-vr/overview

## 📦 Project Structure

```
vr-fps-cafe-pwa/
├── src/                    # Source code
├── public/                 # Static assets
├── dist/                   # Build output (generated)
├── .github/workflows/      # GitHub Actions
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies and scripts
├── deploy.sh               # Deployment script
└── DEPLOYMENT.md           # Deployment documentation
```

## 🔒 Security

- Firestore and Storage rules are configured for security
- Environment variables for sensitive data
- Service worker with secure caching strategies

## 🚀 Performance

- Optimized build with Vite
- Code splitting and lazy loading
- Service worker for offline functionality
- CDN hosting via Firebase

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the VR gaming community** 