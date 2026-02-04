# आधारवाड Digital Newspaper Portal

## 🎯 Project Overview

A complete production-ready digital newspaper portal with:
- **Public Interface**: Browse today's newspaper & historical archive
- **Admin Panel**: Upload, manage, and delete newspapers
- **Google Drive Storage**: All files stored securely in Google Drive
- **Marathi Language**: Full Marathi UI with beautiful typography
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop

---

## 📁 Project Structure

```
aadharwad-newspaper/
├── backend/                 # Node.js + Express API
│   ├── server.js           # Main server file
│   ├── models.js           # MongoDB schemas
│   ├── driveService.js     # Google Drive integration
│   ├── authMiddleware.js   # JWT authentication
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
│
└── frontend/               # Next.js React app
    ├── pages/              # All pages
    │   ├── index.js        # Home (today's newspaper)
    │   ├── archive.js      # Archive with calendar
    │   ├── login.js        # Admin login
    │   └── admin/          # Admin pages
    │       ├── dashboard.js
    │       ├── upload.js
    │       └── history.js
    ├── components/         # Reusable components
    ├── styles/             # CSS and styling
    ├── utils/              # API utilities
    └── package.json        # Frontend dependencies
```

---

## 🚀 Quick Start Guide

### Prerequisites

Before starting, make sure you have:
- Node.js (v18 or higher)
- npm or yarn
- MongoDB database (MongoDB Atlas recommended)
- Google Cloud Project with Drive API enabled

---

## 📝 Step-by-Step Setup

### 1. MongoDB Setup (MongoDB Atlas - Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier is sufficient)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)
6. Save this for later - you'll need it in the `.env` file

### 2. Google Drive API Setup

This is the most important step for file storage.

#### Step 2.1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (name it "Aadharwad Newspaper")
3. Enable the **Google Drive API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"

#### Step 2.2: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Name: `aadharwad-uploader`
4. Role: Select "Editor" (or "Basic" → "Editor")
5. Click "Done"

#### Step 2.3: Create Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON"
5. Download the JSON file
6. **IMPORTANT**: Keep this file safe - you'll need values from it

The JSON file looks like:
```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "aadharwad-uploader@project.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

#### Step 2.4: Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder named "Aadharwad"
3. Right-click the folder → "Share"
4. Add the service account email (from the JSON file - `client_email`)
5. Give it "Editor" permission
6. Copy the **Folder ID** from the URL:
   - URL looks like: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the FOLDER_ID_HERE part

---

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Now edit the `.env` file:

```env
# MongoDB - paste your connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aadharwad

# JWT Secret - generate a random string (at least 32 characters)
JWT_SECRET=your-random-secret-key-here-change-this

# Server Port
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Google Drive - from the JSON file you downloaded
GOOGLE_DRIVE_CLIENT_EMAIL=aadharwad-uploader@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-from-drive

# Initial Admin Credentials (change after first login)
ADMIN_EMAIL=admin@aadharwad.com
ADMIN_PASSWORD=admin123
```

**Important Notes**:
- For `GOOGLE_DRIVE_PRIVATE_KEY`: Copy the entire private key from JSON including `-----BEGIN...` and `-----END...`
- Keep the `\n` characters as they are
- Make sure it's wrapped in quotes

Start the backend:
```bash
npm start
```

You should see:
```
✅ MongoDB connected
✅ Default admin created
🚀 Server running on port 5000
```

---

### 4. Frontend Setup

Open a **new terminal** window:

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=आधारवाड डिजिटल वर्तमानपत्र
```

**Add your logo**:
- Copy your logo file to `frontend/public/logo.jpeg`

Start the frontend:
```bash
npm run dev
```

The app should open at `http://localhost:3000`

---

## 🎨 Usage Guide

### For Public Users

1. **Home Page**: View today's newspaper
2. **Archive**: Browse past newspapers by date using calendar
3. **Mobile Friendly**: Works on all devices

### For Admins

