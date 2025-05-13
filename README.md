# IREB Digital Sustainability Survey Dashboard

A modern, interactive dashboard built with Dash and Plotly to visualize and explore the results of the IREB Digital Sustainability Annual Survey.

![Dashboard Screenshot](https://imgur.com/a/KZtvFuk)

## Overview

This project provides a web-based dashboard for analyzing responses to the IREB Digital Sustainability Survey. The dashboard presents survey results through intuitive visualizations organized into four main sections:

1. **Demographics** - Information about survey respondents including age groups, geographic distribution, professional roles, and more.
2. **General Awareness** - Data on respondents' awareness of digital sustainability concepts and training participation.
3. **Role in Organization** - Insights into how organizations approach sustainability including goals, teams, and reporting practices.
4. **Job & Tasks** - Analysis of how sustainability is incorporated into individual roles and tasks, including drivers and barriers.

## Prerequisites

Before setting up this project, ensure you have:

- Python 3.8 or higher installed
- pip (Python package installer)
- Git (to clone the repository)

## Installation and Setup

Follow these steps to set up and run the dashboard on your local machine:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/IREB-digital-sustainability-annual-survey-results.git
cd IREB-digital-sustainability-annual-survey-results
```

### 2. Create a virtual environment

#### Using venv (Python's built-in virtual environment)

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### Using conda (alternative)

```bash
# Create a conda environment
conda create -n sustainability-dashboard python=3.10
# Activate the environment
conda activate sustainability-dashboard
```

### 3. Install required packages

```bash
pip install -r requirements.txt
```

### 4. Run the dashboard

```bash
python app.py
```

After running this command, you should see output indicating that the Dash app is running. Open your web browser and navigate to `http://127.0.0.1:8050/` to view the dashboard.

## Project Structure

- `app.py` - The main application file containing the dashboard layout and callback functions
- `assets/` - Directory containing CSS and other static assets for styling
- `data/` - Directory containing the survey data files
- `analysis/` - Directory containing data analysis and preparation code
- `requirements.txt` - List of Python package dependencies

## Dashboard Sections

### Demographics

This section shows:
- Key statistics about survey respondents
- Age group distribution
- Years of experience distribution
- Geographic distribution
- Professional roles and organization types
- Application domains

### General Awareness

This section presents:
- Familiarity with digital sustainability concepts
- Frequency of sustainability discussions in professional environments
- Participation in sustainability training
- Satisfaction with training opportunities

### Role in Organization

This section displays:
- Organization-level sustainability goals and commitments
- Presence of sustainability experts or teams
- Sustainability reporting practices
- Training and resources offered
- Customer requirements related to sustainability

### Job & Tasks

This section analyzes:
- Individual incorporation of sustainability principles
- Use of sustainability-related tools
- Drivers and motivations for sustainability
- Barriers to implementing sustainable practices
- Knowledge gaps and support needs

## Making the Dashboard Accessible Online

You can make the dashboard accessible over the internet using ngrok:

### 1. Install ngrok

Download from [ngrok.com](https://ngrok.com/download) or install using package managers:

```bash
# Using Homebrew on macOS
brew install ngrok

# Using Chocolatey on Windows
choco install ngrok
```

### 2. Authenticate ngrok (first-time setup)

```bash
ngrok authtoken YOUR_AUTH_TOKEN
```

### 3. Create a tunnel to your local dashboard

With your dashboard running locally, open a new terminal and run:

```bash
ngrok http 8050
```

This will provide a public URL (like `https://a1b2c3d4.ngrok.io`) that you can share with others to access your dashboard.

## Data Privacy

The dashboard uses anonymized survey data. No personally identifiable information is displayed.

## Customization

To customize the dashboard:
- Edit `app.py` to modify the layout and visualizations
- Modify `assets/custom.css` to change styling
- Update the data files in the `data/` directory to use different survey responses

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- IREB for providing the digital sustainability survey data
- Dash and Plotly teams for the visualization libraries 