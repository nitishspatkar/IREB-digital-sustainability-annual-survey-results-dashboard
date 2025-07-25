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
    'support_other',
]

def get_question_icon(col: str) -> str:
    """Get appropriate icon for each question type."""
    icon_mapping = {
        'role_other': 'bi-person-plus',
        'application_domain_other': 'bi-building-gear',
        'frequency_sustainability_discussions_other': 'bi-chat-dots',
        'training_description': 'bi-book',
        'no_training_reason_other': 'bi-x-circle',
        'no_more_training_reason_other': 'bi-dash-circle',
        'org_dim_other': 'bi-layers',
        'org_training_resources_description': 'bi-mortarboard',
        'org_reason_no_training_other': 'bi-exclamation-circle',
        'why_customers_not_asking': 'bi-question-circle',
        'tools_description': 'bi-tools',
        'drive_sustainability_other': 'bi-arrow-up-circle',
        'hinder_other': 'bi-exclamation-triangle',
        'lack_knowledge_other': 'bi-lightbulb',
        'resource_need_other': 'bi-life-preserver',
        'support_other': 'bi-heart'
    }
    return icon_mapping.get(col, 'bi-chat-text')

def build_response_card(col: str, responses: list, card_id: str, initial_count: int = 6) -> dbc.Card:
    """Build an expandable response card for a question."""
    total_responses = len(responses)
    has_more = total_responses > initial_count
    initial_responses = responses[:initial_count]
    remaining_responses = responses[initial_count:]
    
    question_text = reverse_mapping.get(col, col.replace("_", " ").title())
    icon = get_question_icon(col)
    
    return dbc.Card([
        dbc.CardHeader([
            html.Div([
                html.Div([
                    html.I(className=f"bi {icon} me-3", style={"fontSize": "1.3rem"}),
                    html.H5(question_text, className="mb-0 flex-grow-1")
                ], className="d-flex align-items-center"),
                html.Div([
                    html.Span(str(total_responses), className="response-count-badge"),
                    html.Span("responses", className="response-count-label")
                ], className="d-flex align-items-center gap-2")
            ], className="d-flex justify-content-between align-items-center w-100")
        ], className="enhanced-card-header"),
        
        dbc.CardBody([
            # Initial responses (always visible)
            html.Div([
                html.Div([
                    html.Div([
                        html.I(className="bi bi-quote response-quote-icon"),
                        html.Span(response, className="response-text")
                    ], className="response-item")
                ], className="response-wrapper")
                for i, response in enumerate(initial_responses)
            ]),
            
            # Expandable section for additional responses
            html.Details([
                html.Summary([
                    html.I(className="bi bi-chevron-down me-2 expand-icon"),
                    html.Span([
                        html.Span(f"See {len(remaining_responses)} more responses", className="expand-text-closed"),
                        html.Span("See less", className="expand-text-open")
                    ])
                ], className="expand-summary"),
                
                html.Div([
                    html.Div([
                        html.Div([
                            html.I(className="bi bi-quote response-quote-icon"),
                            html.Span(response, className="response-text")
                        ], className="response-item")
                    ], className="response-wrapper")
                    for i, response in enumerate(remaining_responses)
                ], className="mt-3")
                
            ], className="expand-details mt-3") if has_more else None
            
        ], className="p-4")
    ], className="free-text-card mb-4")

def build_free_text_responses_page(df: pd.DataFrame) -> html.Div:
    """Build the free text responses page with expandable cards."""
    
    # Calculate summary statistics
    total_questions = 0
    total_responses = 0
    avg_responses_per_question = 0
    
    valid_cols = []
    for col in FREE_TEXT_COLS:
        if col in df.columns:
            responses = df[col].dropna().astype(str).str.strip()
            responses = responses[responses != ""]
            if not responses.empty:
                valid_cols.append((col, responses.tolist()))
                total_questions += 1
                total_responses += len(responses)
    
    if total_questions > 0:
        avg_responses_per_question = round(total_responses / total_questions, 1)
    
    # Enhanced stat cards
    stats_row = dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.Div([
                            html.I(className="bi bi-chat-text-fill", style={
                                "fontSize": "2.5rem",
                                "color": "white",
                                "opacity": "0.9",
                                "marginRight": "1rem"
                            })
                        ]),
                        html.Div([
                            html.H2(str(total_questions), className="stat-value mb-1"),
                            html.H6("Questions with Responses", className="stat-title mb-0"),
                            html.Small("Open-ended survey questions", className="stat-description")
                        ], className="flex-grow-1")
                    ], className="d-flex align-items-center h-100")
                ])
            ], className="stat-card h-100", style={
                "background": "linear-gradient(135deg, #831E82 0%, #A450A3 100%)",
                "border": "none",
                "borderRadius": "15px",
                "boxShadow": "0 8px 25px rgba(131, 30, 130, 0.15)",
                "color": "white"
            })
        ], width=12, lg=4, className="mb-4"),
        
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.Div([
                            html.I(className="bi bi-chat-square-text-fill", style={
                                "fontSize": "2.5rem",
                                "color": "white",
                                "opacity": "0.9",
                                "marginRight": "1rem"
                            })
                        ]),
                        html.Div([
                            html.H2(str(total_responses), className="stat-value mb-1"),
                            html.H6("Total Responses", className="stat-title mb-0"),
                            html.Small("Individual response entries", className="stat-description")
                        ], className="flex-grow-1")
                    ], className="d-flex align-items-center h-100")
                ])
            ], className="stat-card h-100", style={
                "background": "linear-gradient(135deg, #A450A3 0%, #C581C4 100%)",
                "border": "none",
                "borderRadius": "15px",
                "boxShadow": "0 8px 25px rgba(131, 30, 130, 0.15)",
                "color": "white"
            })
        ], width=12, lg=4, className="mb-4"),
        
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.Div([
                        html.Div([
                            html.I(className="bi bi-bar-chart-fill", style={
                                "fontSize": "2.5rem",
                                "color": "white", 
                                "opacity": "0.9",
                                "marginRight": "1rem"
                            })
                        ]),
                        html.Div([
                            html.H2(str(avg_responses_per_question), className="stat-value mb-1"),
                            html.H6("Avg. Responses per Question", className="stat-title mb-0"),
                            html.Small("Response engagement rate", className="stat-description")
                        ], className="flex-grow-1")
                    ], className="d-flex align-items-center h-100")
                ])
            ], className="stat-card h-100", style={
                "background": "linear-gradient(135deg, #C581C4 0%, #E6B3E5 100%)",
                "border": "none",
                "borderRadius": "15px",
                "boxShadow": "0 8px 25px rgba(131, 30, 130, 0.15)",
                "color": "white"
            })
        ], width=12, lg=4, className="mb-4")
    ], className="mb-5")
    
    # Build response cards
    cards = []
    for i, (col, responses) in enumerate(valid_cols):
        card_id = f"card-{i}"
        cards.append(build_response_card(col, responses, card_id))
    
    # Enhanced page header
    page_header = html.Div([
        html.Div([
            html.H2([
                html.I(className="bi bi-chat-text-fill me-3"),
                "Free Text Responses"
            ], className="page-title mb-0"),
            html.P("Open-ended responses providing detailed insights and personal perspectives from survey participants", 
                   className="page-subtitle mb-0")
        ], className="page-header-content")
    ], className="page-header mb-5")
    
    return html.Div([
        page_header,
        stats_row,
        html.Div(cards, className="responses-container")
    ], className="free-text-page")

# We'll register callbacks dynamically for each card in the main app
# This is a placeholder for the callback registration 