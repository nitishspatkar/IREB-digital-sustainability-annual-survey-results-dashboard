"""Insights page module for cross-question analysis."""

import pandas as pd
import dash_bootstrap_components as dbc
from dash import html
import plotly.express as px
import plotly.graph_objects as go

from src.components.charts import (
    generate_chart,
    make_donut_chart,
    make_multi_select_bar,
    make_bar_chart,
    create_no_data_figure
)
from src.components.layout import build_stat_card, build_chart_card
from src.config import PRIMARY_COLOR

def create_awareness_implementation_chart(df: pd.DataFrame) -> go.Figure:
    """Create a chart showing relationship between definition awareness and implementation."""
    # Find awareness column by partial match
    awareness_cols = [col for col in df.columns if "umbrella term" in col]
    if not awareness_cols:
        return create_no_data_figure("Could not find definition awareness column")
    
    # Use the first matching column
    awareness_col = awareness_cols[0]
    implementation_col = "Does your organization incorporate sustainable development practices?"
    
    # Create contingency table
    contingency = pd.crosstab(
        df[awareness_col],
        df[implementation_col],
        normalize='index'
    ) * 100  # Convert to percentages
    
    # Create grouped bar chart
    fig = go.Figure()
    
    for implementation_status in contingency.columns:
        fig.add_trace(go.Bar(
            name=implementation_status,
            x=contingency.index,
            y=contingency[implementation_status],
            text=[f"{val:.1f}%" for val in contingency[implementation_status]],
            textposition='auto',
        ))
    
    fig.update_layout(
        barmode='group',
        title="Relationship between Definition Awareness and Implementation",
        xaxis_title="Familiar with Digital Sustainability Definition",
        yaxis_title="Percentage",
        showlegend=True,
        legend_title="Implementation Status",
        template="plotly_white"
    )
    
    return fig

def create_training_implementation_chart(df: pd.DataFrame) -> go.Figure:
    """Create a chart showing relationship between training participation and implementation."""
    # Cross-tabulate training participation with implementation
    training_col = "Have you participated in one or more training or educational programs on digital sustainability?"
    implementation_col = "Does your organization incorporate sustainable development practices?"
    
    # Create contingency table
    contingency = pd.crosstab(
        df[training_col],
        df[implementation_col],
        normalize='index'
    ) * 100  # Convert to percentages
    
    # Create grouped bar chart
    fig = go.Figure()
    
    for implementation_status in contingency.columns:
        fig.add_trace(go.Bar(
            name=implementation_status,
            x=contingency.index,
            y=contingency[implementation_status],
            text=[f"{val:.1f}%" for val in contingency[implementation_status]],
            textposition='auto',
        ))
    
    fig.update_layout(
        barmode='group',
        title="Relationship between Training Participation and Implementation",
        xaxis_title="Participated in Sustainability Training",
        yaxis_title="Percentage",
        showlegend=True,
        legend_title="Implementation Status",
        template="plotly_white"
    )
    
    return fig

def create_discussion_implementation_chart(df: pd.DataFrame) -> go.Figure:
    """Create a chart showing relationship between discussion frequency and implementation."""
    # Cross-tabulate discussion frequency with implementation
    discussion_col = "How frequently do you encounter (e.g., coming across or taking part in) discussions about digital sustainability in your professional environment?"
    implementation_col = "Does your organization incorporate sustainable development practices?"
    
    # Create contingency table
    contingency = pd.crosstab(
        df[discussion_col],
        df[implementation_col],
        normalize='index'
    ) * 100  # Convert to percentages
    
    # Create grouped bar chart
    fig = go.Figure()
    
    for implementation_status in contingency.columns:
        fig.add_trace(go.Bar(
            name=implementation_status,
            x=contingency.index,
            y=contingency[implementation_status],
            text=[f"{val:.1f}%" for val in contingency[implementation_status]],
            textposition='auto',
        ))
    
    fig.update_layout(
        barmode='group',
        title="Relationship between Discussion Frequency and Implementation",
        xaxis_title="Frequency of Sustainability Discussions",
        yaxis_title="Percentage",
        showlegend=True,
        legend_title="Implementation Status",
        template="plotly_white"
    )
    
    return fig

