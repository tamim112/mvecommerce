# 🛒 BazarHub - Multi-Vendor E-Commerce Platform

Congratulations on successfully building your **Full-Stack Multi-Vendor E-Commerce Platform (BazarHub)**! You have built a production-ready Django API server, a mobile-responsive React web app, hosted both online, and compiled everything into a functional Android APK without needing heavy GUI tools like Android Studio.

Here is the complete, structured step-by-step summary of all commands and tasks required to set up and run this ecosystem on any new machine.

---

## 📂 Phase 1: Global Setup & Repository Configuration
Before separating backend and frontend paths, initialize your master architecture and configure project secrecy.

1. **Root Layout**: Ensure your local file explorer structure looks like this:
   ```text
   multivendor_ecommerce/
   ├── backend/
   ├── frontend/
   ├── venv/
   ├── .gitignore
   └── README.md
   ```

2. **Master Security Rules (`.gitignore`)**:
   Create a `.gitignore` in the root folder to completely hide dependency caches from GitHub while preserving your `/confedential` folder inside a private ecosystem:
   ```gitignore
   venv/
   frontend/node_modules/
   frontend/dist/
   staticfiles/
   db.sqlite3
   __pycache__/
   .env
   ```

3. **Locking Repository Privacy**:
   Go to your web browser ➔ GitHub ➔ `Settings` ➔ Danger Zone ➔ **Change repository visibility to Private**.

4. **Push Master Workspace**:
   ```bash
   git init
   git remote add origin https://github.com
   git add .
   git commit -m "Security: Initialize secure private fullstack architecture"
   git branch -M main
   git push -u origin main
   ```

---

## ⚙️ Phase 2: Backend Component (Django REST Framework)
Manages custom split-role memberships (Customers/Vendors), dynamic inventory mutations, shopping sessions, and PostgreSQL cloud integrations.

### 1. Local Management Commands
```bash
# Create and power-up isolated development sandbox
python -m venv venv
venv\Scripts\activate

# Install strictly isolated dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow psycopg2-binary gunicorn dj-database-url whitenoise

# Sync blueprints with database engine
python manage.py makemigrations
python manage.py migrate

# Boot up local server (Access at http://127.0.0)
python manage.py runserver
```

### 2. Clean Production Requirements (`backend/requirements.txt`)
```txt
Django==5.1.4
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.4.0
pillow==10.4.0
gunicorn==26.2.0
psycopg2-binary==2.9.9
dj-database-url==2.1.0
whitenoise==6.8.2
```

### 3. Live Server Deployment (Render.com Web Service)
* **Environment Settings**: Click `Add Environment Variable` ➔ Key: `PYTHON_VERSION` | Value: `3.11.9` *(Forces stable interpreter engine)*.
* **Build Command**:
  ```bash
  pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && python create_admin.py
  ```
* **Start Command**:
  ```bash
  gunicorn backend.wsgi:application
  ```

---

## 🎨 Phase 3: Frontend Component (React.js & Tailwind CSS)
Handles real-time item catalog listings, unique active cart increments, checkout parameters, and interactive supplier toolsets.

### 1. Assembly & Styling Initializations
```bash
# Enter target directory path
cd frontend

# Generate blazing-fast skeleton structure
npm create vite@latest . -- --template react
npm install axios react-router-dom lucide-react

# Integrate Next-Gen Tailwind CSS compiler engine
npm install tailwindcss @tailwindcss/vite
```

### 2. Configuration Settings (`frontend/vite.config.js`)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 3. Active Build Actions & Web Serving
```bash
# Run local micro-server for live browser preview (http://localhost:5173/)
npm run dev

# Generate compressed pure web files for deployment
npm run build
```
* **Hosting**: Import `frontend` directory directly into **Vercel.com**, framework preset to **Vite**, auto-deploys completely free.

---

## 📱 Phase 4: Native Android Bundling (Capacitor.js APK)
Transforms compiled client assets directly into native cross-platform runtime modules without using heavy Android Studio resources.

### 1. Machine Dependencies Setup
* **Compiler Framework**: Install **Java JDK 21**. Verify in terminal using `java -version`.
* **Environment Path**: Append `C:\Program Files\Java\jdk-21\bin` inside Windows System Environment Variables.

### 2. Capacitor Injection & Compilation
Open your shell terminal directly inside the `frontend` folder pathway and execute:
```bash
# 1. Install operational native bridges
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Configure meta-parameters (Name: BazarHub | ID: com.tamim.bazarhub)
npx cap init

# 3. Create Android file frameworks
npx cap add android

# 4. Compile React web app to compressed folder
npm run build

# 5. Push production dist files into the mobile wrapper paths
npx cap sync android
```

### 3. Google SDK & Manual Licensing Loophole (No Android Studio Needed)
1. Create directory trail: `C:\Android\sdk\licenses\`
2. Place a file inside named **`android-sdk-license`** (Ensure absolutely no trailing `.txt` file-extension).
3. Open with notepad, paste these security verification keys, and save:
   ```text
   89354db4ef727247e4f25a58847996784d1fa4f5
   24333f8a63b6825ea9c5514f83c2829b004d1fee
   ```
4. Define SDK parameters by creating **`frontend/android/local.properties`** and adding:
   ```properties
   sdk.dir=C:\\Android\\sdk
   ```

### 4. The 1-Click APK Compile Execution
Navigate deep into the build matrix folder and fire the final assembly engine command:
```bash
cd android
.\gradlew assembleDebug
```

### 🎯 Output Path for the Compiled Mobile App (.APK)
Once the compiler script prints `BUILD SUCCESSFUL`, head into your file manager and grab your newly generated native app:
👉 **`frontend/android/app/build/outputs/apk/debug/app-debug.apk`**

---

## 🚀 Future Maintenance Cycle (When you add new features)
Whenever you write new features or update code, just run this quick update loop to re-compile your mobile app:
```bash
# Inside frontend folder:
npm run build
npx cap sync android
cd android
.\gradlew assembleDebug
```
