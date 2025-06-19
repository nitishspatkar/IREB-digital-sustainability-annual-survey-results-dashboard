import pandas as pd
import dash_bootstrap_components as dbc
from dash import html
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from rename_config import rename_mapping
from src.config_styles import CARD_STYLE, HEADER_STYLE, RESPONSE_STYLE

# Build reverse mapping from short name to original question
reverse_mapping = {v: k for k, v in rename_mapping.items()}

# List of free-text columns (short names)
FREE_TEXT_COLS = [
    'role_other',
    'application_domain_other',
    'frequency_sustainability_discussions_other',
    'training_description',
    'no_training_reason_other',
    'no_more_training_reason_other',
    'org_dim_other',
    'org_training_resources_description',
    'org_reason_no_training_other',
    'why_customers_not_asking',
    'tools_description',
    'drive_sustainability_other',
    'hinder_other',
    'lack_knowledge_other',
    'resource_need_other',
    # Add more if needed
]

def build_free_text_responses_page(df: pd.DataFrame) -> html.Div:
    cards = []
    for col in FREE_TEXT_COLS:
        if col in df.columns:
            responses = df[col].dropna().astype(str).str.strip()
            responses = responses[responses != ""]
            if not responses.empty:
                cards.append(
                    dbc.Card([
                        html.Div(reverse_mapping.get(col, col), style=HEADER_STYLE),
                        dbc.CardBody([
                            html.Div([
                                html.Div(response, style=RESPONSE_STYLE)
                                for response in responses
                            ])
                        ])
                    ], style=CARD_STYLE)
                )
    return html.Div([
        html.H3("Free Text Responses", className="mb-4 pt-3", style={
            "color": "#831E82",
            "borderBottom": "2px solid #831E82",
            "paddingBottom": "0.5rem"
        }),
        html.P("Below are all open-ended responses from the survey, grouped by question.", className="mb-4", style={"color": "#666"}),
        *cards
    ]) 