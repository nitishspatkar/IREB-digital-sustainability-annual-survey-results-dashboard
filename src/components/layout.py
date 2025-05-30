"""Layout components for the dashboard."""

from typing import List, Dict, Tuple, Union
import dash_bootstrap_components as dbc
from dash import html, dcc

from src.config import STYLE_VARS, PRIMARY_COLOR

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
                        'staticPlot': True  # This disables all interactivity including hover
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
                        'staticPlot': True  # This disables all interactivity including hover
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
                        'staticPlot': True  # This disables all interactivity including hover
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
    """Create the sidebar navigation component."""
    return html.Div(
        [
            html.H2("Digital", className="display-5", style={"color": "white"}),
            html.H4("Sustainability", className="mb-1", style={"color": "white", "font-weight": "lighter"}),
            html.P("Survey Analysis", className="text-light small", style={"opacity": 0.8}),
            dcc.Dropdown(
                id="year-dropdown",
                options=[{"label": str(y), "value": y} for y in [2025, 2026]],  # Add more years as needed
                value=2025,  # Default year
                clearable=False,
                style={"marginBottom": "1rem"}
            ),
            dbc.Nav(
                [
                    dbc.NavLink([
                        html.I(className="bi bi-people-fill me-2"),
                        "Demographics"
                    ], href="/", active="exact", className="py-2 nav-link-custom"),
                    dbc.NavLink([
                        html.I(className="bi bi-lightbulb-fill me-2"),
                        "General Awareness"
                    ], href="/awareness", active="exact", className="py-2 nav-link-custom"),
                    dbc.NavLink([
                        html.I(className="bi bi-building-fill me-2"),
                        "Role in Organization"
                    ], href="/organization", active="exact", className="py-2 nav-link-custom"),
                    dbc.NavLink([
                        html.I(className="bi bi-briefcase-fill me-2"),
                        "Job & Tasks"
                    ], href="/job-tasks", active="exact", className="py-2 nav-link-custom"),
                ],
                vertical=True,
                className="flex-grow-1"
            ),
            html.Hr(style={"border-color": "rgba(255, 255, 255, 0.3)", "margin-top": "auto"}),
            html.P(
                "IREB Digital Sustainability",
                className="small text-center",
                style={"color": "rgba(255, 255, 255, 0.7)", "margin-top": "1rem"}
            )
        ],
        style={
            "position": "fixed",
            "top": 0,
            "left": 0,
            "bottom": 0,
            "width": "20rem",
            "padding": "2rem 1rem",
            "background-color": PRIMARY_COLOR,
            "color": "white",
            "overflow-y": "auto"
        }
    ) 