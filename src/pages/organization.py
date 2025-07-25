"""Organization page module."""

import pandas as pd
import dash_bootstrap_components as dbc
from dash import html, dcc
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from rename_config import rename_mapping
import plotly.express as px
from src.config import (
    PRIMARY_COLOR,
    ORGANIZATION_COLS,
    ORG_MULTI_TRAINING,
    ORG_MULTI_DIMENSIONS,
    STYLE_VARS
)
from src.components.layout import build_chart_card, build_stat_card
from src.components.charts import (
    generate_chart,
    make_donut_chart,
    make_multi_select_bar
)

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

def build_organization_page(df: pd.DataFrame) -> html.Div:
    """Build the organization page layout with enhanced UI and logical content organization."""
    # Find dimension columns by partial match
    dimension_cols = [col for col in df.columns if "dimensions of sustainability" in col and any(dim in col for dim in ["Environmental", "Social", "Individual", "Economic", "Technical"])]
    
    # Define column names
    goals_col = "org_sustainability_goals"
    csr_col = "org_csr_expert_team"
    practices_col = "org_incorporates_sustainability"
    coordination_col = "org_coordination_on_sustainability"
    
    # Calculate statistics
    total_orgs = len(df)
    has_sustainability_goals = df[goals_col].value_counts().get("Yes", 0)
    has_csr_team = df[csr_col].value_counts().get("Yes", 0)
    has_practices = df[practices_col].value_counts().get("Yes", 0)
    has_coordination = df[coordination_col].value_counts().get("Yes", 0)
    
    # Calculate percentages
    goals_pct = round((has_sustainability_goals / total_orgs) * 100)
    csr_pct = round((has_csr_team / total_orgs) * 100)
    practices_pct = round((has_practices / total_orgs) * 100)
    coordination_pct = round((has_coordination / total_orgs) * 100)
    
    # Enhanced stat cards with gradients
    stats_row = dbc.Row([
        build_enhanced_stat_card(
            "Have Sustainability Goals",
            f"{goals_pct}%",
            "bi-bullseye",
            "linear-gradient(135deg, #831E82 0%, #A450A3 100%)",
            f"{has_sustainability_goals} out of {total_orgs} organizations"
        ),
        build_enhanced_stat_card(
            "Have CSR Team",
            f"{csr_pct}%",
            "bi-people-fill",
            "linear-gradient(135deg, #A450A3 0%, #C581C4 100%)",
            f"{has_csr_team} organizations with dedicated teams"
        ),
        build_enhanced_stat_card(
            "Incorporate Practices",
            f"{practices_pct}%",
            "bi-check-circle-fill",
            "linear-gradient(135deg, #C581C4 0%, #E6B3E5 100%)",
            f"{has_practices} actively implementing practices"
        ),
        build_enhanced_stat_card(
            "Cross-Dept Coordination",
            f"{coordination_pct}%",
            "bi-diagram-3-fill",
            "linear-gradient(135deg, #E6B3E5 0%, #831E82 100%)",
            f"{has_coordination} with coordinated efforts"
        )
    ], className="mb-5")
    
    # Create charts with consistent heights
    goals_fig = generate_chart(df, goals_col, "", 'donut')
    goals_fig.update_layout(height=400)
    
    csr_fig = generate_chart(df, csr_col, "", 'donut')
    csr_fig.update_layout(height=400)
    
    practices_fig = generate_chart(df, practices_col, "", 'donut')
    practices_fig.update_layout(height=400)
    
    coordination_fig = generate_chart(df, coordination_col, "", 'donut')
    coordination_fig.update_layout(height=400)
    
    # Organizational Structure Section
    structure_section = dbc.Container([
        # Section header
        html.Div([
            html.Div([
                html.H4([
                    html.I(className="bi bi-building me-3"),
                    "Organizational Structure"
                ], className="section-title mb-0"),
                html.P("Sustainability teams, goals, and organizational frameworks", 
                       className="section-subtitle mb-0")
            ], className="section-header-content")
        ], className="section-header mb-4"),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-bullseye me-2"),
                            "Digital Sustainability Goals & Benchmarks"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=goals_fig,
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
                            html.I(className="bi bi-people me-2"),
                            "Dedicated CSR Expert/Team"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=csr_fig,
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

    # Implementation & Practices Section  
    implementation_section = dbc.Container([
        # Section header
        html.Div([
            html.Div([
                html.H4([
                    html.I(className="bi bi-gear me-3"),
                    "Implementation & Practices"
                ], className="section-title mb-0"),
                html.P("Sustainable development practices and cross-departmental coordination", 
                       className="section-subtitle mb-0")
            ], className="section-header-content")
        ], className="section-header mb-4"),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-check-circle me-2"),
                            "Sustainable Development Practices"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=practices_fig,
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
                            html.I(className="bi bi-diagram-3 me-2"),
                            "Cross-Department Coordination"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=coordination_fig,
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

    # Sustainability Dimensions Section
    # Calculate count for each dimension using found columns
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
    dim_fig = px.bar(
        dim_data,
        y='Dimension',
        x='Count',
        orientation='h',
        template="plotly_white",
        color_discrete_sequence=[PRIMARY_COLOR]
    )
    dim_fig.update_traces(
        hovertemplate='<b>%{y}</b><br>Count: %{x}<extra></extra>',
        text=dim_data["Count"],
        textposition='outside',
        textfont=dict(size=STYLE_VARS["FONT_SIZE"] + 4)
    )
    dim_fig.update_layout(
        title=None,
        yaxis_title=None,
        xaxis_title="Count",
        height=400,  # Consistent height
        margin=dict(l=10, r=10, t=30, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(
            family=STYLE_VARS["FONT_FAMILY"],
            size=STYLE_VARS["FONT_SIZE"] + 4
        )
    )

    dimensions_section = dbc.Container([
        # Section header
        html.Div([
            html.Div([
                html.H4([
                    html.I(className="bi bi-layers me-3"),
                    "Sustainability Dimensions"
                ], className="section-title mb-0"),
                html.P("Active consideration of different sustainability aspects in software development", 
                       className="section-subtitle mb-0")
            ], className="section-header-content")
        ], className="section-header mb-4"),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-bar-chart me-2"),
                            "Sustainability Dimensions in Software Development Projects"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=dim_fig,
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
    
    # Enhanced page header
    page_header = html.Div([
        html.Div([
            html.H2([
                html.I(className="bi bi-building-fill me-3"),
                "Organization Profile"
            ], className="page-title mb-0"),
            html.P("Organizational sustainability structure, practices, and implementation approaches", 
                   className="page-subtitle mb-0")
        ], className="page-header-content")
    ], className="page-header mb-5")
    
    return html.Div([
        page_header,
        stats_row,
        structure_section,
        implementation_section,
        dimensions_section
    ], className="organization-page") 