def build_insights_page(df: pd.DataFrame) -> html.Div:
    """Build the insights page layout with cross-question analysis."""
    
    # Debug: Print all column names
    print("\nAvailable columns in DataFrame:")
    for i, col in enumerate(df.columns):
        print(f"{i+1}. {repr(col)}")
    
    # Find awareness column by partial match
    awareness_cols = [col for col in df.columns if "umbrella term" in col]
    print("\nFound awareness columns:")
    for col in awareness_cols:
        print(repr(col))
    
    if not awareness_cols:
        return html.Div("Error: Could not find the definition awareness column. Please check the data.")
    
    # Use the first matching column
    awareness_col = awareness_cols[0]
    implementation_col = "Does your organization incorporate sustainable development practices?"
    
    # Page title style
    page_title_style = {
        "color": PRIMARY_COLOR,
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }
    
    # Section header style
    section_header_style = {
        "color": PRIMARY_COLOR,
        "margin-top": "2rem",
        "margin-bottom": "1.5rem",
        "font-size": "1.5rem",
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }

    # Calculate key statistics for awareness impact
    def_aware_count = df[awareness_col].value_counts().get("Yes", 0)
    total_def_responses = df[awareness_col].notna().sum()
    def_aware_pct = round((def_aware_count / total_def_responses * 100) if total_def_responses > 0 else 0)

    impl_count = df[implementation_col].value_counts().get("Yes", 0)
    total_impl_responses = df[implementation_col].notna().sum()
    impl_pct = round((impl_count / total_impl_responses * 100) if total_impl_responses > 0 else 0)

    # Create statistics cards
    stats_row = dbc.Row([
        dbc.Col(build_stat_card(
            "Definition Awareness",
            f"{def_aware_pct}%",
            "bi-lightbulb-fill",
            subtitle=f"{def_aware_count} out of {total_def_responses} respondents"
        ), width=6),
        dbc.Col(build_stat_card(
            "Implementation Rate",
            f"{impl_pct}%",
            "bi-gear-fill",
            subtitle=f"{impl_count} out of {total_impl_responses} organizations"
        ), width=6),
    ], className="mb-5 g-4")

    # Create the awareness impact charts
    awareness_impl_fig = create_awareness_implementation_chart(df)
    training_impl_fig = create_training_implementation_chart(df)
    discussion_impl_fig = create_discussion_implementation_chart(df)

    # Awareness and Implementation section
    awareness_impact_section = html.Div([
        html.H4("Awareness and Implementation", style=section_header_style),
        html.P(
            "Analyze the relationship between awareness of digital sustainability "
            "and its practical implementation in organizations.",
            className="mb-4",
            style={"color": "#666"}
        ),
        stats_row,
        dbc.Row([
            build_chart_card(
                "Impact of Definition Awareness on Implementation",
                awareness_impl_fig,
                12
            )
        ], className="mb-5 g-4"),
        dbc.Row([
            build_chart_card(
                "Impact of Training on Implementation",
                training_impl_fig,
                12
            )
        ], className="mb-5 g-4"),
        dbc.Row([
            build_chart_card(
                "Impact of Discussion Frequency on Implementation",
                discussion_impl_fig,
                12
            )
        ], className="mb-5 g-4")
    ])
    
    # Other sections remain unchanged
    organizational_factors_section = html.Div([
        html.H4("Organizational Factors", style=section_header_style),
        html.P(
            "Explore how organizational characteristics influence "
            "digital sustainability practices and outcomes.",
            className="mb-4",
            style={"color": "#666"}
        ),
        # Placeholder for organizational factors charts
        dbc.Row([], className="mb-5 g-4")
    ])
    
    role_based_section = html.Div([
        html.H4("Role-Based Analysis", style=section_header_style),
        html.P(
            "Understand how different roles perceive and implement "
            "digital sustainability practices.",
            className="mb-4",
            style={"color": "#666"}
        ),
        # Placeholder for role-based analysis charts
        dbc.Row([], className="mb-5 g-4")
    ])
    
    barriers_drivers_section = html.Div([
        html.H4("Barriers and Drivers Analysis", style=section_header_style),
        html.P(
            "Analyze the relationships between various barriers and drivers "
            "across different organizational contexts.",
            className="mb-4",
            style={"color": "#666"}
        ),
        # Placeholder for barriers and drivers analysis charts
        dbc.Row([], className="mb-5 g-4")
    ])

    return html.Div([
        html.H3("Cross-Question Insights", className="mb-4 pt-3", style=page_title_style),
        html.P(
            "This section provides deeper insights by analyzing relationships "
            "between different aspects of the survey responses.",
            className="lead mb-5",
            style={"color": "#666"}
        ),
        awareness_impact_section,
        organizational_factors_section,
        role_based_section,
        barriers_drivers_section
    ]) 