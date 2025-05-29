"""Job Tasks page module."""

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
    JOB_TASK_COLS,
    JOB_TASK_MULTI_DRIVES,
    JOB_TASK_MULTI_HINDER,
    JOB_TASK_MULTI_KNOWLEDGE,
    JOB_TASK_MULTI_SUPPORT
)

def build_job_tasks_page(df: pd.DataFrame) -> html.Div:
    """Build the job tasks page layout."""
    # Calculate key statistics
    tasks_col = "Do you incorporate digital sustainability considerations in your role-specific tasks?"
    incorporates_in_tasks = df[tasks_col].value_counts().get("Yes", 0)
    total_tasks_responses = df[tasks_col].notna().sum()
    incorporate_percentage = round((incorporates_in_tasks / total_tasks_responses * 100) if total_tasks_responses > 0 else 0)
    
    tools_col = "Are there specific tools, software, or frameworks that help you incorporate sustainability into your tasks? (E.g., gathering and managing requirements, writing sustainability-focused tests, optimizing code for less energy consumption.)"
    uses_tools = df[tools_col].value_counts().get("Yes", 0)
    total_tools_responses = df[tools_col].notna().sum()
    tools_percentage = round((uses_tools / total_tools_responses * 100) if total_tools_responses > 0 else 0)
    
    # Top statistics row
    stats_row = dbc.Row([
        dbc.Col(build_stat_card(
            "Incorporate Sustainability",
            f"{incorporate_percentage}%",
            "bi-check-circle-fill",
            subtitle=f"{incorporates_in_tasks} out of {total_tasks_responses}"
        ), width=6, className="px-2"),
        dbc.Col(build_stat_card(
            "Use Sustainability Tools",
            f"{tools_percentage}%",
            "bi-tools",
            subtitle=f"{uses_tools} out of {total_tools_responses}"
        ), width=6, className="px-2"),
    ], className="mb-5 g-4")
    
    # Create visualizations
    incorporate_fig = make_donut_chart(df, tasks_col, "")
    tools_fig = make_donut_chart(df, tools_col, "")
    
    # Multi-select figures
    drivers_fig = make_multi_select_bar(df, JOB_TASK_MULTI_DRIVES, "")
    hindrances_fig = make_multi_select_bar(df, JOB_TASK_MULTI_HINDER, "")
    knowledge_fig = make_multi_select_bar(df, JOB_TASK_MULTI_KNOWLEDGE, "")
    support_fig = make_multi_select_bar(df, JOB_TASK_MULTI_SUPPORT, "")
    
    # First row of charts - two main questions
    row1 = dbc.Row([
        build_chart_card(
            "Do you incorporate sustainability in your tasks?",
            incorporate_fig,
            6
        ),
        build_chart_card(
            "Do you use specific tools for sustainability?",
            tools_fig,
            6
        )
    ], className="mb-5 g-4")
    
    # Multi-select sections
    row2 = dbc.Row([
        dbc.Col([
            html.H4("What drives you to incorporate sustainability?", className="mt-4 mb-3", style={"color": PRIMARY_COLOR}),
            dcc.Graph(figure=drivers_fig, config={'displayModeBar': False})
        ], width=12, className="mb-4")
    ], className="mb-5")
    
    row3 = dbc.Row([
        dbc.Col([
            html.H4("What hinders incorporating sustainability in your tasks?", className="mt-4 mb-3", style={"color": PRIMARY_COLOR}),
            dcc.Graph(figure=hindrances_fig, config={'displayModeBar': False})
        ], width=12, className="mb-4")
    ], className="mb-5")
    
    row4 = dbc.Row([
        dbc.Col([
            html.H4("In which areas do you lack knowledge?", className="mt-4 mb-3", style={"color": PRIMARY_COLOR}),
            dcc.Graph(figure=knowledge_fig, config={'displayModeBar': False})
        ], width=12, className="mb-4")
    ], className="mb-5")
    
    row5 = dbc.Row([
        dbc.Col([
            html.H4("What support or resources do you need?", className="mt-4 mb-3", style={"color": PRIMARY_COLOR}),
            dcc.Graph(figure=support_fig, config={'displayModeBar': False})
        ], width=12, className="mb-4")
    ], className="mb-5")
    
    # Page title style
    page_title_style = {
        "color": PRIMARY_COLOR,
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }
    
    return html.Div([
        html.H3("Sustainability in Your Job and Tasks", className="mb-4 pt-3", style=page_title_style),
        stats_row,
        row1,
        row2,
        row3,
        row4,
        row5
    ]) 