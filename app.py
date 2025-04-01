# app.py
import dash
from dash import dcc, html
import dash_bootstrap_components as dbc
import plotly.express as px
import pandas as pd

from analysis.data_preparation import load_single_year_data

# ------------------------------
# 1) Load 2025 data
# ------------------------------
data_folder = "data"
year = 2025
df = load_single_year_data(data_folder, year)

# Define which columns are numeric (for histograms)
numeric_cols = ["years_of_experience", "num_sustainability_trainings"]

# ------------------------------
# 2) Helper Functions
# ------------------------------
def make_bar_chart(df, col, title):
    """Create a bar chart for a categorical (or single-select) column."""
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = [col, "count"]
    fig = px.bar(counts, x=col, y="count", title=title, template="plotly_white")
    fig.update_layout(xaxis_title=col.replace("_", " ").title(), yaxis_title="Count")
    return fig

def make_histogram(df, col, title, bins=5):
    """Create a histogram for a numeric column."""
    fig = px.histogram(df, x=col, nbins=bins, title=title, template="plotly_white")
    fig.update_layout(xaxis_title=col.replace("_", " ").title(), yaxis_title="Frequency")
    return fig

def generate_chart(df, col, title=None):
    """Automatically generate a histogram if the column is numeric, otherwise a bar chart."""
    if not title:
        title = f"{col.replace('_', ' ').title()} Distribution"
    if col in numeric_cols:
        return make_histogram(df, col, title)
    else:
        return make_bar_chart(df, col, title)

def make_multi_select_bar(df, cols, title):
    """
    For a group of columns representing a multi-select question, count non-empty responses
    and return a single bar chart.
    """
    data = []
    for c in cols:
        count_val = df[c].notna().sum()
        # Create a nicer label by replacing underscores and capitalizing
        data.append((c.replace("_", " ").title(), count_val))
    df_data = pd.DataFrame(data, columns=["Option", "Count"])
    fig = px.bar(df_data, x="Option", y="Count", title=title, template="plotly_white")
    fig.update_layout(xaxis_title="Option", yaxis_title="Count")
    return fig

def build_card(col, fig):
    """Wraps a graph and its header in a Bootstrap card for nice styling."""
    return dbc.Card(
        [
            dbc.CardHeader(html.H5(col.replace("_", " ").title(), className="card-title")),
            dbc.CardBody(dcc.Graph(figure=fig, config={'displayModeBar': False}))
        ],
        className="mb-4 shadow-sm"
    )

def build_section_two_columns(fig_pairs):
    """
    Given a list of (column, figure) pairs, splits them into two columns
    and returns a Dash Bootstrap Row with two Columns containing cards.
    """
    half = (len(fig_pairs) + 1) // 2
    left_pairs = fig_pairs[:half]
    right_pairs = fig_pairs[half:]
    
    left_cards = [build_card(col, fig) for col, fig in left_pairs]
    right_cards = [build_card(col, fig) for col, fig in right_pairs]
    
    return dbc.Row([
        dbc.Col(left_cards, width=6),
        dbc.Col(right_cards, width=6)
    ], className="mb-4")

# ------------------------------
# 3) Define Column Groups for Each Tab (Based on Survey Sections)
# ------------------------------
# Note: Adjust these lists to match the renamed columns from your CSV.

# Tab 1: Demographic
demographic_cols = [
    "age_group",
    "years_of_experience",
    "continent",
    "country_residence_1",
    "role",
    "organization_type",
    "application_domain"
]

# Tab 2: General Awareness of Sustainability
awareness_cols = [
    "heard_of_definition",
    "frequency_sustainability_discussions",
    "frequency_sustainability_discussions_other",
    "participated_sustainability_training",
    "satisfied_num_trainings",
    "num_sustainability_trainings"
]
# (If training reasons are considered part of awareness, include them as a multi-select group)
awareness_multi = [
    "no_training_reason_aware",
    "no_training_reason_org_no",
    "no_training_reason_no_opportunity",
    "no_training_reason_no_need",
    "no_training_reason_cost",
    "no_training_reason_other",
    "no_more_training_reason_aware",
    "no_more_training_reason_org_no",
    "no_more_training_reason_no_opportunity",
    "no_more_training_reason_no_need",
    "no_more_training_reason_cost",
    "no_more_training_reason_other"
]

# Tab 3: The Role of Digital Sustainability in Your Organization
organization_cols = [
    "org_sustainability_goals",
    "org_csr_expert_team",
    "org_incorporates_sustainability",
    "org_coordination_on_sustainability",
    "org_reports_sustainability",
    "org_offers_sustainability_training",
    "org_training_resources_description",
    "org_dim_env",
    "org_dim_social",
    "org_dim_individual",
    "org_dim_economic",
    "org_dim_technical",
    "org_dim_notsure",
    "org_dim_other",
    "org_reason_no_training_awareness",
    "org_reason_no_training_need",
    "org_reason_no_training_demand",
    "org_reason_no_training_budget",
    "org_reason_no_training_priority",
    "org_reason_no_training_notsure",
    "org_reason_no_training_other",
    "customer_requires_sustainability",
    "why_customers_not_asking"
]

