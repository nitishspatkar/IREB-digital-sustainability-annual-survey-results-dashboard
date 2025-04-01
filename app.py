# app.py
import dash
from dash import dcc, html
import dash_bootstrap_components as dbc
import plotly.express as px
import pandas as pd

from analysis.data_preparation import load_single_year_data
from rename_config import rename_mapping

# Create reverse mapping to get the full question text for individual card headers
reverse_mapping = {v: k for k, v in rename_mapping.items()}

# ------------------------------
# 1) Load 2025 data
# ------------------------------
data_folder = "data"
year = 2025
df = load_single_year_data(data_folder, year)

# Define which columns are numeric for histogram usage
numeric_cols = ["years_of_experience", "num_sustainability_trainings"]

# ------------------------------
# 2) Helper Functions
# ------------------------------
def make_bar_chart(df, col, title):
    """Create a bar chart for a categorical (or single-select) column using the theme color."""
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = [col, "count"]
    fig = px.bar(
        counts,
        x=col,
        y="count",
        title=title,
        template="plotly_white",
        color_discrete_sequence=["#D09ED3"]
    )
    fig.update_layout(xaxis_title=col.replace("_", " ").title(), yaxis_title="Count")
    return fig

def make_histogram(df, col, title, bins=5):
    """Create a histogram for a numeric column using the theme color."""
    fig = px.histogram(
        df,
        x=col,
        nbins=bins,
        title=title,
        template="plotly_white",
        color_discrete_sequence=["#D09ED3"]
    )
    fig.update_layout(xaxis_title=col.replace("_", " ").title(), yaxis_title="Frequency")
    return fig

def generate_chart(df, col, title=None):
    """Automatically generate a histogram if numeric; otherwise, a bar chart."""
    if not title:
        title = f"{col.replace('_', ' ').title()} Distribution"
    if col in numeric_cols:
        return make_histogram(df, col, title)
    else:
        return make_bar_chart(df, col, title)

def simplify_label(col):
    """
    Simplify multi-select option labels by stripping common prefixes.
    Adjust as needed for your column naming conventions.
    """
    if col.startswith("drive_sustainability_"):
        return col.replace("drive_sustainability_", "").replace("_", " ").title()
    elif col.startswith("hinder_"):
        return col.replace("hinder_", "").replace("_", " ").title()
    elif col.startswith("resource_need_"):
        return col.replace("resource_need_", "").replace("_", " ").title()
    elif col.startswith("org_reason_"):
        return col.replace("org_reason_", "").replace("_", " ").title()
    elif col.startswith("org_dim_"):
        return col.replace("org_dim_", "").replace("_", " ").title()
    else:
        return col.replace("_", " ").title()

def make_multi_select_bar(df, cols, title):
    """
    For a group of columns representing a multi-select question, count non-empty responses
    and return a single bar chart using simplified option labels.
    """
    data = []
    for c in cols:
        count_val = df[c].notna().sum()
        option_text = simplify_label(c)
        data.append((option_text, count_val))
    df_data = pd.DataFrame(data, columns=["Option", "Count"])
    fig = px.bar(df_data, x="Option", y="Count", title=title, template="plotly_white")
    fig.update_layout(xaxis_title="Option", yaxis_title="Count")
    return fig

def build_card(col, fig):
    """
    Wraps an individual graph in a Bootstrap card.
    Uses the full question text (from reverse_mapping) for the header.
    """
    question_text = reverse_mapping.get(col, col.replace("_", " ").title())
    return dbc.Card(
        [
            dbc.CardHeader(html.H5(question_text, className="card-title")),
            dbc.CardBody(dcc.Graph(figure=fig, config={'displayModeBar': False}))
        ],
        className="mb-4 shadow-sm"
    )

def build_multi_card(title, fig):
    """
    Wraps an aggregated multi-select graph in a Bootstrap card.
    Uses the provided title as the header.
    """
    return dbc.Card(
        [
            dbc.CardHeader(html.H5(title, className="card-title")),
            dbc.CardBody(dcc.Graph(figure=fig, config={'displayModeBar': False}))
        ],
        className="mb-4 shadow-sm"
    )

def build_section_three_columns(fig_pairs):
    """
    Given a list of (column, figure) pairs, splits them into three columns
    and returns a Bootstrap Row with three Columns containing cards.
    """
    third = (len(fig_pairs) + 2) // 3  # Round up the split
    left_pairs = fig_pairs[:third]
    middle_pairs = fig_pairs[third:2*third]
    right_pairs = fig_pairs[2*third:]
    
    left_cards = [build_card(col, fig) for col, fig in left_pairs]
    middle_cards = [build_card(col, fig) for col, fig in middle_pairs]
    right_cards = [build_card(col, fig) for col, fig in right_pairs]
    
    return dbc.Row([
        dbc.Col(left_cards, width=4),
        dbc.Col(middle_cards, width=4),
        dbc.Col(right_cards, width=4)
    ], className="mb-4")

# ------------------------------
# 3) Define Column Groups for Each Tab (Based on Survey Sections)
# ------------------------------
# (Adjust these lists to match your renamed DataFrame columns.)

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

