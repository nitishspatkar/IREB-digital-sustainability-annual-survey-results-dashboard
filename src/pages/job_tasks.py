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
    
    # Multi-select sections with headers
    section_header_style = {
        "color": PRIMARY_COLOR,
        "margin-top": "2rem",
        "margin-bottom": "1.5rem",
        "font-size": "1.5rem",
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }
    
    # Drivers and Barriers section
    drivers_barriers_section = html.Div([
        html.H4("Drivers and Barriers", style=section_header_style),
        html.P(
            "Explore what motivates and hinders professionals in incorporating sustainability practices.",
            className="mb-4",
            style={"color": "#666"}
        ),
        dbc.Row([
            build_chart_card(
                "Drivers for Sustainability",
                drivers_fig,
                12
            )
        ], className="mb-5 g-4"),
        dbc.Row([
            build_chart_card(
                "Barriers to Implementation",
                hindrances_fig,
                12
            )
        ], className="mb-5 g-4")
    ])
    
    # Knowledge and Support section
    knowledge_support_section = html.Div([
        html.H4("Knowledge Gaps and Support Needs", style=section_header_style),
        html.P(
            "Identify areas where professionals need more knowledge and support.",
            className="mb-4",
            style={"color": "#666"}
        ),
        dbc.Row([
            build_chart_card(
                "Knowledge Gaps",
                knowledge_fig,
                12
            )
        ], className="mb-5 g-4"),
        dbc.Row([
            build_chart_card(
                "Support Needs",
                support_fig,
                12
            )
        ], className="mb-5 g-4")
    ])
    
    # Page title style
    page_title_style = {
        "color": PRIMARY_COLOR,
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }
    
    return html.Div([
        html.H3("Digital Sustainability in Your Daily Work", className="mb-4 pt-3", style=page_title_style),
        stats_row,
        row1,
        drivers_barriers_section,
        knowledge_support_section
    ]) 