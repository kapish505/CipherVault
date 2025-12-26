# CipherVault - Quick Start Guide

## 🚀 Running the Application

### Prerequisites
- Node.js 18+
- pnpm
- MetaMask browser extension
- Pinata account (for IPFS)

### 1. Environment Setup

**Backend** (`/backend/.env`):
```bash
PINATA_JWT=your_pinata_jwt_here
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**Frontend** (`/frontend/.env`):
```bash
VITE_API_URL=http://localhost:3001
```

### 2. Install Dependencies

```bash
# Root directory
pnpm install
```

### 3. Start Development Servers

```bash
# Terminal 1: Start frontend
pnpm dev

# Terminal 2: Start backend
pnpm dev:backend
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/health

### 5. Connect Wallet

1. Open http://localhost:3000
2. Click "Connect Wallet" in navbar
3. Approve MetaMask connection
4. Navigate to `/app` (Files dashboard)

---

## 📁 Project Structure

```
CipherVault/
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── services/      # API & crypto services
│   │   ├── hooks/         # Custom React hooks
│   │   └── styles/        # Global styles
│   └── .env
├── backend/               # Express + TypeScript
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Auth middleware
│   │   └── db/            # Database setup
│   └── .env
└── package.json           # Workspace config
```

---

## 🎯 Key Features

### File Management
- Upload files (drag-and-drop or click)
- Download files (decrypts automatically)
- Delete files (soft delete)
- Search files (with filters)

### File Sharing
- Share with wallet addresses
- View sent/received shares
- Revoke shares anytime

### Organization
- Create folders
- Advanced search filters
- Sort by name/date/size
- Starred files

### Batch Operations
- Multi-select files
- Batch delete
- Batch download

### Analytics
- Storage usage
- File type breakdown
- Recent uploads

---

## 🧪 Testing

### Manual Testing
1. Upload a file
2. Download the file (verify it matches original)
3. Share file with another wallet
4. Search and filter files
5. Create folders
6. Use batch operations

### API Testing
```bash
# Health check
curl http://localhost:3001/health

# IPFS status
curl http://localhost:3001/api/ipfs/status
```

---

## 🐛 Troubleshooting

### MetaMask Not Connecting
- Ensure MetaMask is installed
- Check browser console for errors
- Try refreshing the page

### Upload Failing
- Check Pinata JWT is valid
- Verify backend is running
- Check file size (< 100MB recommended)

### Database Errors
- Delete `/backend/data/ciphervault.db`
- Restart backend (will recreate tables)

### CORS Errors
- Verify `CORS_ORIGIN` in backend `.env`
- Check frontend is running on correct port

---

## 📚 Documentation

- **Walkthrough**: See `walkthrough.md`
- **Project Status**: See `PROJECT_STATUS.md`
- **API Docs**: Inline comments in `/backend/src/routes/`

---

## 🚀 Production Deployment

See `PROJECT_STATUS.md` for detailed deployment instructions.

**Quick Deploy**:
1. Build frontend: `cd frontend && pnpm build`
2. Build backend: `cd backend && pnpm build`
3. Deploy frontend to Vercel
4. Deploy backend to Railway
5. Update environment variables

---

**Need help?** Check the comprehensive walkthrough or project status documents.
