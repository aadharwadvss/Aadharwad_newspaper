# 🌐 Aadharwad v2 - Bilingual Newspaper Portal

## ✨ New Features Added

✅ **Bilingual Support** - Marathi + English with language toggle  
✅ **Latest News Section** - Replace daily newspaper with recent news  
✅ **Admin News Management** - Add, edit, delete bilingual news articles  
✅ **Image Upload to Google Drive** - News images stored in Drive  
✅ **Complete i18n Integration** - All UI text translated  

---

## 📦 What's Changed from v1

### Backend Changes:
- ✅ `models.js` - Added RecentNews schema
- ✅ `server.js` - Added 6 new news routes (public + admin)
- ✅ Same Google Drive integration for news images

### Frontend Changes:
- ✅ Added `react-i18next` for bilingual support
- ✅ New translation files (`locales/mr`, `locales/en`)
- ✅ New component: `LatestNewsSection.js`
- ✅ New page: `admin/news.js`
- ✅ Updated Header with language toggle
- ✅ Updated homepage with latest news section
- ✅ All existing features preserved

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Copy Your Environment Files

```bash
# Copy .env from your old project
cp ../aadharwad-newspaper-backup/backend/.env ./backend/.env
cp ../aadharwad-newspaper-backup/frontend/.env.local ./frontend/.env.local
```

### Step 2: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
# This will install the new i18n packages
```

### Step 3: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 4: Test the Features

1. **Visit:** http://localhost:3000
2. **Language Toggle:** Click button in top-right (मराठी | English)
3. **Latest News:** Should show "No news" initially
4. **Admin Login:** Go to admin panel
5. **Manage News:** Click "बातम्या व्यवस्थापित करा"
6. **Add News:** Fill bilingual form + upload image
7. **Check Homepage:** News should appear

---

## 🔑 Key Files Modified

### Must Update (Already done in this package):

**Backend:**
- `backend/models.js` - Lines 77-126 (RecentNews schema added)
- `backend/server.js` - Line 12 (import), Lines 442+ (news routes)

**Frontend:**
- `frontend/package.json` - Added i18n dependencies
- `frontend/pages/_app.js` - Added i18n import
- `frontend/locales/` - New translation files
- `frontend/utils/i18n.js` - New i18n config
- `frontend/components/LatestNewsSection.js` - New component
- `frontend/pages/admin/news.js` - New admin page

### Need Minor Updates (Instructions below):

**Frontend:**
- `frontend/components/Header.js` - Add language toggle
- `frontend/components/admin/AdminLayout.js` - Add news menu item
- `frontend/pages/index.js` - Add LatestNewsSection

---

## 📝 Manual Updates Needed (Copy-Paste Ready)

### 1. Update Header.js

**Add at top (after imports):**
```javascript
import { useTranslation } from 'react-i18next';
```

**Inside component (after const router):**
```javascript
const { t, i18n } = useTranslation();

const toggleLanguage = () => {
  const newLang = i18n.language === 'mr' ? 'en' : 'mr';
  i18n.changeLanguage(newLang);
  localStorage.setItem('language', newLang);
};
```

**In the top banner section, replace:**
```javascript
<p className="text-xs text-newspaper-gold font-english">
  Daily Digital Edition • Est. 2026
</p>
```

**With:**
```javascript
<div className="flex justify-between items-center w-full">
  <p className="text-xs text-newspaper-gold font-english">
    Daily Digital Edition • Est. 2026
  </p>
  <button
    onClick={toggleLanguage}
    className="text-xs bg-newspaper-gold text-newspaper-dark px-3 py-1 rounded-full font-semibold hover:bg-opacity-90 transition-all"
  >
    {i18n.language === 'mr' ? 'English' : 'मराठी'}
  </button>
</div>
```

**Replace hardcoded text with translations:**
- `मुख्यपृष्ठ` → `{t('header.home')}`
- `संग्रहालय` → `{t('header.archive')}`
- `प्रशासक प्रवेश` → `{t('header.adminLogin')}`

### 2. Update index.js (Homepage)

**Add imports:**
```javascript
import LatestNewsSection from '../components/LatestNewsSection';
import { useTranslation } from 'react-i18next';
```

**Inside component:**
```javascript
const { t } = useTranslation();
```

**Add LatestNewsSection right after opening fragment:**
```javascript
return (
  <>
    <Head>
      <title>{t('header.title')} - {t('home.todayNewspaper')}</title>
    </Head>

    {/* ADD THIS */}
    <LatestNewsSection />

    {/* Existing Hero Section */}
    <section className="bg-gradient-to-br...">
      ...
    </section>
    ...
  </>
);
```

### 3. Update AdminLayout.js

**Add import:**
```javascript
import { useTranslation } from 'react-i18next';
```

**Inside component:**
```javascript
const { t } = useTranslation();
```

**Add news menu item (after Upload, before History):**
```javascript
<Link
  href="/admin/news"
  className={`block px-4 py-3 rounded-lg marathi-text font-semibold transition-all ${
    isActive('/admin/news')
      ? 'bg-newspaper-red text-white'
      : 'hover:bg-newspaper-beige text-newspaper-dark'
  }`}
>
  <div className="flex items-center space-x-3">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
    <span>{t('admin.manageNews')}</span>
  </div>
</Link>
```

---

## ✅ Testing Checklist

After setup, verify:

- [ ] Backend starts without errors
- [ ] Frontend compiles
- [ ] Homepage loads
- [ ] Language toggle works (top banner)
- [ ] All text changes when switching language
- [ ] Latest News section appears (empty initially)
- [ ] Can login to admin
- [ ] See "बातम्या व्यवस्थापित करा" in admin menu
- [ ] Can access news management page
- [ ] Can add news (both languages + image)
- [ ] News appears on homepage
- [ ] Can edit news
- [ ] Can delete news
- [ ] Newspaper system still works

---

## 🗄️ Database Changes

New collection created automatically:
- **Collection:** `recentnews`
- **Fields:** `title_mr`, `title_en`, `description_mr`, `description_en`, `imageUrl`, `driveFileId`, `uploadedBy`, `createdAt`, `updatedAt`

No migration needed - MongoDB creates collection on first insert.

---

## 🎯 Quick Diff Summary

**Lines Changed:**
- Backend: ~200 lines added (news routes)
- Frontend: ~800 lines added (i18n + news components)

**Files Created:**
- 5 new files (translations + components)

**Files Modified:**
- 6 existing files (minor updates)

---

## 🚨 Common Issues

### Issue: "Cannot find module 'react-i18next'"
**Fix:** Run `npm install` in frontend

### Issue: Language not switching
**Fix:** Hard refresh browser (Ctrl+Shift+R)

### Issue: News images not uploading
**Fix:** Check Google Drive API credentials in .env

### Issue: Admin page shows blank
**Fix:** Make sure you copied all files, especially `pages/admin/news.js`

---

## 📞 Need Help?

Check these files:
1. Backend logs for errors
2. Browser console for frontend errors
3. Network tab for API calls

Most issues are from:
- Missing npm install
- Wrong API URL in .env
- Old browser cache

---

**Version:** 2.0.0  
**Updated:** February 2026  
**Compatible with:** Original v1 databases
