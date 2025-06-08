"""Main application file for the Digital Sustainability Survey Dashboard."""

import dash
from dash import html
import dash_bootstrap_components as dbc
from dash import dcc, Input, Output

from src.config import CONTENT_STYLE, DATA_FOLDER, AVAILABLE_YEARS
from src.components.layout import create_sidebar
from src.utils.data_processing import load_single_year_data
from src.pages.demographics import build_demographics_page
from src.pages.awareness import build_awareness_page
from src.pages.organization import build_organization_page
from src.pages.job_tasks import build_job_tasks_page
from src.pages.insights import build_insights_page

# Initialize the Dash app
external_stylesheets = [dbc.themes.YETI, dbc.icons.BOOTSTRAP]
app = dash.Dash(__name__, external_stylesheets=external_stylesheets)
app.title = "Digital Sustainability Insights Dashboard"

# Create the app layout
app.layout = dbc.Container([
    dcc.Location(id="url", refresh=False),
    create_sidebar(),
    html.Div(id="page-content", style=CONTENT_STYLE),
], fluid=True, style={"min-height": "100vh", "background-color": "#f8f9fa"})

# Callback to update page content based on URL and selected year
@app.callback(
    Output("page-content", "children"),
    [Input("url", "pathname"), Input("year-dropdown", "value")]
)
def render_page_content(pathname: str, selected_year: int) -> html.Div:
    """
    Render the appropriate page content based on the URL pathname and selected year.
    
    Args:
        pathname: Current URL pathname
        selected_year: Selected year from the dropdown
        
    Returns:
        Dash component containing the page content
    """
    # Load data for the selected year
    df = load_single_year_data(DATA_FOLDER, selected_year)
    
    # Route to the appropriate page
    if pathname == "/":
        return dbc.Container([build_demographics_page(df)], fluid=True)
    elif pathname == "/awareness":
        return dbc.Container([build_awareness_page(df)], fluid=True)
    elif pathname == "/organization":
        return dbc.Container([build_organization_page(df)], fluid=True)
    elif pathname == "/job-tasks":
        return dbc.Container([build_job_tasks_page(df)], fluid=True)
    elif pathname == "/insights":
        return dbc.Container([build_insights_page(df)], fluid=True)
    
    # If the pathname is not recognized, return a 404 page
    return dbc.Container(
        [
            html.H1("404: Not found", className="text-danger"),
            html.Hr(),
            html.P(f"The pathname {pathname} was not recognised..."),
            dbc.Button("Go to Homepage", href="/", color="primary", className="mt-3")
        ],
        className="py-5 text-center",
    )

if __name__ == "__main__":
    app.run(debug=True, port=8051)
