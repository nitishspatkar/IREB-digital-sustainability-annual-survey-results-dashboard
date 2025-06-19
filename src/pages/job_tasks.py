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
from dashboard_components import build_stat_card, build_chart_card
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

def build_job_tasks_page(df: pd.DataFrame) -> html.Div:
    """Build the job tasks page layout."""
    # Calculate key statistics
    tasks_col = "incorporate_sustainability_in_tasks"
    incorporates_in_tasks = df[tasks_col].value_counts().get("Yes", 0)
    total_tasks_responses = df[tasks_col].notna().sum()
    incorporate_percentage = round((incorporates_in_tasks / total_tasks_responses * 100) if total_tasks_responses > 0 else 0)
    
    tools_col = "tools_for_sustainability"
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
    
    # Bar charts in two columns (donut and multi-select bar charts)
    bar_charts = [
        (reverse_mapping.get(tasks_col, tasks_col), incorporate_fig),
        (reverse_mapping.get(tools_col, tools_col), tools_fig),
        (reverse_mapping.get(JOB_TASK_MULTI_DRIVES[0], "Drivers for Sustainability"), drivers_fig),
        (reverse_mapping.get(JOB_TASK_MULTI_HINDER[0], "Barriers to Implementation"), hindrances_fig),
        (reverse_mapping.get(JOB_TASK_MULTI_KNOWLEDGE[0], "Knowledge Gaps"), knowledge_fig),
        (reverse_mapping.get(JOB_TASK_MULTI_SUPPORT[0], "Support Needs"), support_fig)
    ]
    bar_rows = []
    for i in range(0, len(bar_charts), 2):
        row = dbc.Row([
            build_chart_card(bar_charts[i][0], bar_charts[i][1], 6),
            build_chart_card(bar_charts[i+1][0], bar_charts[i+1][1], 6) if i+1 < len(bar_charts) else None
        ], className="mb-5 g-4")
        bar_rows.append(row)

    # Section headers
    section_header_style = {
        "color": PRIMARY_COLOR,
        "margin-top": "2rem",
        "margin-bottom": "1.5rem",
        "font-size": "1.5rem",
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }
    
    # Page title style
    page_title_style = {
        "color": PRIMARY_COLOR,
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }
    
    return html.Div([
        html.H3("Digital Sustainability in Your Daily Work", className="mb-4 pt-3", style=page_title_style),
        stats_row,
        *bar_rows
    ]) 