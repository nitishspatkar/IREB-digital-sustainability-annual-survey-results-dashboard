"""Main Streamlit application for the Digital Sustainability Survey Dashboard."""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.config import (
    DATA_FOLDER, 
    AVAILABLE_YEARS, 
    STYLE_VARS,
    DEMOGRAPHIC_COLS,
    AWARENESS_COLS,
    AWARENESS_TRAINING_REASONS,
    AWARENESS_MORE_TRAINING_REASONS,
    ORGANIZATION_COLS,
    ORG_MULTI_DIMENSIONS,
    ORG_TRAINING_REASONS,
    JOB_TASK_COLS,
    JOB_TASK_DIMENSIONS,
    JOB_TASK_MULTI_DRIVES,
    JOB_TASK_MULTI_HINDER,
    JOB_TASK_MULTI_KNOWLEDGE,
    JOB_TASK_MULTI_SUPPORT,
    FREE_TEXT_COLS
)
from src.utils.data_processing import load_single_year_data, clean_column_names
from src.streamlit_utils import (
    create_bar_chart, create_pie_chart, create_histogram, 
    create_multi_select_chart, create_world_map, display_metric_card,
    display_chart_in_container, get_free_text_responses, display_free_text_section,
    create_binary_chart, create_ordinal_chart, create_stacked_bar_chart,
    load_cached_data
)
from rename_config import rename_mapping

