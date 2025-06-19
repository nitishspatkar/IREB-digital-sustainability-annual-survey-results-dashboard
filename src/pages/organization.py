"""Organization page module."""

import pandas as pd
import dash_bootstrap_components as dbc
from dash import html
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from rename_config import rename_mapping

from src.components.charts import (
    generate_chart,
    make_donut_chart,
    make_multi_select_bar
)
from dashboard_components import build_chart_card, build_stat_card
from src.config import (
    PRIMARY_COLOR,
    ORGANIZATION_COLS,
    ORG_MULTI_TRAINING,
    ORG_MULTI_DIMENSIONS
)

# Build reverse mapping from short name to original question
reverse_mapping = {v: k for k, v in rename_mapping.items()}

def build_organization_page(df: pd.DataFrame) -> html.Div:
    """Build the organization page layout."""
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
    
    # Top row - Key statistics
    stats_row = dbc.Row([
        dbc.Col(build_stat_card(
            "Have Sustainability Goals",
            f"{goals_pct}%",
            "bi-bullseye"
        ), width=3, className="px-2"),
        dbc.Col(build_stat_card(
            "Have CSR Team",
            f"{csr_pct}%",
            "bi-people-fill"
        ), width=3, className="px-2"),
        dbc.Col(build_stat_card(
            "Incorporate Practices",
            f"{practices_pct}%",
            "bi-check-circle-fill"
        ), width=3, className="px-2"),
        dbc.Col(build_stat_card(
            "Cross-Dept Coordination",
            f"{coordination_pct}%",
            "bi-diagram-3-fill"
        ), width=3, className="px-2")
    ], className="mb-5 g-4")
    
    # Create charts
    goals_fig = generate_chart(df, goals_col, "", 'donut')
    csr_fig = generate_chart(df, csr_col, "", 'donut')
    practices_fig = generate_chart(df, practices_col, "", 'donut')
    coordination_fig = generate_chart(df, coordination_col, "", 'donut')
    
    # Create rows for pie charts (2 per row)
    row1 = dbc.Row([
        build_chart_card(reverse_mapping.get(goals_col, "Sustainability Goals"), goals_fig, 6),
        build_chart_card(reverse_mapping.get(csr_col, "CSR Team"), csr_fig, 6)
    ], className="mb-5 g-3")
    
    row2 = dbc.Row([
        build_chart_card(reverse_mapping.get(practices_col, "Sustainable Practices"), practices_fig, 6),
        build_chart_card(reverse_mapping.get(coordination_col, "Cross-Department Coordination"), coordination_fig, 6)
    ], className="mb-5 g-3")
    
    # Calculate percentage for each dimension using found columns
    dim_data = pd.DataFrame({
        'Dimension': [
            'Environmental',
            'Social',
            'Individual',
            'Economic',
            'Technical'
        ],
        'Percentage': [
            (df[col].value_counts().get("Selected", 0) / total_orgs) * 100
            for col in dimension_cols
        ]
    })
    
    # Create horizontal bar chart for dimensions
    dim_fig = generate_chart(dim_data, 'Dimension', 'Percentage', 'bar_h')
    
    # Bar charts in two columns (currently only one, but future-proof)
    bar_charts = [
        (reverse_mapping.get(dimension_cols[0], "Sustainability Dimensions Considered") if dimension_cols else "Sustainability Dimensions Considered", dim_fig)
    ]
    bar_rows = []
    for i in range(0, len(bar_charts), 2):
        row = dbc.Row([
            build_chart_card(bar_charts[i][0], bar_charts[i][1], 6),
            build_chart_card(bar_charts[i+1][0], bar_charts[i+1][1], 6) if i+1 < len(bar_charts) else None
        ], className="mb-5 g-3")
        bar_rows.append(row)
    
    # Page title style
    page_title_style = {
        "color": PRIMARY_COLOR,
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }
    
    return html.Div([
        html.H3("Organization Profile", className="mb-4 pt-3", style=page_title_style),
        stats_row,
        row1,
        row2,
        *bar_rows
    ]) 