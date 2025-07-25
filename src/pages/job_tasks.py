"""Job Tasks page module."""

import pandas as pd
import dash_bootstrap_components as dbc
from dash import html, dcc
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from rename_config import rename_mapping

from src.components.charts import (
    generate_chart,
    make_donut_chart,
    make_multi_select_bar
)
from src.components.layout import build_stat_card, build_chart_card
from src.config import (
    PRIMARY_COLOR,
    JOB_TASK_COLS,
    JOB_TASK_MULTI_DRIVES,
    JOB_TASK_MULTI_HINDER,
    JOB_TASK_MULTI_KNOWLEDGE,
    JOB_TASK_MULTI_SUPPORT
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
    ], width=12, lg=6, md=6, className="mb-4")

def extract_option_text(full_text: str) -> str:
    """Extract the meaningful part from multi-select option text."""
    if '[' in full_text and ']' in full_text:
        start = full_text.find('[') + 1
        end = full_text.rfind(']')
        if end == -1:
            end = len(full_text)
        option = full_text[start:end].strip()
        option = option.strip(' ]')
        return option
    return full_text

def create_enhanced_multi_bar(df: pd.DataFrame, columns: list, title: str, max_items: int = 8) -> object:
    """Create an enhanced horizontal bar chart for multi-select data with smart text handling."""
    import plotly.graph_objects as go
    
    # Calculate counts for each option
    counts = []
    total_responses = len(df)
    
    for col in columns:
        if col in df.columns:
            count = df[col].astype(str).str.strip().str.lower().eq('yes').sum()
            option_text = extract_option_text(col)
            percentage = round((count / total_responses * 100) if total_responses > 0 else 0)
            
            if count > 0:  # Only include items with responses
                counts.append({
                    'title': option_text,
                    'short_title': option_text[:60] + "..." if len(option_text) > 60 else option_text,
                    'count': count,
                    'percentage': percentage,
                    'full_text': col
                })
    
    # Sort by count descending and take top items
    counts_sorted = sorted(counts, key=lambda x: x['count'], reverse=True)
    top_items = counts_sorted[:max_items]
    
    if not top_items:
        return go.Figure()
    
    # Create the figure
    fig = go.Figure()
    
    # Add horizontal bar chart
    fig.add_trace(go.Bar(
        x=[item['count'] for item in top_items],
        y=[item['short_title'] for item in top_items],
        orientation='h',
        marker_color=PRIMARY_COLOR,
        text=[f"{item['count']} ({item['percentage']}%)" for item in top_items],
        textposition='outside',
        hovertemplate='<b>%{customdata}</b><br>' +
                      'Count: %{x}<br>' + 
                      'Percentage: %{text}<br>' +
                      '<extra></extra>',
        customdata=[item['title'] for item in top_items],  # Full text for hover
        textfont=dict(size=12)
    ))
    
    # Update layout for better readability
    fig.update_layout(
        title=None,
        yaxis_title=None,
        xaxis_title="Number of Responses",
        height=max(400, len(top_items) * 50),  # Dynamic height based on items
        margin=dict(l=20, r=60, t=20, b=40),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Helvetica", size=11),
        yaxis=dict(
            automargin=True,
            tickfont=dict(size=11)
        ),
        xaxis=dict(
            showgrid=True,
            gridwidth=1,
            gridcolor='rgba(0,0,0,0.1)'
        )
    )
    
    return fig

def build_multi_select_section(df: pd.DataFrame, columns: list, title: str, description: str, icon: str) -> html.Div:
    """Build a section with enhanced bar chart for multi-select data."""
    # Create the enhanced bar chart
    chart_fig = create_enhanced_multi_bar(df, columns, title)
    
    # Calculate summary stats
    total_responses = len(df)
    response_counts = []
    for col in columns:
        if col in df.columns:
            count = df[col].astype(str).str.strip().str.lower().eq('yes').sum()
            if count > 0:
                response_counts.append(count)
    
    top_response = max(response_counts) if response_counts else 0
    avg_response = round(sum(response_counts) / len(response_counts)) if response_counts else 0
    
    return html.Div([
        # Section header with stats
        html.Div([
            html.Div([
                html.Div([
                    html.H4([
                        html.I(className=f"bi {icon} me-3"),
                        title
                    ], className="section-title mb-0"),
                    html.P(description, className="section-subtitle mb-0")
                ], className="flex-grow-1"),
                html.Div([
                    html.Div([
                        html.Span(str(top_response), className="summary-stat-value"),
                        html.Span("top response", className="summary-stat-label")
                    ], className="summary-stat"),
                    html.Div([
                        html.Span(str(len(response_counts)), className="summary-stat-value"), 
                        html.Span("total options", className="summary-stat-label")
                    ], className="summary-stat")
                ], className="d-flex gap-3")
            ], className="d-flex align-items-center justify-content-between")
        ], className="section-header mb-4"),
        
        # Enhanced chart
        dbc.Container([
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardBody([
                            dcc.Graph(
                                figure=chart_fig,
                                config={
                                    'displayModeBar': False,
                                    'responsive': True
                                }
                            )
                        ], className="p-3")
                    ], className="enhanced-chart-card")
                ], width=12)
            ])
        ], fluid=True)
    ], className="mb-5")

