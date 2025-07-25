"""General Awareness page module."""

import pandas as pd
import dash_bootstrap_components as dbc
from dash import html, dcc

from src.components.charts import generate_chart, make_donut_chart, make_histogram
from src.components.layout import build_stat_card, build_chart_card
from src.utils.data_processing import process_numeric_column
from src.config import PRIMARY_COLOR, AWARENESS_COLS
from rename_config import rename_mapping

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
    ], width=12, lg=4, md=6, className="mb-4")

def build_awareness_page(df: pd.DataFrame) -> html.Div:
    """Build the general awareness page layout with enhanced UI."""
    # Find the definition column by partial match
    definition_cols = [col for col in df.columns if "umbrella term" in col]
    if not definition_cols:
        return html.Div("Error: Could not find definition column")
    
    definition_col = definition_cols[0]
    
    # Calculate key statistics
    heard_of_def_count = df[definition_col].value_counts().get("Yes", 0)
    total_valid_responses = df[definition_col].notna().sum()
    heard_of_def_percentage = round((heard_of_def_count / total_valid_responses * 100) if total_valid_responses > 0 else 0)
    
    training_col = "participated_sustainability_training"
    training_participation = df[training_col].value_counts().get("Yes", 0)
    training_total = df[training_col].notna().sum()
    training_percentage = round((training_participation / training_total * 100) if training_total > 0 else 0)
    
    num_trainings_col = "num_sustainability_trainings"
    avg_trainings_numeric = process_numeric_column(df, num_trainings_col)
    avg_trainings = round(avg_trainings_numeric.mean(), 1) if not pd.isna(avg_trainings_numeric.mean()) else "N/A"
    
    # Enhanced stat cards with gradients
    stats_row = dbc.Row([
        build_enhanced_stat_card(
            "Familiar with Definition",
            f"{heard_of_def_percentage}%",
            "bi-lightbulb-fill",
            "linear-gradient(135deg, #831E82 0%, #A450A3 100%)",
            f"{heard_of_def_count} out of {total_valid_responses} respondents"
        ),
        build_enhanced_stat_card(
            "Training Participation",
            f"{training_percentage}%",
            "bi-book-fill",
            "linear-gradient(135deg, #A450A3 0%, #C581C4 100%)",
            f"{training_participation} out of {training_total} respondents"
        ),
        build_enhanced_stat_card(
            "Avg. Trainings Taken",
            str(avg_trainings),
            "bi-award-fill",
            "linear-gradient(135deg, #C581C4 0%, #E6B3E5 100%)",
            "Training programs attended"
        )
    ], className="mb-5")
    
    # Create visualizations with enhanced styling
    definition_fig = make_donut_chart(df, definition_col, "")
    definition_fig.update_layout(height=400)  # Set consistent height
    
    freq_discussions_fig = generate_chart(df, "frequency_sustainability_discussions", "", 'bar_h')
    freq_discussions_fig.update_layout(height=400)  # Set consistent height
    
    training_fig = make_donut_chart(df, training_col, "")
    training_fig.update_layout(height=400)  # Set consistent height
    
    satisfaction_fig = make_donut_chart(df, "satisfied_num_trainings", "")
    satisfaction_fig.update_layout(height=400)  # Set consistent height
    
    num_trainings_fig = make_histogram(df, num_trainings_col, "", bins=6)
    num_trainings_fig.update_layout(height=400)  # Set consistent height

    # Enhanced awareness and familiarity section
    awareness_section = dbc.Container([
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-lightbulb me-2"),
                            "Digital Sustainability Definition Awareness"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=definition_fig,
                            config={
                                'displayModeBar': False,
                                'responsive': True
                            }
                        )
                    ], className="p-3")
                ], className="enhanced-chart-card")
            ], width=12, lg=4, className="mb-4"),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-chat-dots me-2"),
                            "Discussion Frequency in Professional Environment"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=freq_discussions_fig,
                            config={
                                'displayModeBar': False,
                                'responsive': True
                            }
                        )
                    ], className="p-3")
                ], className="enhanced-chart-card")
            ], width=12, lg=8, className="mb-4")
        ])
    ], fluid=True)

    # Enhanced training and education section
    training_section = dbc.Container([
        # Section header
        html.Div([
            html.Div([
                html.H4([
                    html.I(className="bi bi-book me-3"),
                    "Training and Education"
                ], className="section-title mb-0"),
                html.P("Participation rates and satisfaction levels in sustainability training programs", 
                       className="section-subtitle mb-0")
            ], className="section-header-content")
        ], className="section-header mb-4"),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-mortarboard me-2"),
                            "Training Program Participation"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=training_fig,
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
                            html.I(className="bi bi-star me-2"),
                            "Training Satisfaction Levels"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=satisfaction_fig,
                            config={
                                'displayModeBar': False,
                                'responsive': True
                            }
                        )
                    ], className="p-3")
                ], className="enhanced-chart-card")
            ], width=12, lg=6, className="mb-4")
        ]),
        
        # Training frequency distribution
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-bar-chart me-2"),
                            "Distribution of Training Programs Attended"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=num_trainings_fig,
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
                html.I(className="bi bi-lightbulb-fill me-3"),
                "Awareness & Education"
            ], className="page-title mb-0"),
            html.P("Understanding awareness levels and educational engagement in digital sustainability", 
                   className="page-subtitle mb-0")
        ], className="page-header-content")
    ], className="page-header mb-5")
    
    return html.Div([
        page_header,
        stats_row,
        awareness_section,
        training_section
    ], className="awareness-page") 