1. **Login**: Go to `/login` or click "प्रशासक प्रवेश"
   - Email: `admin@aadharwad.com` (from your .env)
   - Password: `admin123` (from your .env)

2. **Dashboard**: View statistics and recent uploads

3. **Upload**: 
   - Select date
   - Choose file (PDF/JPG/PNG, max 50MB)
   - Click upload
   - File is automatically uploaded to Google Drive

4. **History**: View all uploads, preview, or delete newspapers

---

## 🌐 Deployment Guide

### Deploy Backend (Render.com - Free)

1. Push your code to GitHub
2. Go to [Render.com](https://render.com)
3. Create new "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables (from your `.env` file)
7. Deploy!

**Important**: Update `FRONTEND_URL` to your deployed frontend URL.

### Deploy Frontend (Vercel - Free)

1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL + `/api`
5. Deploy!

---

## 🔒 Security Best Practices

### After First Deployment

1. **Change Admin Password**:
   - Login to admin panel
   - Go to settings
   - Change password immediately

2. **Update Environment Variables**:
   - Generate new `JWT_SECRET` (use a random string generator)
   - Update in backend deployment

3. **Secure MongoDB**:
   - Whitelist only your server IPs in MongoDB Atlas
   - Use strong password

4. **Google Drive**:
   - Keep service account JSON file secure
   - Never commit it to Git
   - Rotate keys periodically

---

## 🐛 Troubleshooting

### Backend won't start

**Error**: "MongoDB connection failed"
- ✅ Check MongoDB connection string
- ✅ Ensure IP address is whitelisted in Atlas
- ✅ Verify username/password

**Error**: "Drive upload failed"
- ✅ Verify service account email has access to folder
- ✅ Check private key format (should include `\n`)
- ✅ Ensure Drive API is enabled

### Frontend issues

**Error**: "Network Error" or "Cannot connect to API"
- ✅ Check backend is running
- ✅ Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- ✅ Check CORS settings in backend

**Error**: "Logo not showing"
- ✅ Ensure `logo.jpeg` is in `frontend/public/` folder
- ✅ Restart frontend after adding logo

### Upload Issues

**Files not uploading**
- ✅ Check file size (must be < 50MB)
- ✅ Verify file type (PDF, JPG, JPEG, PNG only)
- ✅ Check Google Drive folder permissions
- ✅ Look at backend logs for error details

---

## 📦 Tech Stack

### Backend
- **Node.js + Express**: REST API
- **MongoDB + Mongoose**: Database
- **Google Drive API**: File storage
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Multer**: File uploads

### Frontend
- **Next.js 14**: React framework
- **Tailwind CSS**: Styling
- **React Calendar**: Date picker
- **Axios**: API calls
- **React Hot Toast**: Notifications

---

## 🎯 Features Checklist

✅ Public newspaper viewing (today + archive)
✅ Calendar-based date picker
✅ PDF viewer (embedded Google Drive)
✅ Admin authentication (JWT)
✅ File upload with progress tracking
✅ Google Drive integration
✅ Image and PDF support
✅ Mobile responsive design
✅ Marathi language UI
✅ Beautiful newspaper aesthetic
✅ Upload history with delete
✅ Replace existing newspapers
✅ File size validation
✅ Secure admin routes

---

## 📞 Support & Contact

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs: `cd backend && npm start`
3. Review frontend logs in browser console

---

## 📄 License

This project is created for Aadharwad Digital Newspaper.

---

## 🙏 Credits

Built with ❤️ using modern web technologies.
- Fonts: Noto Sans Devanagari, Playfair Display
- Icons: Heroicons
- Storage: Google Drive API

---

## 🚀 Future Enhancements

Potential features to add:
- [ ] Email notifications on new upload
- [ ] Download newspaper as ZIP
- [ ] Search by keyword
- [ ] Multi-admin support
- [ ] Analytics dashboard
- [ ] Dark mode
- [ ] WhatsApp sharing
- [ ] Automatic thumbnail generation
- [ ] Multi-language support

---

**Note**: After deployment, update this README with your actual URLs and production credentials location.
