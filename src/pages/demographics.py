"""Demographics page module."""

import pandas as pd
import dash_bootstrap_components as dbc
from dash import html
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from rename_config import rename_mapping

from src.components.charts import generate_chart, make_histogram
from dashboard_components import build_chart_card, build_stat_card
from src.utils.data_processing import process_numeric_column
from src.config import PRIMARY_COLOR, DEMOGRAPHIC_COLS

# Build reverse mapping from short name to original question
reverse_mapping = {v: k for k, v in rename_mapping.items()}

def build_demographics_page(df: pd.DataFrame) -> html.Div:
    """Build the demographics page layout."""
    # Key statistics for demographics
    most_common_age = df["age_group"].value_counts().idxmax()
    
    # Convert years_of_experience to numeric with error handling
    try:
        numeric_years = process_numeric_column(df, "years_of_experience")
        avg_experience = round(numeric_years.mean(), 1)
    except:
        avg_experience = "N/A"
    
    total_respondents = len(df)
    num_countries = df["country_residence_1"].nunique()
    
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
    age_fig = generate_chart(df, "age_group", "", 'bar_h')
    experience_fig = generate_chart(df, "years_of_experience", "", 'bar_h')
    
    # Try map first, fallback to horizontal bar if issues
    try:
        geo_fig = generate_chart(df, "country_residence_1", "", 'map')
    except:
        geo_fig = generate_chart(df, "country_residence_1", "", 'bar_h')
    
    role_fig = generate_chart(df, "role", "", 'donut')
    org_fig = generate_chart(df, "organization_type", "", 'donut')
    domain_fig = generate_chart(df, "application_domain", "", 'bar_h')
    
    # Charts rows
    bar_charts = [
        (reverse_mapping.get("age_group", "Age Group"), age_fig),
        (reverse_mapping.get("years_of_experience", "Years of Experience"), experience_fig),
        (reverse_mapping.get("application_domain", "Application Domain"), domain_fig),
    ]
    # If geo_fig is a bar chart (fallback), include it in bar_charts
    if not (hasattr(geo_fig.layout, "geo") and geo_fig.layout.geo is not None):
        bar_charts.insert(2, (reverse_mapping.get("country_residence_1", "Geographic Distribution"), geo_fig))
        row2 = None
    else:
        row2 = dbc.Row([
            build_chart_card(reverse_mapping.get("country_residence_1", "Geographic Distribution"), geo_fig, 12)
        ], className="mb-5 g-3")

    # Render bar charts in two columns
    bar_rows = []
    for i in range(0, len(bar_charts), 2):
        row = dbc.Row([
            build_chart_card(bar_charts[i][0], bar_charts[i][1], 6),
            build_chart_card(bar_charts[i+1][0], bar_charts[i+1][1], 6) if i+1 < len(bar_charts) else None
        ], className="mb-5 g-3")
        bar_rows.append(row)

    # Pie charts in two columns
    pie_row = dbc.Row([
        build_chart_card(reverse_mapping.get("role", "Professional Role"), role_fig, 6),
        build_chart_card(reverse_mapping.get("organization_type", "Organization Type"), org_fig, 6)
    ], className="mb-5 g-4")
    
    # Page title style
    page_title_style = {
        "color": PRIMARY_COLOR,
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }
    
    return html.Div([
        html.H3("Demographic Profile", className="mb-4 pt-3", style=page_title_style),
        stats_row,
        *bar_rows,
        *( [row2] if row2 else [] ),
        pie_row
    ]) 