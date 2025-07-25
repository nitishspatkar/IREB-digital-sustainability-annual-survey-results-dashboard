"""Demographics page module."""

import pandas as pd
import dash_bootstrap_components as dbc
from dash import html, dcc
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from rename_config import rename_mapping
from dash import dash_table

from src.components.charts import generate_chart, make_histogram
from src.components.layout import build_chart_card, build_stat_card
from src.utils.data_processing import process_numeric_column
from src.config import PRIMARY_COLOR, DEMOGRAPHIC_COLS

# Build reverse mapping from short name to original question
reverse_mapping = {v: k for k, v in rename_mapping.items()}

def build_enhanced_stat_card(title: str, value: str, icon_class: str, color_gradient: str, description: str = "") -> dbc.Col:
    """Build an enhanced stat card with gradient background and better styling."""
    return dbc.Col([
        dbc.Card([
            dbc.CardBody([
                html.Div([
                    html.Div([
                        html.I(className=f"bi {icon_class}", style={
                            "fontSize": "2.5rem",
                            "color": "white",
                            "opacity": "0.9",
                            "marginRight": "1rem"
                        })
                    ], className="stat-icon"),
                    html.Div([
                        html.H2(value, className="stat-value mb-1"),
                        html.H6(title, className="stat-title mb-0"),
                        html.Small(description, className="stat-description") if description else None
                    ], className="stat-content flex-grow-1")
                ], className="d-flex align-items-center h-100")
            ], className="p-4")
        ], className="stat-card h-100", style={
            "background": color_gradient,
            "border": "none",
            "borderRadius": "15px",
            "boxShadow": "0 8px 25px rgba(131, 30, 130, 0.15)",
            "color": "white",
            "position": "relative",
            "overflow": "hidden"
        })
    ], width=12, lg=3, md=6, className="mb-4")

