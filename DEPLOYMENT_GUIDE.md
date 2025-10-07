# Deployment Guide

## Backend Deployment (Render)

### Steps:

1. **Create a Render Account**: Go to [render.com](https://render.com) and sign up
2. **Connect GitHub**: Connect your GitHub repository to Render
3. **Create Web Service**:

   - Choose "Web Service"
   - Connect your repository
   - Select the `backend` folder as the root directory
   - Use these settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: Node

4. **Environment Variables** (Add these in Render dashboard):

   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://rumeshth20_db_user:rumesh123@pasanenterprises.xtrratp.mongodb.net/pasan-enterprises?retryWrites=true&w=majority&appName=PasanEnterprises
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

5. **Deploy**: Click "Create Web Service"

Your backend will be available at: `https://your-app-name.onrender.com`

## Frontend Deployment (Vercel)

### Steps:

1. **Create a Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up
2. **Connect GitHub**: Import your GitHub repository
3. **Project Settings**:

   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Environment Variables** (Add these in Vercel dashboard):

   ```
   REACT_APP_API_URL=https://your-render-app.onrender.com/api
   REACT_APP_NAME=Pasan Enterprises
   REACT_APP_VERSION=1.0.0
   REACT_APP_NODE_ENV=production
   ```

5. **Deploy**: Click "Deploy"

Your frontend will be available at: `https://your-app-name.vercel.app`

## Post-Deployment Configuration

1. **Update Backend CORS**: After getting your Vercel URL, update the backend `.env`:

   ```
   FRONTEND_URL=https://your-actual-vercel-url.vercel.app
   ALLOWED_ORIGINS=http://localhost:3000,https://your-actual-vercel-url.vercel.app
   ```

2. **Update Frontend API URL**: After getting your Render URL, update the frontend `.env`:

   ```
   REACT_APP_API_URL=https://your-actual-render-url.onrender.com/api
   ```

3. **Redeploy**: Both services should automatically redeploy when you push changes to GitHub

## Testing Your Deployment

- **Backend Health Check**: Visit `https://your-render-url.onrender.com/health`
- **Frontend**: Visit `https://your-vercel-url.vercel.app`

## Important Notes

- **Free Tier Limitations**:
  - Render free tier may sleep after 15 minutes of inactivity
  - Vercel has bandwidth and build time limits on free tier
- **Environment Variables**: Never commit real environment variables to GitHub
- **Database**: Your MongoDB connection string is already configured
- **HTTPS**: Both Vercel and Render provide HTTPS automatically
