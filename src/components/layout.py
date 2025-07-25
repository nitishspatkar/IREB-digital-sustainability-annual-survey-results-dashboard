"""Layout components for the dashboard."""

from typing import List, Dict, Tuple, Union
import dash_bootstrap_components as dbc
from dash import html, dcc

from src.config import (
    STYLE_VARS,
    PRIMARY_COLOR,
    AVAILABLE_YEARS,
    SIDEBAR_STYLE
)

def clean_title(title: str) -> str:
    """Clean and standardize title text for consistent display."""
    # Remove emojis and special characters but keep basic punctuation
    cleaned = title.replace('🎯', '').replace('❓', '').strip()
    return cleaned

def build_stat_card(
    title: str,
    value: str,
    icon_class: str = "bi-info-circle",
    trend: Union[float, None] = None,
    subtitle: Union[str, None] = None
) -> dbc.Card:
    """Create a card with a key statistic and optional trend and subtitle."""
    card_content = [
        dbc.CardHeader([
            html.I(className=f"bi {icon_class} me-2"),
            html.Span(clean_title(title))
        ], className="d-flex align-items-center"),
        dbc.CardBody([
            html.H2(value, className="card-title text-center mb-0"),
            html.P(subtitle, className="card-text text-center text-muted small mt-2") if subtitle else None,
            html.Div([
                html.I(className=f"bi {'bi-arrow-up-short text-success' if trend and trend > 0 else 'bi-arrow-down-short text-danger'} me-1") if trend else None,
                html.Span(f"{abs(trend)}%", className=f"{'text-success' if trend and trend > 0 else 'text-danger'}") if trend else None
            ], className="text-center mt-2") if trend else None
        ])
    ]
    return dbc.Card(card_content, className="shadow-sm h-100 border-0")

def build_chart_card(
    title: str,
    fig: object,
    column_width: int = 12,
    className: str = "mb-4"
) -> dbc.Col:
    """Wraps a plotly figure in a Bootstrap card with custom styling."""
    return dbc.Col(
        dbc.Card([
            dbc.CardHeader(
                html.H5(clean_title(title), className="card-title mb-0"),
                className="card-header-primary border-bottom-0",
                style={"font-size": "1rem", "font-weight": "500"}
            ),
            dbc.CardBody(
                dcc.Graph(
                    figure=fig,
                    config={
                        'displayModeBar': False,
                        'responsive': True
                    }
                ),
                className="pt-0"  # Remove top padding since header has no border
            )
        ], className="shadow-sm h-100 border-0"),
        width=column_width,
        className=className
    )

def build_card(col: str, fig: object, reverse_mapping: Dict[str, str]) -> dbc.Card:
    """
    Wraps an individual graph in a Bootstrap card.
    Uses the full question text (from reverse_mapping) for the header.
    """
    question_text = reverse_mapping.get(col, col.replace("_", " ").title())
    return dbc.Card(
        [
            dbc.CardHeader(
                html.H5(clean_title(question_text), className="card-title mb-0"),
                className="card-header-primary border-bottom-0",
                style={"font-size": "1rem", "font-weight": "500"}
            ),
            dbc.CardBody(
                dcc.Graph(
                    figure=fig,
                    config={
                        'displayModeBar': False,
                        'responsive': True
                    }
                ),
                className="pt-0"  # Remove top padding since header has no border
            )
        ],
        className="mb-4 shadow-sm border-0"
    )

def build_multi_card(title: str, fig: object) -> dbc.Card:
    """Wraps a multi-select visualization in a Bootstrap card."""
    return dbc.Card(
        [
            dbc.CardHeader(
                html.H5(clean_title(title), className="card-title mb-0"),
                className="card-header-primary border-bottom-0",
                style={"font-size": "1rem", "font-weight": "500"}
            ),
            dbc.CardBody(
                dcc.Graph(
                    figure=fig,
                    config={
                        'displayModeBar': False,
                        'responsive': True
                    }
                ),
                className="pt-0"  # Remove top padding since header has no border
            )
        ],
        className="mb-4 shadow-sm border-0"
    )

