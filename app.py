"""Main application file for the Digital Sustainability Survey Dashboard."""

import dash
from dash import html
import dash_bootstrap_components as dbc
from dash import dcc, Input, Output
import flask
from flask import session
from flask_session import Session

from src.config import CONTENT_STYLE, DATA_FOLDER, AVAILABLE_YEARS
from src.components.layout import create_sidebar
from src.utils.data_processing import load_single_year_data
from src.pages.demographics import build_demographics_page
from src.pages.awareness import build_awareness_page
from src.pages.organization import build_organization_page
from src.pages.job_tasks import build_job_tasks_page
from src.pages.insights import build_insights_page
from src.pages.free_text_responses import build_free_text_responses_page

# Set up server and session
server = flask.Flask(__name__)
server.secret_key = 'supersecretkey'  # You may want to use a more secure key in production
server.config['SESSION_TYPE'] = 'filesystem'
Session(server)

# Initialize the Dash app
external_stylesheets = [dbc.themes.YETI, dbc.icons.BOOTSTRAP]
app = dash.Dash(__name__, external_stylesheets=external_stylesheets, server=server, suppress_callback_exceptions=True)
app.title = "Digital Sustainability Insights Dashboard"

# Login layout
login_layout = dbc.Container([
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H4("Login", className="mb-0")),
                dbc.CardBody([
                    dbc.Alert(id="login-alert", color="danger", is_open=False),
                    dbc.Form([
                        html.Div([
                            dbc.Label("Username", html_for="login-username"),
                            dbc.Input(type="text", id="login-username", placeholder="Enter username"),
                        ], className="mb-3"),
                        html.Div([
                            dbc.Label("Password", html_for="login-password"),
                            dbc.Input(type="password", id="login-password", placeholder="Enter password"),
                        ], className="mb-3"),
                        dbc.Button("Login", id="login-button", color="primary", className="mt-3 w-100", n_clicks=0),
                    ])
                ])
            ], className="shadow-sm mt-5")
        ], width=4)
    ], justify="center")
], fluid=True, style={"min-height": "100vh", "background-color": "#f8f9fa"})

# Main app layout (root)
def serve_layout():
    return dbc.Container([
        dcc.Location(id="url", refresh=False),
        html.Div(id="page-root"),
    ], fluid=True, style={"min-height": "100vh", "background-color": "#f8f9fa"})

app.layout = serve_layout

# Callback to render either login or dashboard
@app.callback(
    Output("page-root", "children"),
    [Input("url", "pathname")]
)
def display_page(pathname):
    if session.get("logged_in"):
        return dbc.Container([
            create_sidebar(),
            html.Div(id="page-content", style=CONTENT_STYLE),
        ], fluid=True, style={"min-height": "100vh", "background-color": "#f8f9fa"})
    else:
        return login_layout

# Callback for login
@app.callback(
    [Output("login-alert", "children"), Output("login-alert", "is_open"), Output("url", "pathname")],
    [Input("login-button", "n_clicks")],
    [dash.dependencies.State("login-username", "value"), dash.dependencies.State("login-password", "value")],
    prevent_initial_call=True
)
def handle_login(n_clicks, username, password):
    if username == "ireb" and password == "irebireb":
        session["logged_in"] = True
        return "", False, "/"
    else:
        return "Invalid username or password.", True, "/login"

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
    if not session.get("logged_in"):
        return login_layout
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
    elif pathname == "/free-text":
        return dbc.Container([build_free_text_responses_page(df)], fluid=True)
    
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
    app.run(debug=True, port=8053)
