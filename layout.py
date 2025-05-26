import dash_bootstrap_components as dbc
from dash import html, dcc

# ---- Centralized Color and Style Variables ----
STYLE_VARS = {
    "PRIMARY_COLOR": "#831E82",
    "SECONDARY_COLOR": "#A450A3",
    "TERTIARY_COLOR": "#C581C4",
    "QUATERNARY_COLOR": "#E6B3E5",
    "BACKGROUND_COLOR": "#f8f9fa",
    "CARD_HEADER_COLOR": "#831E82",
    "FONT_FAMILY": "Helvetica",
    "FONT_SIZE": 20,
    "CARD_MARGIN": "mb-4",
    "ROW_MARGIN": "mb-5 g-4",
}

MULTI_COLOR_PALETTE = [
    STYLE_VARS["PRIMARY_COLOR"],
    STYLE_VARS["SECONDARY_COLOR"],
    STYLE_VARS["TERTIARY_COLOR"],
    STYLE_VARS["QUATERNARY_COLOR"]
]
PRIMARY_COLOR = STYLE_VARS["PRIMARY_COLOR"]

def build_stat_card(title, value, icon, subtitle=None):
    return dbc.Card(
        dbc.CardBody([
            html.Div([
                html.I(className=f"bi {icon} me-2", style={"font-size": "2rem", "color": PRIMARY_COLOR}),
                html.Span(title, className="h5", style={"color": PRIMARY_COLOR}),
            ], className="d-flex align-items-center mb-2"),
            html.Div(value, className="display-6 fw-bold"),
            html.Div(subtitle, className="text-muted small") if subtitle else None,
        ]),
        className="shadow-sm " + STYLE_VARS["CARD_MARGIN"],
        style={"border": f"1px solid {PRIMARY_COLOR}"}
    )

def build_chart_card(title, fig, column_width=12, className=STYLE_VARS["CARD_MARGIN"]):
    fig.update_layout(
        font=dict(family=STYLE_VARS["FONT_FAMILY"], size=STYLE_VARS["FONT_SIZE"]),
    )
    return dbc.Col(
        dbc.Card(
            [
                dbc.CardHeader(title, style={"background": PRIMARY_COLOR, "color": "white", "font-weight": "bold"}),
                dbc.CardBody(
                    dcc.Graph(figure=fig, config={'displayModeBar': False}),
                    style={"background": STYLE_VARS["BACKGROUND_COLOR"]}
                ),
            ],
            className="shadow-sm h-100"
        ),
        width=column_width,
        className=className
    )

def build_card(title, content, column_width=12, className=STYLE_VARS["CARD_MARGIN"]):
    return dbc.Col(
        dbc.Card(
            [
                dbc.CardHeader(title, style={"background": PRIMARY_COLOR, "color": "white", "font-weight": "bold"}),
                dbc.CardBody(content, style={"background": STYLE_VARS["BACKGROUND_COLOR"]}),
            ],
            className="shadow-sm h-100"
        ),
        width=column_width,
        className=className
    )

def build_multi_card(title, content_list, column_width=12, className=STYLE_VARS["CARD_MARGIN"]):
    return dbc.Col(
        dbc.Card(
            [
                dbc.CardHeader(title, style={"background": PRIMARY_COLOR, "color": "white", "font-weight": "bold"}),
                dbc.CardBody([html.Div(c) for c in content_list], style={"background": STYLE_VARS["BACKGROUND_COLOR"]}),
            ],
            className="shadow-sm h-100"
        ),
        width=column_width,
        className=className
    )

def build_section_three_columns(cards):
    """cards: list of dbc.Col or build_chart_card results"""
    return dbc.Row(cards, className=STYLE_VARS["ROW_MARGIN"])

def build_chart_grid(chart_info_list, cards_per_row=2):
    """
    Given a list of (title, figure) pairs, returns a list of dbc.Row objects,
    each containing up to `cards_per_row` chart cards.
    """
    rows = []
    for i in range(0, len(chart_info_list), cards_per_row):
        row_cards = [
            build_chart_card(title, fig, 12 // cards_per_row)
            for title, fig in chart_info_list[i:i+cards_per_row]
        ]
        rows.append(dbc.Row(row_cards, className=STYLE_VARS["ROW_MARGIN"]))
    return rows

# Example page builder function (you can expand as needed)
def build_demographics_page(stats_row, chart_info_list):
    """
    stats_row: a dbc.Row with stat cards
    chart_info_list: list of (title, figure) pairs for demographic charts
    """
    chart_rows = build_chart_grid(chart_info_list, cards_per_row=2)
    return html.Div([stats_row] + chart_rows)