def build_demographics_page(df: pd.DataFrame) -> html.Div:
    """Build the demographics page layout with enhanced UI."""
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
    
    # Enhanced stat cards with gradients
    stats_row = dbc.Row([
        build_enhanced_stat_card(
            "Total Respondents",
            str(total_respondents),
            "bi-people-fill",
            "linear-gradient(135deg, #831E82 0%, #A450A3 100%)",
            "Survey participants"
        ),
        build_enhanced_stat_card(
            "Avg. Years Experience",
            str(avg_experience),
            "bi-briefcase-fill",
            "linear-gradient(135deg, #A450A3 0%, #C581C4 100%)",
            "Professional background"
        ),
        build_enhanced_stat_card(
            "Most Common Age Group",
            most_common_age,
            "bi-person-badge-fill",
            "linear-gradient(135deg, #C581C4 0%, #E6B3E5 100%)",
            "Primary demographic"
        ),
        build_enhanced_stat_card(
            "Countries Represented",
            str(num_countries),
            "bi-globe-americas",
            "linear-gradient(135deg, #E6B3E5 0%, #831E82 100%)",
            "Global reach"
        )
    ], className="mb-5")
    
    # Create charts with appropriate visualization types
    age_fig = generate_chart(df, "age_group", "", 'bar_h')
    experience_fig = generate_chart(df, "years_of_experience", "", 'bar_h')
    domain_fig = generate_chart(df, "application_domain", "", 'bar_h')
    
    # Try map first, fallback to horizontal bar if issues
    try:
        geo_fig = generate_chart(df, "country_residence_1", "", 'map')
    except:
        geo_fig = generate_chart(df, "country_residence_1", "", 'map')
    
    # Prepare country count table for map
    country_counts = df["country_residence_1"].value_counts().reset_index()
    country_counts.columns = ["Country", "Count"]

    # Enhanced geographic section with map and table
    geographic_section = dbc.Container([
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-globe me-2"),
                            "Geographic Distribution"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dbc.Row([
                            dbc.Col([
                                html.H6("Country Statistics", className="mb-3 text-muted"),
                                dash_table.DataTable(
                                    data=country_counts.to_dict('records'),
                                    columns=[{"name": i, "id": i} for i in country_counts.columns],
                                    style_table={
                                        'height': '500px', 
                                        'overflowY': 'auto',
                                        'borderRadius': '10px'
                                    },
                                    style_cell={
                                        'fontFamily': 'inherit', 
                                        'fontSize': '14px', 
                                        'padding': '12px',
                                        'border': 'none'
                                    },
                                    style_header={
                                        'backgroundColor': '#f8f9fa', 
                                        'fontWeight': 'bold',
                                        'color': '#831E82',
                                        'border': 'none'
                                    },
                                    style_data={
                                        'backgroundColor': 'white',
                                        'border': 'none'
                                    },
                                    style_data_conditional=[
                                        {
                                            'if': {'row_index': 'odd'},
                                            'backgroundColor': '#fafbfc'
                                        }
                                    ],
                                    page_size=20
                                )
                            ], width=4),
                            dbc.Col([
                                dcc.Graph(
                                    figure=geo_fig,
                                    config={
                                        'displayModeBar': False,
                                        'responsive': True
                                    }
                                )
                            ], width=8)
                        ])
                    ], className="p-4")
                ], className="enhanced-chart-card mb-5")
            ], width=12)
        ])
    ], fluid=True)
    
    # Demographics bar charts section
    demographic_charts_section = dbc.Container([
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-bar-chart-fill me-2"),
                            reverse_mapping.get("age_group", "Age Distribution")
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=age_fig,
                            config={
                                'displayModeBar': False,
                                'responsive': True
                            }
                        )
                    ], className="p-3")
                ], className="enhanced-chart-card")
            ], width=12, lg=6, className="mb-4"),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-briefcase-fill me-2"),
                            reverse_mapping.get("years_of_experience", "Professional Experience")
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=experience_fig,
                            config={
                                'displayModeBar': False,
                                'responsive': True
                            }
                        )
                    ], className="p-3")
                ], className="enhanced-chart-card")
            ], width=12, lg=6, className="mb-4")
        ]),
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-building-fill me-2"),
                            reverse_mapping.get("application_domain", "Application Domains")
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=domain_fig,
                            config={
                                'displayModeBar': False,
                                'responsive': True
                            }
                        )
                    ], className="p-3")
                ], className="enhanced-chart-card")
            ], width=12, className="mb-5")
        ])
    ], fluid=True)

    # Role and organization charts
    role_fig = generate_chart(df, "role", "", 'donut')
    org_fig = generate_chart(df, "organization_type", "", 'donut')
    
    roles_organization_section = dbc.Container([
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-person-workspace me-2"),
                            reverse_mapping.get("role", "Professional Roles")
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=role_fig,
                            config={
                                'displayModeBar': False,
                                'responsive': True
                            }
                        )
                    ], className="p-3")
                ], className="enhanced-chart-card")
            ], width=12, lg=6, className="mb-4"),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-building-gear me-2"),
                            reverse_mapping.get("organization_type", "Organization Types")
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=org_fig,
                            config={
                                'displayModeBar': False,
                                'responsive': True
                            }
                        )
                    ], className="p-3")
                ], className="enhanced-chart-card")
            ], width=12, lg=6, className="mb-4")
        ])
    ], fluid=True)
    
    # Page title with enhanced styling
    page_header = html.Div([
        html.Div([
            html.H2([
                html.I(className="bi bi-people-fill me-3"),
                "Demographic Profile"
            ], className="page-title mb-0"),
            html.P("Comprehensive overview of survey participant demographics", 
                   className="page-subtitle mb-0")
        ], className="page-header-content")
    ], className="page-header mb-5")
    
    return html.Div([
        page_header,
        stats_row,
        geographic_section,
        demographic_charts_section,
        roles_organization_section
    ], className="demographics-page") 