# Page configuration
st.set_page_config(
    page_title="Digital Sustainability Insights Dashboard",
    page_icon="🌱",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS matching original Dash app styling
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #831E82, #A450A3);
        color: white;
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        text-align: center;
    }
    .metric-card {
        background: white;
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-left: 4px solid #831E82;
    }
    .chart-container {
        background: white;
        padding: 1rem;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
        border: none;
    }
    .sidebar .sidebar-content {
        background: linear-gradient(180deg, #831E82, #A450A3);
    }
    .stSelectbox > div > div {
        background-color: white;
    }
    .stDataFrame {
        border-radius: 10px;
        overflow: hidden;
    }
    .stDataFrame table {
        border-radius: 10px;
    }
    .stDataFrame thead th {
        background-color: #f8f9fa;
        color: #831E82;
        font-weight: bold;
        border: none;
    }
    .stDataFrame tbody td {
        border: none;
        background-color: white;
    }
    .stDataFrame tbody tr:nth-child(even) td {
        background-color: #fafbfc;
    }
    /* Enhanced styling for better visual hierarchy */
    .stMarkdown h1 {
        color: #831E82;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    .stMarkdown h2 {
        color: #831E82;
        font-weight: 600;
        margin-bottom: 1rem;
    }
    .stMarkdown h3 {
        color: #831E82;
        font-weight: 600;
        margin-bottom: 0.75rem;
    }
    /* Custom styling for better chart presentation */
    .js-plotly-plot {
        border-radius: 10px;
        overflow: hidden;
    }
    /* Sidebar enhancements */
    .css-1d391kg {
        background: linear-gradient(180deg, #831E82, #A450A3);
    }
    .css-1d391kg .css-1v0mbdj {
        color: white;
    }
    /* Button styling */
    .stButton > button {
        background: linear-gradient(135deg, #831E82, #A450A3);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    .stButton > button:hover {
        background: linear-gradient(135deg, #A450A3, #C581C4);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(131, 30, 130, 0.3);
    }
</style>
""", unsafe_allow_html=True)

def check_authentication():
    """Check if user is authenticated."""
    if 'authenticated' not in st.session_state:
        st.session_state.authenticated = False
    return st.session_state.authenticated

def login_page():
    """Display login page."""
    st.markdown("""
    <div class="main-header">
        <h1>🌱 Digital Sustainability Insights Dashboard</h1>
        <p>Please login to access the dashboard</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        with st.form("login_form"):
            st.subheader("Login")
            username = st.text_input("Username")
            password = st.text_input("Password", type="password")
            submit_button = st.form_submit_button("Login", use_container_width=True)
            
            if submit_button:
                if username == "ireb" and password == "irebireb":
                    st.session_state.authenticated = True
                    st.rerun()
                else:
                    st.error("Invalid username or password")

def create_sidebar():
    """Create sidebar with navigation and year selection."""
    # Logo
    st.sidebar.image("assets/IREB_RGB.jpg", width=200)
    
    st.sidebar.markdown("---")
    
    # Year selection
    selected_year = st.sidebar.selectbox(
        "Select Survey Year",
        options=AVAILABLE_YEARS,
        index=AVAILABLE_YEARS.index(2025) if 2025 in AVAILABLE_YEARS else len(AVAILABLE_YEARS) - 1
    )
    
    st.sidebar.markdown("---")
    
    # Navigation
    st.sidebar.markdown("### Navigation")
    
    pages = {
        "Demographics (Questions 1-7)": "demographics",
        "General Awareness of Sustainability (Questions 8-16)": "awareness", 
        "The Role of Digital Sustainability in Your Organization (Questions 17-27)": "organization",
        "Sustainability in Your Job and Tasks (Questions 28-35)": "job_tasks"
    }
    
    selected_page = st.sidebar.radio("Select Page", list(pages.keys()))
    
    st.sidebar.markdown("---")
    
    # Logout button
    if st.sidebar.button("Logout", use_container_width=True):
        st.session_state.authenticated = False
        st.rerun()
    
    return selected_page, selected_year

def load_data(year):
    """Load data for the selected year."""
    try:
        df = load_cached_data(year, DATA_FOLDER)
        return df
    except Exception as e:
        st.error(f"Error loading data for year {year}: {str(e)}")
        return None

def main():
    """Main application function."""
    # Check authentication
    if not check_authentication():
        login_page()
        return
    
    # Create sidebar and get selections
    selected_page, selected_year = create_sidebar()
    
    # Load data
    df = load_data(selected_year)
    if df is None:
        return
    
    
    # Route to appropriate page
    if selected_page == "Demographics (Questions 1-7)":
        show_demographics_page(df)
    elif selected_page == "General Awareness of Sustainability (Questions 8-16)":
        show_awareness_page(df)
    elif selected_page == "The Role of Digital Sustainability in Your Organization (Questions 17-27)":
        show_organization_page(df)
    elif selected_page == "Sustainability in Your Job and Tasks (Questions 28-35)":
        show_job_tasks_page(df)

def show_demographics_page(df):
    """Display demographics page (Questions 1-7)."""
    st.markdown("""
    <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="color: #831E82; font-weight: bold; margin-bottom: 0.5rem;">Demographics</h1>
        <p style="color: #666; font-size: 1.1rem;">Questions 1-7: Survey participant characteristics and geographic distribution</p>
    </div>
    """, unsafe_allow_html=True)
    
    
    # World map and country table side by side
    if "country_residence_1" in df.columns:
        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.markdown("**Country Statistics**")
            country_counts = df["country_residence_1"].value_counts().reset_index()
            country_counts.columns = ["Country", "Count"]
            st.dataframe(
                country_counts, 
                use_container_width=True,
                height=500
            )
        
        with col2:
            display_chart_in_container(
                create_world_map(df, "country_residence_1"),
                "World Map - Response Distribution"
            )
    
    # Age and Experience charts side by side
    col1, col2 = st.columns(2)
    
    with col1:
        if "age_group" in df.columns:
            display_chart_in_container(
                create_bar_chart(df, "age_group", "What is your age group?"),
                "What is your age group?"
            )
    
    with col2:
        if "years_of_experience" in df.columns:
            display_chart_in_container(
                create_ordinal_chart(df, "years_of_experience", "How many years of professional experience do you have?"),
                "How many years of professional experience do you have?"
            )
    
    # Application Domain chart (full width)
    if "application_domain" in df.columns:
        display_chart_in_container(
            create_bar_chart(df, "application_domain", "In which application domain do you currently primarily work?"),
            "In which application domain do you currently primarily work?"
        )
    
    # Role and Organization charts side by side
    col1, col2 = st.columns(2)
    
    with col1:
        if "role" in df.columns:
            display_chart_in_container(
                create_bar_chart(df, "role", "Which of the following best describes your current role in the organization?"),
                "Which of the following best describes your current role in the organization?"
            )
    
    with col2:
        if "organization_type" in df.columns:
            display_chart_in_container(
                create_bar_chart(df, "organization_type", "What type of organization do you work for?"),
                "What type of organization do you work for?"
            )

def show_awareness_page(df):
    """Display general awareness of sustainability page (Questions 8-16)."""
    st.markdown("""
    <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="color: #831E82; font-weight: bold; margin-bottom: 0.5rem;">General Awareness of Sustainability</h1>
        <p style="color: #666; font-size: 1.1rem;">Questions 8-16: Digital sustainability knowledge and training participation</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Find the definition column by partial match
    definition_cols = [col for col in df.columns if "umbrella term" in col]
    if not definition_cols:
        st.error("Error: Could not find definition column")
        return
    
    definition_col = definition_cols[0]
    
    # Calculate key statistics
    heard_of_def_count = df[definition_col].value_counts().get("Yes", 0)
    total_valid_responses = df[definition_col].notna().sum()
    heard_of_def_percentage = round((heard_of_def_count / total_valid_responses * 100) if total_valid_responses > 0 else 0)
    
    training_col = "participated_sustainability_training"
    training_participation = df[training_col].value_counts().get("Yes", 0) if training_col in df.columns else 0
    training_total = df[training_col].notna().sum() if training_col in df.columns else 0
    training_percentage = round((training_participation / training_total * 100) if training_total > 0 else 0)
    
    num_trainings_col = "num_sustainability_trainings"
    try:
        from src.utils.data_processing import process_numeric_column
        avg_trainings_numeric = process_numeric_column(df, num_trainings_col)
        avg_trainings = round(avg_trainings_numeric.mean(), 1) if not pd.isna(avg_trainings_numeric.mean()) else "N/A"
    except:
        avg_trainings = "N/A"
    
    
    # Binary questions as stacked bar chart
    binary_questions = []
    binary_columns = []
    
    if definition_col in df.columns:
        binary_questions.append("Do you know what digital sustainability is as an umbrella term?")
        binary_columns.append(definition_col)
    
    if training_col in df.columns:
        binary_questions.append("Have you participated in a training or educational program on digital sustainability?")
        binary_columns.append(training_col)
    
    if "training_private_capacity" in df.columns:
        binary_questions.append("Have you participated in training or educational programs on digital sustainability in your private capacity?")
        binary_columns.append("training_private_capacity")
    
    if binary_questions:
        display_chart_in_container(
            create_stacked_bar_chart(df, binary_columns, binary_questions, "Binary Questions Overview"),
            "Binary Questions Overview"
        )
    
    # Ordinal question - frequency of discussions
    if "frequency_sustainability_discussions" in df.columns:
        display_chart_in_container(
            create_ordinal_chart(df, "frequency_sustainability_discussions", "How frequently do you encounter discussions about digital sustainability in your professional environment?"),
            "How frequently do you encounter discussions about digital sustainability in your professional environment?"
        )
    
    # Likert-style question - satisfaction
    if "satisfied_num_trainings" in df.columns:
        display_chart_in_container(
            create_ordinal_chart(df, "satisfied_num_trainings", "Are you satisfied with the number of training or educational programs on digital sustainability you have participated in?"),
            "Are you satisfied with the number of training or educational programs on digital sustainability you have participated in?"
        )
    
    # Number of trainings histogram (full width)
    if num_trainings_col in df.columns:
        display_chart_in_container(
            create_histogram(df, num_trainings_col, "How many training or educational programs on digital sustainability have you participated in?", bins=6),
            "How many training or educational programs on digital sustainability have you participated in?"
        )
    
    # Training reasons sections
    
    if AWARENESS_TRAINING_REASONS:
        available_reasons = [col for col in AWARENESS_TRAINING_REASONS if col in df.columns]
        if available_reasons:
            # Check if any of the columns have "Yes" responses
            has_data = False
            for col in available_reasons:
                if col in df.columns:
                    yes_count = df[col].astype(str).str.strip().str.lower().eq('yes').sum()
                    if yes_count > 0:
                        has_data = True
                        break
            
            if has_data:
                display_chart_in_container(
                    create_multi_select_chart(df, available_reasons, "What are the reasons you haven't participated in a training or educational program on digital sustainability before?"),
                    "What are the reasons you haven't participated in a training or educational program on digital sustainability before?"
                )
    
    
    if AWARENESS_MORE_TRAINING_REASONS:
        available_more_reasons = [col for col in AWARENESS_MORE_TRAINING_REASONS if col in df.columns]
        if available_more_reasons:
            # Check if any of the columns have "Yes" responses
            has_data = False
            for col in available_more_reasons:
                if col in df.columns:
                    yes_count = df[col].astype(str).str.strip().str.lower().eq('yes').sum()
                    if yes_count > 0:
                        has_data = True
                        break
            
            if has_data:
                display_chart_in_container(
                    create_multi_select_chart(df, available_more_reasons, "What are the reasons you haven't participated in more training or educational programs on digital sustainability?"),
                    "What are the reasons you haven't participated in more training or educational programs on digital sustainability?"
                )
    
    # Private capacity training

def show_organization_page(df):
    """Display the role of digital sustainability in organization page (Questions 17-27)."""
    st.markdown("""
    <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="color: #831E82; font-weight: bold; margin-bottom: 0.5rem;">The Role of Digital Sustainability in Your Organization</h1>
        <p style="color: #666; font-size: 1.1rem;">Questions 17-27: Organizational sustainability structure, practices, and implementation approaches</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Define column names (matching original)
    goals_col = "org_sustainability_goals"
    csr_col = "org_csr_expert_team"
    practices_col = "org_incorporates_sustainability"
    coordination_col = "org_coordination_on_sustainability"
    
    
    
    # Binary questions as stacked bar chart
    binary_questions = []
    binary_columns = []
    
    if goals_col in df.columns:
        binary_questions.append("Does your organization have digital sustainability goals or benchmarks?")
        binary_columns.append(goals_col)
    
    if csr_col in df.columns:
        binary_questions.append("Does your organization have a dedicated CSR expert or team?")
        binary_columns.append(csr_col)
    
    if practices_col in df.columns:
        binary_questions.append("Does your organization incorporate sustainability considerations in its software development practices?")
        binary_columns.append(practices_col)
    
    if coordination_col in df.columns:
        binary_questions.append("Is there coordination between different departments in your organization regarding digital sustainability?")
        binary_columns.append(coordination_col)
    
    if binary_questions:
        display_chart_in_container(
            create_stacked_bar_chart(df, binary_columns, binary_questions, "Organization Binary Questions Overview"),
            "Organization Binary Questions Overview"
        )
    
    
    # Find dimension columns by partial match
    dimension_cols = [col for col in df.columns if "dimensions of sustainability" in col and any(dim in col for dim in ["Environmental", "Social", "Individual", "Economic", "Technical"])]
    
    if dimension_cols:
        # Calculate count for each dimension
        dim_data = pd.DataFrame({
            'Dimension': [
                'Environmental',
                'Social', 
                'Individual',
                'Economic',
                'Technical'
            ],
            'Count': [
                df[col].astype(str).str.strip().str.lower().eq('yes').sum()
                for col in dimension_cols
            ]
        })
        
        # Create enhanced horizontal bar chart for dimensions
        fig = px.bar(
            dim_data,
            y='Dimension',
            x='Count',
            orientation='h',
            template="plotly_white",
            color_discrete_sequence=['#831E82']
        )
        fig.update_traces(
            hovertemplate='<b>%{y}</b><br>Count: %{x}<extra></extra>',
            text=dim_data["Count"],
            textposition='outside',
            textfont=dict(size=16)
        )
        fig.update_layout(
            title=None,
            yaxis_title=None,
            xaxis_title="Count",
            height=400,
            margin=dict(l=10, r=10, t=30, b=10),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(family="Helvetica", size=16)
        )
        
        display_chart_in_container(
            fig,
            "Sustainability Dimensions in Software Development Projects"
        )
    
    
    # Customer requirements charts side by side
    # Additional binary questions
    additional_binary_questions = []
    additional_binary_columns = []
    
    if "customer_requires_sustainability" in df.columns:
        additional_binary_questions.append("Customer Sustainability Requirements")
        additional_binary_columns.append("customer_requires_sustainability")
    
    if "org_reports_sustainability" in df.columns:
        additional_binary_questions.append("Organization Reports on Sustainability")
        additional_binary_columns.append("org_reports_sustainability")
    
    if additional_binary_questions:
        display_chart_in_container(
            create_stacked_bar_chart(df, additional_binary_columns, additional_binary_questions, "Additional Organization Questions"),
            "Additional Organization Questions"
        )
    
    
    if ORG_TRAINING_REASONS:
        available_training_reasons = [col for col in ORG_TRAINING_REASONS if col in df.columns]
        if available_training_reasons:
            # Check if any of the columns have "Yes" responses
            has_data = False
            for col in available_training_reasons:
                if col in df.columns:
                    yes_count = df[col].astype(str).str.strip().str.lower().eq('yes').sum()
                    if yes_count > 0:
                        has_data = True
                        break
            
            if has_data:
                display_chart_in_container(
                    create_multi_select_chart(df, available_training_reasons, "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?"),
                    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?"
                )
    
    # Additional organization charts
    org_cols = [col for col in ORGANIZATION_COLS if col in df.columns and col not in [goals_col, csr_col, practices_col, coordination_col, "customer_requires_sustainability", "org_reports_sustainability"]]
    
    if org_cols:
        # Display remaining charts in a grid
        for i in range(0, len(org_cols), 2):
            if i + 1 < len(org_cols):
                col1, col2 = st.columns(2)
                with col1:
                    display_chart_in_container(
                        create_bar_chart(df, org_cols[i], f"Organization: {org_cols[i]}"),
                        f"Organization: {org_cols[i]}"
                    )
                with col2:
                    display_chart_in_container(
                        create_bar_chart(df, org_cols[i+1], f"Organization: {org_cols[i+1]}"),
                        f"Organization: {org_cols[i+1]}"
                    )
            else:
                display_chart_in_container(
                    create_bar_chart(df, org_cols[i], f"Organization: {org_cols[i]}"),
                    f"Organization: {org_cols[i]}"
                )

def show_job_tasks_page(df):
    """Display sustainability in job and tasks page (Questions 28-35)."""
    st.markdown("""
    <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="color: #831E82; font-weight: bold; margin-bottom: 0.5rem;">Sustainability in Your Job and Tasks</h1>
        <p style="color: #666; font-size: 1.1rem;">Questions 28-35: How digital sustainability is integrated into professional roles and daily responsibilities</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Define column names
    tasks_col = "incorporate_sustainability_in_tasks"
    tools_col = "tools_for_sustainability"
    
    
    # Binary questions as stacked bar chart
    binary_questions = []
    binary_columns = []
    
    if tasks_col in df.columns:
        binary_questions.append("Do you incorporate digital sustainability considerations in your role-specific tasks?")
        binary_columns.append(tasks_col)
    
    if tools_col in df.columns:
        binary_questions.append("Do you use any sustainability tools or frameworks in your work?")
        binary_columns.append(tools_col)
    
    if binary_questions:
        display_chart_in_container(
            create_stacked_bar_chart(df, binary_columns, binary_questions, "Job Tasks Binary Questions Overview"),
            "Job Tasks Binary Questions Overview"
        )
    
    # Multi-select sections with enhanced styling
    
    if JOB_TASK_MULTI_DRIVES:
        available_drives = [col for col in JOB_TASK_MULTI_DRIVES if col in df.columns]
        if available_drives:
            # Check if any of the columns have "Yes" responses
            has_data = False
            for col in available_drives:
                if col in df.columns:
                    yes_count = df[col].astype(str).str.strip().str.lower().eq('yes').sum()
                    if yes_count > 0:
                        has_data = True
                        break
            
            if has_data:
                display_chart_in_container(
                    create_multi_select_chart(df, available_drives, "What drives you to incorporate digital sustainability in your role-related tasks?"),
                    "What drives you to incorporate digital sustainability in your role-related tasks?"
                )
    
    
    if JOB_TASK_MULTI_HINDER:
        available_hinder = [col for col in JOB_TASK_MULTI_HINDER if col in df.columns]
        if available_hinder:
            # Check if any of the columns have "Yes" responses
            has_data = False
            for col in available_hinder:
                if col in df.columns:
                    yes_count = df[col].astype(str).str.strip().str.lower().eq('yes').sum()
                    if yes_count > 0:
                        has_data = True
                        break
            
            if has_data:
                display_chart_in_container(
                    create_multi_select_chart(df, available_hinder, "What hinders you from incorporating sustainability in your role-specific tasks?"),
                    "What hinders you from incorporating sustainability in your role-specific tasks?"
                )
    
    
    if JOB_TASK_MULTI_KNOWLEDGE:
        available_knowledge = [col for col in JOB_TASK_MULTI_KNOWLEDGE if col in df.columns]
        if available_knowledge:
            # Check if any of the columns have "Yes" responses
            has_data = False
            for col in available_knowledge:
                if col in df.columns:
                    yes_count = df[col].astype(str).str.strip().str.lower().eq('yes').sum()
                    if yes_count > 0:
                        has_data = True
                        break
            
            if has_data:
                display_chart_in_container(
                    create_multi_select_chart(df, available_knowledge, "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?"),
                    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?"
                )
    
    
    if JOB_TASK_MULTI_SUPPORT:
        available_support = [col for col in JOB_TASK_MULTI_SUPPORT if col in df.columns]
        if available_support:
            # Check if any of the columns have "Yes" responses
            has_data = False
            for col in available_support:
                if col in df.columns:
                    yes_count = df[col].astype(str).str.strip().str.lower().eq('yes').sum()
                    if yes_count > 0:
                        has_data = True
                        break
            
            if has_data:
                display_chart_in_container(
                    create_multi_select_chart(df, available_support, "What additional support or resources would help you integrate digital sustainability into your work?"),
                    "What additional support or resources would help you integrate digital sustainability into your work?"
                )
    
    # Sustainability Dimensions Considered in Tasks
    
    if JOB_TASK_DIMENSIONS:
        available_dimensions = [col for col in JOB_TASK_DIMENSIONS if col in df.columns]
        if available_dimensions:
            display_chart_in_container(
                create_multi_select_chart(df, available_dimensions, "Which sustainability dimensions do you consider in your role-specific tasks?"),
                "Which sustainability dimensions do you consider in your role-specific tasks?"
            )
    
    # Additional job task charts
    job_cols = [col for col in JOB_TASK_COLS if col in df.columns and col not in [tasks_col, tools_col]]
    
    if job_cols:
        # Display remaining charts in a grid
        for i in range(0, len(job_cols), 2):
            if i + 1 < len(job_cols):
                col1, col2 = st.columns(2)
                with col1:
                    display_chart_in_container(
                        create_bar_chart(df, job_cols[i], f"Job Tasks: {job_cols[i]}"),
                        f"Job Tasks: {job_cols[i]}"
                    )
                with col2:
                    display_chart_in_container(
                        create_bar_chart(df, job_cols[i+1], f"Job Tasks: {job_cols[i+1]}"),
                        f"Job Tasks: {job_cols[i+1]}"
                    )
            else:
                display_chart_in_container(
                    create_bar_chart(df, job_cols[i], f"Job Tasks: {job_cols[i]}"),
                    f"Job Tasks: {job_cols[i]}"
                )

def show_free_text_page(df):
    """Display free text responses page with enhanced styling matching original Dash app."""
    st.markdown("""
    <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="color: #831E82; font-weight: bold; margin-bottom: 0.5rem;">💬 Free Text Responses</h1>
        <p style="color: #666; font-size: 1.1rem;">Open-ended feedback and detailed responses</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Get free text responses
    free_text_cols = [col for col in FREE_TEXT_COLS if col in df.columns]
    responses = get_free_text_responses(df, free_text_cols)
    
    if responses:
        for col, texts in responses.items():
            
            for i, text in enumerate(texts, 1):
                st.markdown(f"""
                <div style="
                    background: #f8f9fa;
                    border-radius: 10px;
                    padding: 1rem;
                    margin-bottom: 0.5rem;
                    border-left: 4px solid #831E82;
                    font-family: 'Helvetica', Arial, sans-serif;
                    font-size: 1rem;
                    color: #333;
                ">
                    <strong>{i}.</strong> {text}
                </div>
                """, unsafe_allow_html=True)
    else:
        st.info("No free text responses available for the selected year.")

def show_insights_page(df):
    """Display insights page with enhanced styling matching original Dash app."""
    st.markdown("""
    <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="color: #831E82; font-weight: bold; margin-bottom: 0.5rem;">📊 Insights</h1>
        <p style="color: #666; font-size: 1.1rem;">Key performance indicators and summary statistics</p>
    </div>
    """, unsafe_allow_html=True)
    
    
    
    insight_cols = [
        'incorporate_sustainability_in_tasks',
        'organization_sustainability_goals',
        'frequency_sustainability_discussions'
    ]
    
    # Display charts in a grid
    for i in range(0, len(insight_cols), 2):
        if i + 1 < len(insight_cols):
            col1, col2 = st.columns(2)
            with col1:
                if insight_cols[i] in df.columns:
                    display_chart_in_container(
                        create_bar_chart(df, insight_cols[i], f"Insights: {insight_cols[i]}"),
                        insight_cols[i].replace('_', ' ').title()
                    )
            with col2:
                if insight_cols[i+1] in df.columns:
                    display_chart_in_container(
                        create_bar_chart(df, insight_cols[i+1], f"Insights: {insight_cols[i+1]}"),
                        insight_cols[i+1].replace('_', ' ').title()
                    )
        else:
            if insight_cols[i] in df.columns:
                display_chart_in_container(
                    create_bar_chart(df, insight_cols[i], f"Insights: {insight_cols[i]}"),
                    insight_cols[i].replace('_', ' ').title()
                )

if __name__ == "__main__":
    main()
