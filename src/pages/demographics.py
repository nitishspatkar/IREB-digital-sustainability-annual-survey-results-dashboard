"""Demographics page module."""

import pandas as pd
import dash_bootstrap_components as dbc
from dash import html

from src.components.charts import generate_chart, make_histogram
from src.components.layout import build_stat_card, build_chart_card
from src.utils.data_processing import process_numeric_column
from src.config import PRIMARY_COLOR, DEMOGRAPHIC_COLS

def build_demographics_page(df: pd.DataFrame) -> html.Div:
    """Build the demographics page layout."""
    # Key statistics for demographics
    most_common_age = df["Which age group do you belong to?"].value_counts().idxmax()
    
    # Convert years_of_experience to numeric with error handling
    try:
        numeric_years = process_numeric_column(df, "How many years of professional experience do you have in IT/software engineering?")
        avg_experience = round(numeric_years.mean(), 1)
    except:
        avg_experience = "N/A"
    
    total_respondents = len(df)
    num_countries = df["What is your current country of residence?"].nunique()
    
    # Top row - Key statistics
    stats_row = dbc.Row([
        dbc.Col(build_stat_card(
            "Total Respondents",
            str(total_respondents),
            "bi-people-fill"
        ), width=3, className="px-2"),
        dbc.Col(build_stat_card(
            "Avg. Years Experience",
            str(avg_experience),
            "bi-briefcase-fill"
        ), width=3, className="px-2"),
        dbc.Col(build_stat_card(
            "Most Common Age Group",
            most_common_age,
            "bi-person-fill"
        ), width=3, className="px-2"),
        dbc.Col(build_stat_card(
            "Countries Represented",
            str(num_countries),
            "bi-globe"
        ), width=3, className="px-2")
    ], className="mb-5 g-4")
    
    # Create charts with appropriate visualization types
    age_fig = generate_chart(df, "Which age group do you belong to?", "", 'bar_h')
    experience_fig = make_histogram(df, "How many years of professional experience do you have in IT/software engineering?", "", kde=True)
    
    # Try map first, fallback to horizontal bar if issues
    try:
        geo_fig = generate_chart(df, "What is your current country of residence?", "", 'map')
    except:
        geo_fig = generate_chart(df, "What is your current country of residence?", "", 'bar_h')
    
    role_fig = generate_chart(df, "Which of the following best describes your current role in the organization?", "", 'donut')
    org_fig = generate_chart(df, "Which of the following organizational types best describes your organization?", "", 'donut')
    domain_fig = generate_chart(df, "In which application domain do you currently primarily work?", "", 'bar_h')
    
    # Charts rows
    row1 = dbc.Row([
        build_chart_card("Age Group", age_fig, 6),
        build_chart_card("Years of Experience", experience_fig, 6)
    ], className="mb-5 g-3")
    
    row2 = dbc.Row([
        build_chart_card("Geographic Distribution", geo_fig, 12)
    ], className="mb-5 g-3")
    
    # Split pie charts into separate rows for better visibility with legends
    row3 = dbc.Row([
        build_chart_card("Professional Role", role_fig, 12)
    ], className="mb-5 g-4")
    
    row4 = dbc.Row([
        build_chart_card("Organization Type", org_fig, 12)
    ], className="mb-5 g-4")
    
    row5 = dbc.Row([
        build_chart_card("Application Domain", domain_fig, 12)
    ], className="mb-5 g-3")
    
    # Page title style
    page_title_style = {
        "color": PRIMARY_COLOR,
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }
    
    return html.Div([
        html.H3("Demographic Profile", className="mb-4 pt-3", style=page_title_style),
        stats_row,
        row1,
        row2,
        row3,
        row4,
        row5
    ]) 