# app.py
import dash
from dash import dcc, html
import plotly.express as px
import pandas as pd

from analysis.data_preparation import load_single_year_data

# 1) Load single-year data (2025)
data_folder = "data"
year = 2025
df = load_single_year_data(data_folder, year)

# Define which columns are numeric (for histograms)
numeric_cols = ["years_of_experience", "num_sustainability_trainings"]

###############################################################################
# HELPER FUNCTIONS
###############################################################################
def make_bar_chart(df, col, title):
    """
    Create a bar chart for a categorical (or single-select) column.
    """
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = [col, "count"]
    fig = px.bar(counts, x=col, y="count", title=title)
    return fig

def make_histogram(df, col, title, bins=5):
    """
    Create a histogram for a numeric column.
    """
    fig = px.histogram(df, x=col, nbins=bins, title=title)
    return fig

def generate_chart(df, col, title=None):
    """
    Decide based on column name whether to create a histogram (for numeric)
    or a bar chart (for categorical).
    """
    if not title:
        title = f"{col} Distribution"
    if col in numeric_cols:
        return make_histogram(df, col, title)
    else:
        return make_bar_chart(df, col, title)

def make_multi_select_bar(df, cols, title):
    """
    For a group of columns (e.g. multiple-select questions), count how many rows
    have a non-null response in each column and display a single bar chart.
    """
    data = []
    for c in cols:
        count_val = df[c].notna().sum()
        data.append((c, count_val))
    df_data = pd.DataFrame(data, columns=["option", "count"])
    fig = px.bar(df_data, x="option", y="count", title=title)
    return fig

def build_section(fig_pairs):
    """
    Given a list of (column name, figure) pairs, return a list of HTML elements
    (a heading and a graph) for that section.
    """
    content = []
    for col, fig in fig_pairs:
        content.append(html.H4(col))
        content.append(dcc.Graph(figure=fig))
    return content

###############################################################################
# 2) DEFINE COLUMN GROUPS FOR TABS
###############################################################################
# Tab 1: Demographics
demographic_cols = [
    "age_group",
    "years_of_experience",
    "continent",
    "country_residence_1"  # Use the first instance only
]

# Tab 2: Training - Single Select (Yes/No or similar)
training_single_cols = [
    "participated_sustainability_training",
    "satisfied_num_trainings"
]

# Tab 3: Training - Multi Select (Reasons for not participating)
training_multi_cols = [
    "no_training_reason_aware",
    "no_training_reason_org_no",
    "no_training_reason_no_opportunity",
    "no_training_reason_no_need",
    "no_training_reason_cost",
    "no_training_reason_other"
]

# Tab 4: Organization
organization_cols = [
    "org_sustainability_goals",
    "org_csr_expert_team",
    "org_incorporates_sustainability",
    "org_coordination_on_sustainability",
    # Dimensions (we group these as multi-select; you could also show them individually)
    "org_dim_env",
    "org_dim_social",
    "org_dim_individual",
    "org_dim_economic",
    "org_dim_technical",
    "org_dim_notsure",
    "org_dim_other",
    # Additional Org Info
    "org_reports_sustainability",
    "org_offers_sustainability_training",
    "org_training_resources_description",
    # Potential reasons for lack of training/resources within org context:
    "org_reason_no_training_awareness",
    "org_reason_no_training_need",
    "org_reason_no_training_demand",
    "org_reason_no_training_budget",
    "org_reason_no_training_priority",
    "org_reason_no_training_notsure",
    "org_reason_no_training_other",
    # Customer requirements:
    "customer_requires_sustainability",
    "why_customers_not_asking"
]

# Tab 5: Personal Tasks
personal_cols = [
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

# Tab 6: Hinders
hinder_cols = [
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

# Tab 7: Knowledge Gaps
knowledge_cols = [
    "lack_knowledge_env",
    "lack_knowledge_social",
    "lack_knowledge_individual",
    "lack_knowledge_economic",
    "lack_knowledge_technical",
    "lack_knowledge_other"
]

# Tab 8: Support / Resources
support_cols = [
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

# Additionally, you have a column for frequency of discussions:
discussions_cols = [
    "frequency_sustainability_discussions",
    "frequency_sustainability_discussions_other"
]

###############################################################################
# 3) CREATE FIGURES FOR EACH TAB
###############################################################################

# Create figures for each category (each returns a list of (col, fig) pairs)
demographic_figs = [(col, generate_chart(df, col, title=f"{col} Distribution")) for col in demographic_cols if col in df.columns]
training_single_figs = [(col, generate_chart(df, col, title=f"{col} Distribution")) for col in training_single_cols if col in df.columns]
# For numeric columns in training (if any)
# Multi-select for training reasons:
fig_training_multi = make_multi_select_bar(df, training_multi_cols, "Reasons for Not Participating in Training")

organization_figs = [(col, generate_chart(df, col, title=f"{col} Distribution")) for col in organization_cols if col in df.columns]
personal_figs = [(col, generate_chart(df, col, title=f"{col} Distribution")) for col in personal_cols if col in df.columns]
hinder_figs = [(col, generate_chart(df, col, title=f"{col} Distribution")) for col in hinder_cols if col in df.columns]
knowledge_figs = [(col, generate_chart(df, col, title=f"{col} Distribution")) for col in knowledge_cols if col in df.columns]
support_figs = [(col, generate_chart(df, col, title=f"{col} Distribution")) for col in support_cols if col in df.columns]
discussions_figs = [(col, generate_chart(df, col, title=f"{col} Distribution")) for col in discussions_cols if col in df.columns]

###############################################################################
# 4) BUILD DASH LAYOUT WITH TABS
###############################################################################
app = dash.Dash(__name__)
app.title = "Digital Sustainability Survey (2025) Dashboard"

app.layout = html.Div([
    html.H1("Digital Sustainability Survey (2025)"),
    dcc.Tabs([
        dcc.Tab(label="Demographics", children=build_section(demographic_figs)),
        dcc.Tab(label="Training (Single)", children=build_section(training_single_figs)),
        dcc.Tab(label="Training (Multi)", children=[
            html.H3("Reasons for Not Participating in Training"),
            dcc.Graph(figure=fig_training_multi)
        ]),
        dcc.Tab(label="Organization", children=build_section(organization_figs)),
        dcc.Tab(label="Personal Tasks", children=build_section(personal_figs)),
        dcc.Tab(label="Hinders", children=build_section(hinder_figs)),
        dcc.Tab(label="Knowledge Gaps", children=build_section(knowledge_figs)),
        dcc.Tab(label="Support / Resources", children=build_section(support_figs)),
        dcc.Tab(label="Discussions", children=build_section(discussions_figs))
    ])
])

if __name__ == "__main__":
    app.run(debug=True)