def build_section_three_columns(
    fig_pairs: List[Tuple[str, object]],
    reverse_mapping: Dict[str, str]
) -> dbc.Row:
    """
    Given a list of (column, figure) pairs, splits them into three columns
    and returns a Bootstrap Row with three Columns containing cards.
    """
    third = (len(fig_pairs) + 2) // 3  # Round up the split
    left_pairs = fig_pairs[:third]
    middle_pairs = fig_pairs[third:2*third]
    right_pairs = fig_pairs[2*third:]
    
    left_cards = [build_card(col, fig, reverse_mapping) for col, fig in left_pairs]
    middle_cards = [build_card(col, fig, reverse_mapping) for col, fig in middle_pairs]
    right_cards = [build_card(col, fig, reverse_mapping) for col, fig in right_pairs]
    
    return dbc.Row([
        dbc.Col(left_cards, width=4),
        dbc.Col(middle_cards, width=4),
        dbc.Col(right_cards, width=4)
    ], className="mb-4")

def build_chart_grid(
    chart_info_list: List[Tuple[str, object]],
    cards_per_row: int = 2
) -> List[dbc.Row]:
    """
    Given a list of (title, figure) pairs, returns a list of dbc.Row objects,
    each containing up to cards_per_row chart cards.
    """
    rows = []
    for i in range(0, len(chart_info_list), cards_per_row):
        row_cards = [
            build_chart_card(title, fig, 12 // cards_per_row)
            for title, fig in chart_info_list[i:i+cards_per_row]
        ]
        rows.append(dbc.Row(row_cards, className="mb-5 g-4"))
    return rows

def create_sidebar() -> html.Div:
    """Create the sidebar with navigation and year selection."""
    return html.Div([
        # Logo at the top
        html.Div([
            html.Img(
                src="/assets/IREB_RGB.jpg",
                alt="IREB Logo",
                style={
                    "width": "100%",
                    "max-width": "200px",
                    "height": "auto",
                    "margin-bottom": "20px"
                }
            )
        ], className="text-center mb-3"),
        html.H2("Digital Sustainability Survey", className="display-7 mb-4"),
        html.Hr(),
        dbc.Nav([
            dbc.NavLink([
                html.I(className="bi bi-people-fill me-2"),
                "Demographics"
            ], href="/", active="exact", className="nav-link-custom"),
            dbc.NavLink([
                html.I(className="bi bi-lightbulb-fill me-2"),
                "Awareness"
            ], href="/awareness", active="exact", className="nav-link-custom"),
            dbc.NavLink([
                html.I(className="bi bi-building-fill me-2"),
                "Organization"
            ], href="/organization", active="exact", className="nav-link-custom"),
            dbc.NavLink([
                html.I(className="bi bi-person-workspace me-2"),
                "Job Tasks"
            ], href="/job-tasks", active="exact", className="nav-link-custom"),
            dbc.NavLink([
                html.I(className="bi bi-chat-left-text me-2"),
                "Free Text Responses"
            ], href="/free-text", active="exact", className="nav-link-custom"),
            dbc.NavLink([
                html.I(className="bi bi-graph-up me-2"),
                "Insights"
            ], href="/insights", active="exact", className="nav-link-custom"),
        ], vertical=True, pills=True, className="mb-4"),
        html.Hr(),
        html.P("Select Survey Year", className="mb-2"),
        dcc.Dropdown(
            id="year-dropdown",
            options=[{"label": str(year), "value": year} for year in AVAILABLE_YEARS],
            value=2025 if 2025 in AVAILABLE_YEARS else AVAILABLE_YEARS[-1],  # Default to 2025 if available
            clearable=False,
            className="mb-4 year-dropdown"
        )
    ], className="sidebar", style=SIDEBAR_STYLE) 