# Tab 3: The Role of Digital Sustainability in Your Organization
organization_cols = [
    "org_sustainability_goals",
    "org_csr_expert_team",
    "org_incorporates_sustainability",
    "org_coordination_on_sustainability",
    "org_reports_sustainability",
    "org_offers_sustainability_training",
    "org_training_resources_description",
    "customer_requires_sustainability",
    "why_customers_not_asking"
]
org_multi_training = [
    "org_reason_no_training_awareness",
    "org_reason_no_training_need",
    "org_reason_no_training_demand",
    "org_reason_no_training_budget",
    "org_reason_no_training_priority",
    "org_reason_no_training_notsure",
    "org_reason_no_training_other"
]
org_multi_dimensions = [
    "org_dim_env",
    "org_dim_social",
    "org_dim_individual",
    "org_dim_economic",
    "org_dim_technical",
    "org_dim_notsure",
    "org_dim_other"
]

# Tab 4: Sustainability in Your Job and Tasks
job_task_cols = [
    "incorporate_sustainability_in_tasks",
    "tools_for_sustainability",
    "tools_description"
]
job_task_multi_drives = [
    "drive_sustainability_org_policies",
    "drive_sustainability_personal_beliefs",
    "drive_sustainability_client_req",
    "drive_sustainability_user_req",
    "drive_sustainability_legal_req",
    "drive_sustainability_other"
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

# Awareness Figures (Single columns)
awareness_figs = [(col, generate_chart(df, col, title=f"{col.replace('_',' ').title()} Distribution"))
                  for col in awareness_cols if col in df.columns]
# (No multi-select aggregate in Awareness in this example)

# Organization Figures (Single columns)
organization_figs = [(col, generate_chart(df, col, title=f"{col.replace('_',' ').title()} Distribution"))
                     for col in organization_cols if col in df.columns]
fig_org_training = make_multi_select_bar(df, org_multi_training, "Reasons for Not Offering Training/Resources")
fig_org_dimensions = make_multi_select_bar(df, org_multi_dimensions, "Sustainability Dimensions Considered")

# Job & Tasks Figures (Single columns)
job_task_figs = [(col, generate_chart(df, col, title=f"{col.replace('_',' ').title()} Distribution"))
                 for col in job_task_cols if col in df.columns]
fig_job_drives = make_multi_select_bar(df, job_task_multi_drives, "Drives to Incorporate Sustainability")
fig_hinders = make_multi_select_bar(df, job_task_multi_hinder, "Hindrances in Role-Specific Tasks")
fig_job_knowledge = make_multi_select_bar(df, job_task_multi_knowledge, "Knowledge Gaps in Tasks")
fig_job_support = make_multi_select_bar(df, job_task_multi_support, "Support / Resources Needed")

# ------------------------------
# 5) Build Dash Layout with Tabs and Three-Column Sections
# ------------------------------
external_stylesheets = [dbc.themes.FLATLY]
app = dash.Dash(__name__, external_stylesheets=external_stylesheets)
app.title = "Digital Sustainability Survey (2025) Dashboard"

# Build sections for single-select charts using our three-column layout
demographic_section = build_section_three_columns(demographic_figs)
awareness_section = build_section_three_columns(awareness_figs)
organization_section = build_section_three_columns(organization_figs)
job_task_section = build_section_three_columns(job_task_figs)

# Wrap aggregated multi-select graphs in cards for consistent styling.
org_multi_card_training = build_multi_card("Training/Resources Reasons", fig_org_training)
org_multi_card_dimensions = build_multi_card("Sustainability Dimensions Considered", fig_org_dimensions)

job_multi_card_drives = build_multi_card("Drives to Incorporate Sustainability", fig_job_drives)
job_multi_card_hinders = build_multi_card("Hindrances in Role-Specific Tasks", fig_hinders)
job_multi_card_knowledge = build_multi_card("Knowledge Gaps in Tasks", fig_job_knowledge)
job_multi_card_support = build_multi_card("Support / Resources Needed", fig_job_support)

# For Organization tab, add a row for the multi-select aggregates
organization_extra = dbc.Row([
    dbc.Col(org_multi_card_training, width=6),
    dbc.Col(org_multi_card_dimensions, width=6)
], className="mb-4")

# For Job & Tasks tab, add a row for the multi-select aggregates
job_task_extra = dbc.Row([
    dbc.Col(job_multi_card_drives, width=3),
    dbc.Col(job_multi_card_hinders, width=3),
    dbc.Col(job_multi_card_knowledge, width=3),
    dbc.Col(job_multi_card_support, width=3)
], className="mb-4")

# Assemble the overall layout with tabs and extra spacing
app.layout = dbc.Container([
    html.H1("Digital Sustainability Survey (2025)", className="text-center my-4"),
    html.Div(
        dcc.Tabs([
            dcc.Tab(label="Demographic", children=demographic_section),
            dcc.Tab(label="General Awareness", children=dbc.Container([
                awareness_section
            ], fluid=True)),
            dcc.Tab(label="Role in Organization", children=dbc.Container([
                organization_section,
                organization_extra
            ], fluid=True)),
            dcc.Tab(label="Sustainability in Your Job & Tasks", children=dbc.Container([
                job_task_section,
                job_task_extra
            ], fluid=True))
        ]),
        style={"marginTop": "40px"}
    )
], fluid=True)

if __name__ == "__main__":
    app.run(debug=True)
