"""General Awareness page module."""

import pandas as pd
import dash_bootstrap_components as dbc
from dash import html

from src.components.charts import generate_chart, make_donut_chart, make_histogram
from src.components.layout import build_stat_card, build_chart_card
from src.utils.data_processing import process_numeric_column
from src.config import PRIMARY_COLOR, AWARENESS_COLS
from dashboard_components import build_stat_card, build_chart_card

def build_awareness_page(df: pd.DataFrame) -> html.Div:
    """Build the general awareness page layout."""
    # Debug: Print all column names
    print("\nAvailable columns in DataFrame:")
    for i, col in enumerate(df.columns):
        print(f"{i+1}. {repr(col)}")
    
    # Find the definition column by partial match
    definition_cols = [col for col in df.columns if "umbrella term" in col]
    if not definition_cols:
        print("\nNo column found containing 'umbrella term'")
        return html.Div("Error: Could not find definition column")
    
    definition_col = definition_cols[0]
    print(f"\nUsing definition column: {repr(definition_col)}")
    
    # Calculate key statistics
    heard_of_def_count = df[definition_col].value_counts().get("Yes", 0)
    total_valid_responses = df[definition_col].notna().sum()
    heard_of_def_percentage = round((heard_of_def_count / total_valid_responses * 100) if total_valid_responses > 0 else 0)
    
    training_col = "Have you participated in one or more training or educational programs on digital sustainability?"
    training_participation = df[training_col].value_counts().get("Yes", 0)
    training_total = df[training_col].notna().sum()
    training_percentage = round((training_participation / training_total * 100) if training_total > 0 else 0)
    
    num_trainings_col = "How many times training(s) or educational program(s) on digital sustainability did you participate in?"
    avg_trainings_numeric = process_numeric_column(df, num_trainings_col)
    avg_trainings = round(avg_trainings_numeric.mean(), 1) if not pd.isna(avg_trainings_numeric.mean()) else "N/A"
    
    # Top statistics row
    stats_row = dbc.Row([
        dbc.Col(build_stat_card(
            "Familiar with Definition",
            f"{heard_of_def_percentage}%",
            "bi-info-circle",
            subtitle=f"{heard_of_def_count} out of {total_valid_responses}"
        ), width=4, className="px-2"),
        dbc.Col(build_stat_card(
            "Training Participation",
            f"{training_percentage}%",
            "bi-book-fill",
            subtitle=f"{training_participation} out of {training_total}"
        ), width=4, className="px-2"),
        dbc.Col(build_stat_card(
            "Avg. Trainings Taken",
            str(avg_trainings),
            "bi-award-fill"
        ), width=4, className="px-2"),
    ], className="mb-5 g-4")
    
    # Create visualizations
    definition_fig = make_donut_chart(df, definition_col, "")
    freq_discussions_fig = generate_chart(df, "How frequently do you encounter (e.g., coming across or taking part in) discussions about digital sustainability in your professional environment?", "", 'bar_h')
    training_fig = make_donut_chart(df, training_col, "")
    satisfaction_fig = make_donut_chart(df, "Are you satisfied with the number of trainings or educational programs you participated in?", "")
    num_trainings_fig = make_histogram(df, num_trainings_col, "", bins=6)
    
    # First row of charts
    row1 = dbc.Row([
        build_chart_card(
            "Are you familiar with the definition of Digital Sustainability?",
            definition_fig,
            6
        ),
        build_chart_card(
            "How frequently do you encounter discussions about digital sustainability?",
            freq_discussions_fig,
            12
        )
    ], className="mb-5 g-4")
    
    # Training section header style
    section_header_style = {
        "color": PRIMARY_COLOR,
        "margin-top": "2rem",
        "margin-bottom": "1.5rem",
        "font-size": "1.5rem",
        "border-bottom": f"2px solid {PRIMARY_COLOR}",
        "padding-bottom": "0.5rem"
    }
    
    # Training section with header
    training_section = html.Div([
        html.H4("Training and Education in Digital Sustainability", style=section_header_style),
        html.P("Explore participation rates in sustainability training programs and satisfaction levels among participants.", 
               className="mb-4", style={"color": "#666"}),
        dbc.Row([
            build_chart_card(
                "📚 Participation in Sustainability Training Programs",
                training_fig,
                6
            ),
            build_chart_card(
                "🎯 Training Satisfaction Levels",
                satisfaction_fig,
                6
            )
        ], className="mb-5 g-4"),
        dbc.Row([
            build_chart_card(
                "📊 Distribution of Training Programs Attended",
                num_trainings_fig,
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
        html.H3("General Awareness of Sustainability", className="mb-4 pt-3", style=page_title_style),
        stats_row,
        row1,
        training_section
    ]) 