def build_job_tasks_page(df: pd.DataFrame) -> html.Div:
    """Build the job tasks page layout with enhanced UI and better data visualization."""
    # Calculate key statistics
    tasks_col = "incorporate_sustainability_in_tasks"
    incorporates_in_tasks = df[tasks_col].value_counts().get("Yes", 0)
    total_tasks_responses = df[tasks_col].notna().sum()
    incorporate_percentage = round((incorporates_in_tasks / total_tasks_responses * 100) if total_tasks_responses > 0 else 0)
    
    tools_col = "tools_for_sustainability" 
    uses_tools = df[tools_col].value_counts().get("Yes", 0)
    total_tools_responses = df[tools_col].notna().sum()
    tools_percentage = round((uses_tools / total_tools_responses * 100) if total_tools_responses > 0 else 0)
    
    # Enhanced stat cards with gradients
    stats_row = dbc.Row([
        build_enhanced_stat_card(
            "Incorporate Sustainability",
            f"{incorporate_percentage}%",
            "bi-check-circle-fill",
            "linear-gradient(135deg, #831E82 0%, #A450A3 100%)",
            f"{incorporates_in_tasks} out of {total_tasks_responses} professionals"
        ),
        build_enhanced_stat_card(
            "Use Sustainability Tools",
            f"{tools_percentage}%",
            "bi-tools",
            "linear-gradient(135deg, #A450A3 0%, #C581C4 100%)",
            f"{uses_tools} out of {total_tools_responses} respondents"
        )
    ], className="mb-5")
    
    # Create donut charts with consistent heights
    incorporate_fig = make_donut_chart(df, tasks_col, "")
    incorporate_fig.update_layout(height=400)
    
    tools_fig = make_donut_chart(df, tools_col, "")
    tools_fig.update_layout(height=400)
    
    # Current practices section
    practices_section = dbc.Container([
        # Section header
        html.Div([
            html.Div([
                html.H4([
                    html.I(className="bi bi-person-workspace me-3"),
                    "Current Practices"
                ], className="section-title mb-0"),
                html.P("How professionals currently integrate sustainability into their daily work", 
                       className="section-subtitle mb-0")
            ], className="section-header-content")
        ], className="section-header mb-4"),
        
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-check-circle me-2"),
                            "Sustainability Integration in Role-Specific Tasks"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=incorporate_fig,
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
                            html.I(className="bi bi-tools me-2"),
                            "Use of Sustainability Tools & Frameworks"
                        ], className="mb-0 text-white")
                    ], className="enhanced-card-header"),
                    dbc.CardBody([
                        dcc.Graph(
                            figure=tools_fig,
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
    
    # Build multi-select sections with custom card layouts
    drivers_section = build_multi_select_section(
        df, JOB_TASK_MULTI_DRIVES,
        "Drivers for Sustainability",
        "What motivates professionals to incorporate sustainability practices",
        "bi-arrow-up-circle"
    )
    
    barriers_section = build_multi_select_section(
        df, JOB_TASK_MULTI_HINDER,
        "Barriers to Implementation", 
        "Challenges that prevent sustainability integration in daily work",
        "bi-exclamation-triangle"
    )
    
    knowledge_section = build_multi_select_section(
        df, JOB_TASK_MULTI_KNOWLEDGE,
        "Knowledge Gaps",
        "Areas where professionals feel they lack sufficient knowledge or tools",
        "bi-question-circle"
    )
    
    support_section = build_multi_select_section(
        df, JOB_TASK_MULTI_SUPPORT,
        "Support Needs",
        "Additional resources that would help integrate sustainability into work",
        "bi-life-preserver"
    )
    
    # Enhanced page header
    page_header = html.Div([
        html.Div([
            html.H2([
                html.I(className="bi bi-person-workspace me-3"),
                "Job Tasks & Daily Work"
            ], className="page-title mb-0"),
            html.P("How digital sustainability is integrated into professional roles and daily responsibilities", 
                   className="page-subtitle mb-0")
        ], className="page-header-content")
    ], className="page-header mb-5")
    
    return html.Div([
        page_header,
        stats_row,
        practices_section,
        drivers_section,
        barriers_section,
        knowledge_section,
        support_section
    ], className="job-tasks-page") 