# Tab 4: Sustainability in Your Job and Tasks
job_task_cols = [
    "incorporate_sustainability_in_tasks",
    "drive_sustainability_org_policies",
    "drive_sustainability_personal_beliefs",
    "drive_sustainability_client_req",
    "drive_sustainability_user_req",
    "drive_sustainability_legal_req",
    "drive_sustainability_other",
    "tools_for_sustainability",
    "tools_description"
]
job_task_multi_hinder = [
    "hinder_no_interest",
    "hinder_no_knowledge",
    "hinder_limited_resources",
    "hinder_financial",
    "hinder_time",
    "hinder_org_support",
    "hinder_complexity",
    "hinder_cultural",
    "hinder_stakeholder_resistance",
    "hinder_other"
]
job_task_multi_knowledge = [
    "lack_knowledge_env",
    "lack_knowledge_social",
    "lack_knowledge_individual",
    "lack_knowledge_economic",
    "lack_knowledge_technical",
    "lack_knowledge_other"
]
job_task_multi_support = [
    "resource_need_theoretical",
    "resource_need_tutorials",
    "resource_need_curricula",
    "resource_need_practical",
    "resource_need_case_studies",
    "resource_need_structures",
    "resource_need_tools",
    "resource_need_none",
    "resource_need_other"
]

# ------------------------------
# 4) Create Figures for Each Section
# ------------------------------
# Demographic Figures
demographic_figs = [(col, generate_chart(df, col, title=f"{col.replace('_',' ').title()} Distribution"))
                    for col in demographic_cols if col in df.columns]

# General Awareness Figures (Single columns)
awareness_figs = [(col, generate_chart(df, col, title=f"{col.replace('_',' ').title()} Distribution"))
                  for col in awareness_cols if col in df.columns]
# Awareness multi-select: training reasons
fig_awareness_multi = make_multi_select_bar(df, awareness_multi, "Training Reasons Distribution")

# Organization Figures
organization_figs = [(col, generate_chart(df, col, title=f"{col.replace('_',' ').title()} Distribution"))
                     for col in organization_cols if col in df.columns]

# Job & Tasks Figures (Single columns)
job_task_figs = [(col, generate_chart(df, col, title=f"{col.replace('_',' ').title()} Distribution"))
                 for col in job_task_cols if col in df.columns]

# Job & Tasks multi-select groups
fig_hinders = make_multi_select_bar(df, job_task_multi_hinder, "Hindrances Distribution")
fig_knowledge = make_multi_select_bar(df, job_task_multi_knowledge, "Knowledge Gaps Distribution")
fig_support = make_multi_select_bar(df, job_task_multi_support, "Support / Resources Needed Distribution")

# ------------------------------
# 5) Assemble the layout with Tabs and Two-Column Sections
# ------------------------------
external_stylesheets = [dbc.themes.FLATLY]
app = dash.Dash(__name__, external_stylesheets=external_stylesheets)
app.title = "Digital Sustainability Survey (2025) Dashboard"

# Build sections using our two-column layout helper
demographic_section = build_section_two_columns(demographic_figs)
awareness_section = build_section_two_columns(awareness_figs)
organization_section = build_section_two_columns(organization_figs)
job_task_section = build_section_two_columns(job_task_figs)

# For Job & Tasks, add additional rows for multi-select groups
job_task_extra = dbc.Row([
    dbc.Col([
        html.H5("Hindrances", className="text-center"),
        dcc.Graph(figure=fig_hinders, config={'displayModeBar': False})
    ], width=4),
    dbc.Col([
        html.H5("Knowledge Gaps", className="text-center"),
        dcc.Graph(figure=fig_knowledge, config={'displayModeBar': False})
    ], width=4),
    dbc.Col([
        html.H5("Support / Resources", className="text-center"),
        dcc.Graph(figure=fig_support, config={'displayModeBar': False})
    ], width=4)
], className="mb-4")

# Create the tab layout with extra spacing above the tabs by wrapping in a Div with margin-top.
app.layout = dbc.Container([
    html.H1("Digital Sustainability Survey (2025)", className="text-center my-4"),
    html.Div(
        dcc.Tabs([
            dcc.Tab(label="Demographic", children=demographic_section),
            dcc.Tab(label="General Awareness", children=dbc.Container([
                build_section_two_columns(awareness_figs),
                dbc.Row(dbc.Col(dcc.Graph(figure=fig_awareness_multi, config={'displayModeBar': False}), width=12), className="mb-4")
            ], fluid=True)),
            dcc.Tab(label="Role in Organization", children=organization_section),
            dcc.Tab(label="Sustainability in Your Job & Tasks", children=dbc.Container([
                job_task_section,
                job_task_extra
            ], fluid=True))
        ]),
        style={"marginTop": "80px"}
    )
], fluid=True)

if __name__ == "__main__":
    app.run(debug=True)
