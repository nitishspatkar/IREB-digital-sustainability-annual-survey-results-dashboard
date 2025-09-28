@echo off
REM IREB Digital Sustainability Survey Dashboard Installation Script for Windows

echo 🚀 Installing IREB Digital Sustainability Survey Dashboard...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo ✅ Python found

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo 📚 Installing dependencies...
pip install -r requirements.txt

echo ✅ Installation complete!
echo.
echo To run the dashboard:
echo   python run_streamlit.py
echo.
echo Or activate the virtual environment and run:
echo   venv\Scripts\activate.bat
echo   streamlit run streamlit_app.py
pause
