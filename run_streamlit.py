#!/usr/bin/env python3
"""Script to run the Streamlit app."""

import subprocess
import sys
import os

def main():
    """Run the Streamlit app."""
    print("🚀 Starting IREB Digital Sustainability Survey Dashboard...")
    
    # Check if data directory exists
    if not os.path.exists("data"):
        print("❌ Data directory not found. Please ensure the 'data' folder exists with CSV files.")
        sys.exit(1)
    
    # Check if streamlit is installed
    try:
        import streamlit
        print("✅ Streamlit found")
    except ImportError:
        print("📦 Streamlit not found. Installing requirements...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("✅ Requirements installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install requirements: {e}")
            sys.exit(1)
    
    # Run streamlit
    print("🌐 Starting Streamlit server...")
    print("📱 Dashboard will be available at: http://localhost:8501")
    print("🔐 Login credentials: username='ireb', password='irebireb'")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", "streamlit_app.py",
            "--server.port", "8501",
            "--server.address", "localhost"
        ])
    except KeyboardInterrupt:
        print("\n👋 Dashboard stopped. Goodbye!")
    except Exception as e:
        print(f"❌ Error running Streamlit: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

