# 🚀 Streamlit Cloud Deployment Guide

## Prerequisites
- GitHub repository with your code
- Streamlit Cloud account (free at https://share.streamlit.io)

## Deployment Steps

### 1. Push to GitHub
Make sure all files are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Prepare for Streamlit Cloud deployment"
git push origin main
```

### 2. Deploy on Streamlit Cloud
1. Go to https://share.streamlit.io
2. Sign in with your GitHub account
3. Click "New app"
4. Fill in the details:
   - **Repository**: `your-username/your-repo-name`
   - **Branch**: `main` (or your default branch)
   - **Main file path**: `streamlit_app.py`
   - **App URL**: Choose a custom URL (optional)

### 3. Configure Environment
- **Python version**: 3.9 (default)
- **Dependencies**: Will use `requirements.txt` automatically
- **Secrets**: Not needed for this app

### 4. Deploy
Click "Deploy!" and wait for the build to complete.

## Files Included for Deployment
- ✅ `streamlit_app.py` - Main app file
- ✅ `requirements.txt` - Python dependencies
- ✅ `.streamlit/config.toml` - Streamlit configuration
- ✅ `src/` - Source code directory
- ✅ `data/` - CSV data files
- ✅ `assets/` - Images and CSS
- ✅ `rename_config.py` - Configuration file

## Authentication
The app uses simple session-based authentication:
- **Username**: `ireb`
- **Password**: `irebireb`

## Troubleshooting
- If deployment fails, check the logs in Streamlit Cloud
- Ensure all dependencies are in `requirements.txt`
- Verify file paths are correct
- Check that data files are included in the repository
- **Python version compatibility**: The app uses Python 3.11 (specified in `runtime.txt`)
- **Package versions**: Updated to compatible versions for Streamlit Cloud

### Common Errors:
- **`ModuleNotFoundError: No module named 'plotly.express'`**: 
  - Use compatible package versions (see current `requirements.txt`)
  - Remove unused imports like `from plotly.subplots import make_subplots`
  - Ensure Python 3.11 is specified in `runtime.txt`

## Custom Domain (Optional)
You can add a custom domain in the Streamlit Cloud settings after deployment.
