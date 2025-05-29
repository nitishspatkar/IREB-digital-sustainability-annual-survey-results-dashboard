"""Organization page module."""

import pandas as pd
import dash_bootstrap_components as dbc
from dash import html, dcc

from src.components.charts import (
    generate_chart,
    make_donut_chart,
    make_multi_select_bar
)
from src.components.layout import build_stat_card, build_chart_card
from src.config import (
    PRIMARY_COLOR,
    ORGANIZATION_COLS,
    ORG_MULTI_TRAINING,
    ORG_MULTI_DIMENSIONS
)

def build_organization_page(df: pd.DataFrame) -> html.Div:
    """Build the organization page layout."""
    # Calculate key statistics
    goals_col = "Does your organization have specific digital sustainability goals or benchmarks for software development projects?"
    has_sustainability_goals = df[goals_col].value_counts().get("Yes", 0)
    total_goals_responses = df[goals_col].notna().sum()
    goals_percentage = round((has_sustainability_goals / total_goals_responses * 100) if total_goals_responses > 0 else 0)
    
    csr_col = "Does your organization have a dedicated sustainability or Corporate Social Responsibility (CSR) expert, team or department?"
    has_csr_team = df[csr_col].value_counts().get("Yes", 0)
    total_csr_responses = df[csr_col].notna().sum()
    csr_percentage = round((has_csr_team / total_csr_responses * 100) if total_csr_responses > 0 else 0)
    
    training_col = "Does your organization offer training or resources to employees on sustainable software development practices?"
    offers_training = df[training_col].value_counts().get("Yes", 0)
    total_training_responses = df[training_col].notna().sum()
    training_percentage = round((offers_training / total_training_responses * 100) if total_training_responses > 0 else 0)
    
    # Top statistics row
    stats_row = dbc.Row([
        dbc.Col(build_stat_card(
            "Have Sustainability Goals",
            f"{goals_percentage}%",
            "bi-bullseye",
            subtitle=f"{has_sustainability_goals} out of {total_goals_responses}"
        ), width=4, className="px-2"),
        dbc.Col(build_stat_card(
            "Have CSR/Sustainability Team",
            f"{csr_percentage}%",
            "bi-people-fill",
            subtitle=f"{has_csr_team} out of {total_csr_responses}"
        ), width=4, className="px-2"),
        dbc.Col(build_stat_card(
            "Offer Sustainability Training",
            f"{training_percentage}%",
            "bi-mortarboard-fill",
            subtitle=f"{offers_training} out of {total_training_responses}"
        ), width=4, className="px-2"),
    ], className="mb-5 g-4")
    
    # Create visualizations
    goals_fig = make_donut_chart(df, goals_col, "")
    csr_fig = make_donut_chart(df, csr_col, "")
    incorporation_fig = make_donut_chart(df, "Does your organization incorporate sustainable development practices?", "")
    coordination_fig = generate_chart(df, "Do different departments in your organization coordinate on sustainability for software development projects?", "", 'bar_h')
    reports_fig = make_donut_chart(df, "Does your organization report on sustainability practices?", "")
    offers_training_fig = make_donut_chart(df, training_col, "")
    customer_requires_fig = make_donut_chart(df, "How often is the sustainability of your digital solutions an explicit requirement of the customer or the users?", "")
    
    # Multi-select figures
    no_training_reasons_fig = make_multi_select_bar(df, ORG_MULTI_TRAINING, "")
    dimensions_fig = make_multi_select_bar(df, ORG_MULTI_DIMENSIONS, "")
    
    # First row of charts - 3 key yes/no questions
    row1 = dbc.Row([
        build_chart_card(
            "Does your organization have specific digital sustainability goals?",
            goals_fig,
            4
        ),
        build_chart_card(
            "Does your organization have a CSR/sustainability expert or team?",
            csr_fig,
            4
        ),
        build_chart_card(
            "Does your organization incorporate sustainability in projects?",
            incorporation_fig,
            4
        )
    ], className="mb-5 g-4")
    
    # Second row of charts - coordination and reporting
    row2 = dbc.Row([
        build_chart_card(
            "Is there coordination on sustainability for development projects?",
            coordination_fig,
            6
        ),
        build_chart_card(
            "Does your organization report on sustainability efforts?",
            reports_fig,
            6
        )
    ], className="mb-5 g-4")
    
    # Third row of charts - training and customer requirements
    row3 = dbc.Row([
        build_chart_card(
            "Does your organization offer sustainability training?",
            offers_training_fig,
            6
        ),
        build_chart_card(
            "Do customers require sustainability considerations?",
            customer_requires_fig,
            6
        )
    ], className="mb-5 g-4")
    
    # Section header style
    section_header_style = {
        "color": PRIMARY_COLOR,
        "margin-top": "2rem",
        "margin-bottom": "1.5rem",
        "font-size": "1.5rem",
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }
    
    # Fourth row - Multi-select data with enhanced visibility
    dimensions_section = html.Div([
        html.H4("Sustainability Dimensions in Software Development", style=section_header_style),
        html.P(
            "Explore which aspects of sustainability (environmental, social, individual, economic, and technical) "
            "are actively considered in organizations' software development projects.",
            className="mb-4",
            style={"color": "#666"}
        ),
        dbc.Row([
            dbc.Col([
                html.Div([
                    html.H5("🎯 Dimensions Currently Considered", 
                           className="mb-3", 
                           style={"color": PRIMARY_COLOR}),
                    dcc.Graph(figure=dimensions_fig, config={'displayModeBar': False})
                ], style={"background-color": "white", "padding": "20px", "border-radius": "10px", "box-shadow": "0 2px 4px rgba(0,0,0,0.1)"})
            ], width=6, className="mb-5"),
            dbc.Col([
                html.Div([
                    html.H5("❓ Why Organizations Don't Offer Training", 
                           className="mb-3", 
                           style={"color": PRIMARY_COLOR}),
                    dcc.Graph(figure=no_training_reasons_fig, config={'displayModeBar': False})
                ], style={"background-color": "white", "padding": "20px", "border-radius": "10px", "box-shadow": "0 2px 4px rgba(0,0,0,0.1)"})
            ], width=6, className="mb-5")
        ], className="mb-5")
    ])
    
    # Page title style
    page_title_style = {
        "color": PRIMARY_COLOR,
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }
    
    return html.Div([
        html.H3("The Role of Digital Sustainability in Your Organization", className="mb-4 pt-3", style=page_title_style),
        stats_row,
        row1,
        row2,
        row3,
        dimensions_section
    ]) 