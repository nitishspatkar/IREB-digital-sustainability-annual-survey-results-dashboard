# IREB Digital Sustainability Survey Dashboard

A modern, interactive dashboard for visualizing IREB Digital Sustainability Survey results, built with Streamlit and Plotly.

![Dashboard Screenshot](https://imgur.com/a/KZtvFuk)

## 🌟 Features

- 🌱 **Interactive Visualizations**: Charts and graphs powered by Plotly
- 🔐 **Authentication**: Simple login system (username: `ireb`, password: `irebireb`)
- 📊 **Four Main Sections**: Demographics, Awareness, Organization, and Job Tasks
- 🌍 **World Map**: Geographic distribution of responses
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Fast Loading**: Cached data loading for better performance
- 🎨 **IREB Branding**: Consistent color scheme and styling

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd IREB-digital-sustainability-annual-survey-results-dashboard
```

### 2. Create and activate virtual environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements_streamlit.txt
```

### 4. Run the application
```bash
python run_streamlit.py
```

The dashboard will be available at: `http://localhost:8501`

## 🔐 Authentication

- **Username**: `ireb`
- **Password**: `irebireb`

## 📁 Project Structure

```
├── streamlit_app.py              # Main Streamlit application
├── run_streamlit.py              # Script to run the app
├── requirements_streamlit.txt    # Python dependencies
├── .gitignore                    # Git ignore file
├── src/
│   ├── streamlit_utils.py        # Utility functions for Streamlit
│   ├── config.py                 # Configuration settings
│   └── utils/
│       └── data_processing.py    # Data loading and processing
├── data/                         # Survey data (CSV files)
│   ├── 2025.csv
│   └── 2026.csv
├── assets/
│   ├── IREB_RGB.jpg             # IREB logo
│   └── custom.css               # Custom CSS styles
└── rename_config.py             # Column name mappings
```

## 📊 Dashboard Sections

### 🏠 Demographics (Questions 1-7)
- Total responses and key metrics
- Age group distribution
- Professional experience histogram
- Geographic distribution (continent pie chart)
- World map with country responses
- Role and organization type distributions

### 💡 General Awareness of Sustainability (Questions 8-16)
- Digital sustainability awareness levels
- Training participation and satisfaction
- Discussion frequency in professional environment
- Reasons for training participation/non-participation

### 🏢 The Role of Digital Sustainability in Your Organization (Questions 17-27)
- Organization sustainability goals and practices
- Multi-select sustainability dimensions
- Training and resource availability
- Customer requirements and reporting practices

### 👨‍💼 Sustainability in Your Job and Tasks (Questions 28-35)
- Sustainability incorporation in tasks
- Drivers and barriers to sustainability
- Knowledge gaps and support needs
- Tools and frameworks used

## 🛠️ Customization

### Adding New Years
1. Add the year to `AVAILABLE_YEARS` in `src/config.py`
2. Place the CSV file in the `data/` folder with the format `YYYY.csv`

### Modifying Charts
- Edit chart functions in `src/streamlit_utils.py`
- Update page functions in `streamlit_app.py`

### Styling
- Modify the CSS in the `st.markdown()` section of `streamlit_app.py`
- Update color schemes in `src/config.py`

## 🐛 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Ensure all dependencies are installed: `pip install -r requirements_streamlit.txt`

2. **Data loading errors**
   - Check that CSV files exist in the `data/` folder
   - Verify file naming convention (`YYYY.csv`)

3. **Authentication not working**
   - Username: `ireb`, Password: `irebireb`
   - Check browser console for errors

4. **Charts not displaying**
   - Check that column names match between data and configuration
   - Verify data types in CSV files

### Performance Tips

- The app uses `@st.cache_data` for data loading
- Large datasets may take time to load initially
- Consider reducing data size for development

## 🚀 Deployment

### Local Network Access
```bash
streamlit run streamlit_app.py --server.address 0.0.0.0 --server.port 8501
```

### Cloud Deployment
- **Streamlit Cloud**: Connect your GitHub repository
- **Heroku**: Use the Streamlit buildpack
- **Docker**: Create a Dockerfile with the requirements

## 📝 Data Privacy

The dashboard uses anonymized survey data. No personally identifiable information is displayed.

## 📄 License

This project is part of the IREB Digital Sustainability Survey initiative.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Streamlit documentation
3. Check the project's issue tracker

## 🙏 Acknowledgments

- IREB for providing the digital sustainability survey data
- Streamlit and Plotly teams for the visualization libraries
- The open-source community for various supporting libraries