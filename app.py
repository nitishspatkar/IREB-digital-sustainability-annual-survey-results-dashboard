# app.py
import dash
from dash import dcc, html, Input, Output
import dash_bootstrap_components as dbc
import plotly.express as px
import pandas as pd
import plotly.graph_objects as go  # Added for more advanced plotting
import re

from analysis.data_preparation import load_single_year_data
from rename_config import rename_mapping
from collections import defaultdict


# ---- Centralized Color and Style Variables ----
STYLE_VARS = {
    "PRIMARY_COLOR": "#831E82",
    "SECONDARY_COLOR": "#A450A3",
    "TERTIARY_COLOR": "#C581C4",
    "QUATERNARY_COLOR": "#E6B3E5",
    "BACKGROUND_COLOR": "#f8f9fa",
    "CARD_HEADER_COLOR": "#831E82",
    "FONT_FAMILY": "Helvetica",
    "FONT_SIZE": 12,
    "CARD_MARGIN": "mb-4",
    "ROW_MARGIN": "mb-5 g-4",
}

# Color palette for charts
MULTI_COLOR_PALETTE = [
    STYLE_VARS["PRIMARY_COLOR"],
    STYLE_VARS["SECONDARY_COLOR"],
    STYLE_VARS["TERTIARY_COLOR"],
    STYLE_VARS["QUATERNARY_COLOR"]
]

PRIMARY_COLOR = STYLE_VARS["PRIMARY_COLOR"]

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
def create_no_data_figure(title=""):
    """Create a placeholder figure when no data is available."""
    fig = go.Figure()
    
    # Add a centered text annotation
    fig.add_annotation(
        text="No data available",
        x=0.5, y=0.5,
        xref="paper", yref="paper",
        showarrow=False,
        font=dict(size=16, color="gray"),
    )
    
    # Update layout for a clean, empty look
    fig.update_layout(
        title=title,
        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=10, r=10, t=50, b=10),
        height=300
    )
    
    return fig

def make_bar_chart(df, col, title, horizontal=False):
    """Create a bar chart for a categorical (or single-select) column using the theme color."""
    # Check if we have data
    if df[col].notna().sum() == 0:
        return create_no_data_figure(title)
    
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = [col, "count"]
    
    # If all values are NaN or missing, return a placeholder
    if counts.shape[0] == 0 or (counts.shape[0] == 1 and pd.isna(counts[col].iloc[0])):
        return create_no_data_figure(title)
    
    if horizontal:
        # Sort by count for horizontal bar charts (best practice)
        counts = counts.sort_values("count")
        fig = px.bar(
            counts,
            y=col,  # Swapped x/y for horizontal
            x="count",
            title=title,
            template="plotly_white",
            color_discrete_sequence=[PRIMARY_COLOR]
        )
        fig.update_layout(
            yaxis_title=col.replace("_", " ").title(), 
            xaxis_title="Count",
            height=350,  # Better height for horizontal bars
            margin=dict(l=10, r=10, t=50, b=10),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(family="Helvetica", size=12)
        )
    else:
        fig = px.bar(
            counts,
            x=col,
            y="count",
            title=title,
            template="plotly_white",
            color_discrete_sequence=[PRIMARY_COLOR]
        )
        fig.update_layout(
            xaxis_title=col.replace("_", " ").title(), 
            yaxis_title="Count",
            margin=dict(l=10, r=10, t=50, b=10),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(family="Helvetica", size=12)
        )
    return fig

def make_pie_chart(df, col, title):
    """Create a pie chart for a categorical column."""
    # Check if we have data
    if df[col].notna().sum() == 0:
        return create_no_data_figure(title)
    
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = [col, "count"]
    
    # If all values are NaN or missing, return a placeholder
    if counts.shape[0] == 0 or (counts.shape[0] == 1 and pd.isna(counts[col].iloc[0])):
        return create_no_data_figure(title)
    
    # Calculate percentages
    total = counts["count"].sum()
    counts["percentage"] = counts["count"] / total * 100
    
    # Create chart with hover template showing both count and percentage
    fig = px.pie(
        counts,
        names=col,
        values="count",
        title=title,
        template="plotly_white",
        color_discrete_sequence=[PRIMARY_COLOR, "#A450A3", "#C581C4", "#E6B3E5", "#F0C6F0"],
        hole=0.4
    )
    
    # Update traces to show percentages in the labels
    fig.update_traces(
        textposition='inside',
        textinfo='percent',
        hovertemplate='%{label}<br>Count: %{value}<br>Percentage: %{percent:.1f}%<extra></extra>'
    )
    
    fig.update_layout(
        margin=dict(l=10, r=10, t=50, b=100),  # Increased bottom margin for legend
        legend=dict(
            orientation="h",
            yanchor="bottom", 
            y=-0.5,  # Moved legend further down
            xanchor="center", 
            x=0.5
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Helvetica", size=12),
        height=500  # Increased height from 350 to 500
    )
    # Add total count in the center
    fig.add_annotation(
        text=f"Total<br>{total}",
        x=0.5, y=0.5,
        font_size=15,
        showarrow=False
    )
    return fig

def make_donut_chart(df, col, title):
    """Create a donut chart for a categorical column."""
    # Check if we have data
    if df[col].notna().sum() == 0:
        return create_no_data_figure(title)
    
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = [col, "count"]
    
    # If all values are NaN or missing, return a placeholder
    if counts.shape[0] == 0 or (counts.shape[0] == 1 and pd.isna(counts[col].iloc[0])):
        return create_no_data_figure(title)
    
    # Calculate percentages
    total = counts["count"].sum()
    counts["percentage"] = counts["count"] / total * 100
    
    # Create chart with hover template showing both count and percentage
    fig = px.pie(
        counts,
        names=col,
        values="count",
        title=title,
        template="plotly_white",
        color_discrete_sequence=[PRIMARY_COLOR, "#A450A3", "#C581C4", "#E6B3E5", "#F0C6F0"],
        hole=0.4
    )
    
    # Update traces to show percentages in the labels
    fig.update_traces(
        textposition='inside',
        textinfo='percent',
        hovertemplate='%{label}<br>Count: %{value}<br>Percentage: %{percent:.1f}%<extra></extra>'
    )
    
    fig.update_layout(
        margin=dict(l=10, r=10, t=50, b=100),  # Increased bottom margin for legend
        legend=dict(
            orientation="h",
            yanchor="bottom", 
            y=-0.5,  # Moved legend further down
            xanchor="center", 
            x=0.5
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Helvetica", size=12),
        height=500  # Increased height from 350 to 500
    )
    # Add total count in the center
    fig.add_annotation(
        text=f"Total<br>{total}",
        x=0.5, y=0.5,
        font_size=15,
        showarrow=False
    )
    return fig

def make_histogram(df, col, title, bins=10, kde=True):
    """Create a histogram for a numeric column with option for KDE curve."""
    # Check if we have sufficient numeric data (at least 3 values)
    numeric_values = pd.to_numeric(df[col], errors='coerce')
    valid_data_count = numeric_values.notna().sum()
    
    if valid_data_count < 3:
        return create_no_data_figure(title)
    
    if kde:
        # Create a histogram with KDE curve overlay
        hist_data = numeric_values.dropna()
        fig = go.Figure()
        
        # Add histogram
        fig.add_trace(go.Histogram(
            x=hist_data,
            nbinsx=bins,
            marker_color=PRIMARY_COLOR,
            opacity=0.7,
            name="Count"
        ))
        
        # Update layout
        fig.update_layout(
            title=title,
            xaxis_title=col.replace("_", " ").title(),
            yaxis_title="Frequency",
            template="plotly_white",
            margin=dict(l=10, r=10, t=50, b=10),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(family="Helvetica", size=12)
        )
    else:
        # Standard histogram
        fig = px.histogram(
            df,
            x=numeric_values,
            nbins=bins,
            title=title,
            template="plotly_white",
            color_discrete_sequence=[PRIMARY_COLOR]
        )
        fig.update_layout(
            xaxis_title=col.replace("_", " ").title(), 
            yaxis_title="Frequency",
            margin=dict(l=10, r=10, t=50, b=10),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(family="Helvetica", size=12)
        )
    return fig

def make_world_map(df, col, title):
    """Create a choropleth map for countries or continents."""
    # Check if we have data
    if df[col].notna().sum() == 0:
        return create_no_data_figure(title)
    
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = [col, "count"]
    
    # If all values are NaN or missing, return a placeholder
    if counts.shape[0] == 0 or (counts.shape[0] == 1 and pd.isna(counts[col].iloc[0])):
        return create_no_data_figure(title)
    
    # For continents, we'll use a simplified approach
    if col == "continent":
        fig = px.choropleth(
            counts,
            locations=col,
            locationmode="country names",  # Assuming continent names are standard
            color="count",
            color_continuous_scale=px.colors.sequential.Purp,
            title=title
        )
    else:  # For countries
        fig = px.choropleth(
            counts,
            locations=col,
            locationmode="country names",
            color="count",
            color_continuous_scale=px.colors.sequential.Purp,
            title=title
        )
    
    fig.update_layout(
        geo=dict(
            showframe=False,
            showcoastlines=True,
            projection_type='natural earth'
        ),
        margin=dict(l=0, r=0, t=50, b=0),
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Helvetica", size=12)
    )
    return fig

def generate_chart(df, col, title=None, chart_type='auto'):
    """Automatically generate an appropriate chart based on data type or specified chart type."""
    if not title:
        title = f"{col.replace('_', ' ').title()} Distribution"
    
    # Create a copy of the dataframe to avoid modifying the original
    df_copy = df.copy()
    
    # Handle numeric conversions for known numeric columns
    if col in numeric_cols:
        df_copy[col] = pd.to_numeric(df_copy[col], errors='coerce')
    
    # Check if we have at least some data
    if df_copy[col].count() == 0:
        return create_no_data_figure(title)
    
    if chart_type == 'auto':
        # Automatically determine chart type
        if col in numeric_cols:
            return make_histogram(df_copy, col, title, kde=True)
        elif col in ["continent", "country_residence_1"]:
            # Try a map for geographic data, fallback to bar if issues
            try:
                return make_world_map(df_copy, col, title)
            except Exception as e:
                print(f"Error creating map for {col}: {str(e)}")
                return make_bar_chart(df_copy, col, title, horizontal=True)
        else:
            # For other categorical data, use horizontal bar or pie based on number of categories
            unique_count = df_copy[col].nunique()
            if unique_count <= 5:
                return make_donut_chart(df_copy, col, title)
            else:
                return make_bar_chart(df_copy, col, title, horizontal=True)
    elif chart_type == 'bar':
        return make_bar_chart(df_copy, col, title)
    elif chart_type == 'bar_h':
        return make_bar_chart(df_copy, col, title, horizontal=True)
    elif chart_type == 'histogram':
        if col in numeric_cols:
            return make_histogram(df_copy, col, title)
        else:
            print(f"Warning: Tried to make histogram of non-numeric column {col}")
            return make_bar_chart(df_copy, col, title)
    elif chart_type == 'pie':
        return make_pie_chart(df_copy, col, title)
    elif chart_type == 'donut':
        return make_donut_chart(df_copy, col, title)
    elif chart_type == 'map':
        return make_world_map(df_copy, col, title)
    else:
        # Default to bar chart
        return make_bar_chart(df_copy, col, title)

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
    For a group of columns representing a multi-select question, count non-empty responses,
    aggregate counts by a simplified label (so that duplicate labels are combined), and
    return a single bar chart.
    """
    # Check if we have any data
    has_data = False
    for c in cols:
        if c in df.columns and df[c].notna().sum() > 0:
            has_data = True
            break
    
    if not has_data:
        return create_no_data_figure(title)
    
    counts_dict = defaultdict(int)
    for c in cols:
        if c in df.columns:
            count_val = df[c].notna().sum()
            # Simplify the label (this removes common prefixes)
            option_text = simplify_label(c)
            counts_dict[option_text] += count_val
    
    # Convert to DataFrame and sort by count in descending order
    df_data = pd.DataFrame(list(counts_dict.items()), columns=["Option", "Count"])
    df_data = df_data.sort_values("Count", ascending=False)
    
    # Calculate percentages
    total_responses = len(df)
    df_data["Percentage"] = df_data["Count"].apply(lambda x: f"{round(x/total_responses*100)}%")
    
    # Create a horizontal bar chart
    fig = px.bar(
        df_data,
        y="Option",
        x="Count",
        title=title,
        template="plotly_white",
        color_discrete_sequence=MULTI_COLOR_PALETTE,
        text="Percentage"  # Show percentage on the bars
    )
    
    fig.update_traces(
        textposition='inside',
        insidetextanchor='middle',
        hovertemplate='%{y}<br>Count: %{x}<extra></extra>'
    )
    
    fig.update_layout(
        yaxis_title="", 
        xaxis_title="Count",
        height=max(300, 50 * len(df_data)),  # Dynamic height based on number of options
        margin=dict(l=10, r=10, t=50, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Helvetica", size=12)
    )
    return fig

def build_stat_card(title, value, icon_class="bi-info-circle", trend=None, subtitle=None):
    """Create a card with a key statistic and optional trend and subtitle."""
    card_content = [
        dbc.CardHeader([
            html.I(className=f"bi {icon_class} me-2"),
            html.Span(title)
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
    return dbc.Card(card_content, className="shadow-sm h-100")

def build_chart_card(title, fig, column_width=12, className="mb-4"):
    """Wraps a plotly figure in a Bootstrap card with custom styling."""
    return dbc.Col(
        dbc.Card([
            dbc.CardHeader(
                html.H5(title, className="card-title"),
                className="card-header-primary" 
            ),
            dbc.CardBody(
                dcc.Graph(figure=fig, config={'displayModeBar': False})
            )
        ], className="shadow-sm h-100"),
        width=column_width,
        className=className
    )

def build_card(col, fig):
    """
    Wraps an individual graph in a Bootstrap card.
    Uses the full question text (from reverse_mapping) for the header.
    """
    question_text = reverse_mapping.get(col, col.replace("_", " ").title())
    return dbc.Card(
        [
            dbc.CardHeader(
                html.H5(question_text, className="card-title"),
                className="card-header-primary"
            ),
            dbc.CardBody(dcc.Graph(figure=fig, config={'displayModeBar': False}))
        ],
        className="mb-4 shadow-sm"
    )

def build_multi_card(title, fig):
    return dbc.Card(
        [
            dbc.CardHeader(
                html.H5(title, className="card-title"),
                className="card-header-primary"
            ),
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
external_stylesheets = [dbc.themes.YETI, dbc.icons.BOOTSTRAP]  # MODIFIED: Added Bootstrap icons
app = dash.Dash(__name__, external_stylesheets=external_stylesheets)
app.title = "Digital Sustainability Insights Dashboard"

# Demographics page key stats and charts
def build_demographics_page():
    # Key statistics for demographics
    most_common_age = df["age_group"].value_counts().idxmax()
    
    # Convert years_of_experience to numeric with error handling
    try:
        # Convert to numeric, coerce errors (convert invalid values to NaN)
        numeric_years = pd.to_numeric(df["years_of_experience"], errors='coerce')
        avg_experience = round(numeric_years.mean(), 1)
    except:
        # Fallback if conversion fails
        avg_experience = "N/A"
    
    total_respondents = len(df)
    num_countries = df["country_residence_1"].nunique()
    
    # Top row - Key statistics - Convert numbers to strings and add more padding
    stats_row = dbc.Row([
        dbc.Col(build_stat_card("Total Respondents", str(total_respondents), "bi-people-fill"), width=3, className="px-2"),
        dbc.Col(build_stat_card("Avg. Years Experience", str(avg_experience), "bi-briefcase-fill"), width=3, className="px-2"),
        dbc.Col(build_stat_card("Most Common Age Group", most_common_age, "bi-person-fill"), width=3, className="px-2"),
        dbc.Col(build_stat_card("Countries Represented", str(num_countries), "bi-globe"), width=3, className="px-2")
    ], className="mb-5 g-4")  # Increased spacing between cards and bottom margin
    
    # Create charts with appropriate visualization types - remove titles from the charts themselves
    age_fig = generate_chart(df, "age_group", "", 'bar_h')
    
    # Make a copy of the dataframe with the numeric column for the histogram
    df_numeric = df.copy()
    df_numeric["years_of_experience"] = df_numeric["years_of_experience"].apply(parse_experience)
    experience_fig = make_histogram(df_numeric, "years_of_experience", "", kde=True)
    
    # Try map first, fallback to horizontal bar if issues
    try:
        geo_fig = generate_chart(df, "country_residence_1", "", 'map')
    except:
        geo_fig = generate_chart(df, "country_residence_1", "", 'bar_h')
    
    role_fig = generate_chart(df, "role", "", 'donut')
    org_fig = generate_chart(df, "organization_type", "", 'donut')
    
    # Create a custom bar chart for application domain with more height
    counts = df["application_domain"].value_counts(dropna=False).reset_index()
    counts.columns = ["application_domain", "count"]
    counts = counts.sort_values("count")
    domain_fig = px.bar(
        counts,
        y="application_domain",
        x="count",
        title="",  # Empty title
        template="plotly_white",
        color_discrete_sequence=[PRIMARY_COLOR]
    )
    domain_fig.update_layout(
        yaxis_title="Application Domain", 
        xaxis_title="Count",
        height=400,  # Taller to accommodate all categories
        margin=dict(l=10, r=10, t=50, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Helvetica", size=12)
    )
    
    # Charts rows - add more spacing between rows with mb-5
    row1 = dbc.Row([
        build_chart_card("Age Group", age_fig, 6),
        build_chart_card("Years of Experience", experience_fig, 6)
    ], className="mb-5 g-3")  # Increased margin-bottom
    
    row2 = dbc.Row([
        build_chart_card("Geographic Distribution", geo_fig, 6)
    ], className="mb-5 g-3")  # Increased margin-bottom
    
    # Put the two pie charts side by side in their own row with more spacing
    row3 = dbc.Row([
        build_chart_card("Professional Role", role_fig, 6),
        build_chart_card("Organization Type", org_fig, 6)
    ], className="mb-5 g-4")  # Increased margin-bottom
    
    # Give the Application Domain bar chart its own row with full width
    row4 = dbc.Row([
        build_chart_card("Application Domain", domain_fig, 6)
    ], className="mb-5 g-3")  # Increased margin-bottom
    
    return html.Div([stats_row, row1, row2, row3, row4])

# Sections (figures remain the same, but will use new colors internally)
demographic_section = build_section_three_columns(demographic_figs)
awareness_section = build_section_three_columns(awareness_figs)
organization_section_single = build_section_three_columns(organization_figs)
job_task_section_single = build_section_three_columns(job_task_figs)

# Multi-select cards (remain the same, but will have styled headers)
org_multi_card_training = build_multi_card("Training/Resources Reasons", fig_org_training)
org_multi_card_dimensions = build_multi_card("Sustainability Dimensions Considered", fig_org_dimensions)
job_multi_card_drives = build_multi_card("Drives to Incorporate Sustainability", fig_job_drives)
job_multi_card_hinders = build_multi_card("Hindrances in Role-Specific Tasks", fig_hinders)
job_multi_card_knowledge = build_multi_card("Knowledge Gaps in Tasks", fig_job_knowledge)
job_multi_card_support = build_multi_card("Support / Resources Needed", fig_job_support)

# Group multi-select cards into rows for layout
organization_multi_section = dbc.Row([
    dbc.Col(org_multi_card_training, width=6),
    dbc.Col(org_multi_card_dimensions, width=6)
], className="mb-4")

job_task_multi_section = dbc.Row([
    dbc.Col(job_multi_card_drives, width=6, className="mb-3"),
    dbc.Col(job_multi_card_hinders, width=6, className="mb-3"),
    dbc.Col(job_multi_card_knowledge, width=6, className="mb-3"),
    dbc.Col(job_multi_card_support, width=6, className="mb-3")
], className="mb-4")


# Sidebar style
SIDEBAR_STYLE = {
    "position": "fixed",
    "top": 0,
    "left": 0,
    "bottom": 0,
    "width": "20rem",
    "padding": "2rem 1rem",
    "background-color": STYLE_VARS["PRIMARY_COLOR"],
    "color": "white",
    "overflow-y": "auto"
}

# Content style
CONTENT_STYLE = {
    "margin-left": "22rem",
    "margin-right": "2rem",
    "padding": "2rem 1rem",
    "background-color": STYLE_VARS["BACKGROUND_COLOR"],
}

sidebar = html.Div(
    [
        html.H2("Digital", className="display-5", style={"color": "white"}),
        html.H4("Sustainability", className="mb-1", style={"color": "white", "font-weight": "lighter"}),
        html.P("2025 Survey Analysis", className="text-light small", style={"opacity": 0.8}),
        html.Hr(style={"border-color": "rgba(255, 255, 255, 0.3)"}),
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
    style=SIDEBAR_STYLE,
)

content = html.Div(id="page-content", style=CONTENT_STYLE)

app.layout = dbc.Container([
    dcc.Location(id="url", refresh=False),
    sidebar,
    content,
], fluid=True, style={"min-height": "100vh", "background-color": "#f8f9fa"})


# Callback to update page content based on sidebar navigation
@app.callback(Output("page-content", "children"), [Input("url", "pathname")])
def render_page_content(pathname):
    page_title_style = {"color": PRIMARY_COLOR, "border-bottom": f"2px solid {PRIMARY_COLOR}", "padding-bottom": "0.5rem"}
    if pathname == "/":
        return dbc.Container([
            html.H3("Demographic Profile", className="mb-4 pt-3", style=page_title_style),
            build_demographics_page()
        ], fluid=True)
    elif pathname == "/awareness":
        return dbc.Container([
            html.H3("General Awareness of Sustainability", className="mb-4 pt-3", style=page_title_style),
            build_awareness_page()
        ], fluid=True)
    elif pathname == "/organization":
        return dbc.Container([
            html.H3("The Role of Digital Sustainability in Your Organization", className="mb-4 pt-3", style=page_title_style),
            build_organization_page()
        ], fluid=True)
    elif pathname == "/job-tasks":
        return dbc.Container([
            html.H3("Sustainability in Your Job and Tasks", className="mb-4 pt-3", style=page_title_style),
            build_job_tasks_page()
        ], fluid=True)
    # If the user tries to reach a different page, return a 404 message
    return dbc.Container(
        [
            html.H1("404: Not found", className="text-danger"),
            html.Hr(),
            html.P(f"The pathname {pathname} was not recognised..."),
            dbc.Button("Go to Homepage", href="/", color="primary", className="mt-3")
        ],
        className="py-5 text-center",
    )

# -----------------------------
# Build the General Awareness page
# -----------------------------
def build_awareness_page():
    # Calculate key statistics for General Awareness
    heard_of_def_count = df["heard_of_definition"].value_counts().get("Yes", 0)
    total_valid_responses = df["heard_of_definition"].notna().sum()
    heard_of_def_percentage = round((heard_of_def_count / total_valid_responses * 100) if total_valid_responses > 0 else 0)
    
    training_participation = df["participated_sustainability_training"].value_counts().get("Yes", 0)
    training_total = df["participated_sustainability_training"].notna().sum()
    training_percentage = round((training_participation / training_total * 100) if training_total > 0 else 0)
    
    avg_trainings_numeric = pd.to_numeric(df["num_sustainability_trainings"], errors='coerce')
    avg_trainings = round(avg_trainings_numeric.mean(), 1) if not pd.isna(avg_trainings_numeric.mean()) else "N/A"
    
    # Top statistics row
    stats_row = dbc.Row([
        dbc.Col(build_stat_card(
            "Familiar with Definition", f"{heard_of_def_percentage}%", "bi-info-circle", subtitle=f"{heard_of_def_count} out of {total_valid_responses}"
        ), width=4, className="px-2"),
        dbc.Col(build_stat_card(
            "Training Participation", f"{training_percentage}%", "bi-book-fill", subtitle=f"{training_participation} out of {training_total}"
        ), width=4, className="px-2"),
        dbc.Col(build_stat_card(
            "Avg. Trainings Taken", str(avg_trainings), "bi-award-fill"
        ), width=4, className="px-2"),
    ], className="mb-5 g-4")
    
    # Create visualizations with appropriate types for each data point
    # Definition awareness - donut chart for yes/no
    definition_fig = make_donut_chart(df, "heard_of_definition", "")
    
    # Frequency of discussions - horizontal bar
    freq_discussions_fig = make_bar_chart(df, "frequency_sustainability_discussions", "", horizontal=True)
    
    # Training participation - donut chart for yes/no
    training_fig = make_donut_chart(df, "participated_sustainability_training", "")
    
    # Satisfaction with trainings - donut chart
    satisfaction_fig = make_donut_chart(df, "satisfied_num_trainings", "")
    
    # Number of trainings - histogram
    df_numeric = df.copy()
    df_numeric["num_sustainability_trainings"] = pd.to_numeric(df_numeric["num_sustainability_trainings"], errors='coerce')
    num_trainings_fig = make_histogram(df_numeric, "num_sustainability_trainings", "", bins=6)
    
    # First row of charts
    row1 = dbc.Row([
        build_chart_card("Are you familiar with the definition of Digital Sustainability?", definition_fig, 6),
        build_chart_card("How frequently do you encounter discussions about digital sustainability?", freq_discussions_fig, 6)
    ], className="mb-5 g-4")
    
    # Second row of charts
    row2 = dbc.Row([
        build_chart_card("Have you participated in sustainability training?", training_fig, 4),
        build_chart_card("Are you satisfied with the number of trainings?", satisfaction_fig, 4),
        build_chart_card("Number of sustainability trainings taken", num_trainings_fig, 4)
    ], className="mb-5 g-4")
    
    return html.Div([stats_row, row1, row2])

# -----------------------------
# Build the Organization Role page
# -----------------------------
def build_organization_page():
    # Calculate key statistics for Organization section
    has_sustainability_goals = df["org_sustainability_goals"].value_counts().get("Yes", 0)
    total_goals_responses = df["org_sustainability_goals"].notna().sum()
    goals_percentage = round((has_sustainability_goals / total_goals_responses * 100) if total_goals_responses > 0 else 0)
    
    has_csr_team = df["org_csr_expert_team"].value_counts().get("Yes", 0)
    total_csr_responses = df["org_csr_expert_team"].notna().sum()
    csr_percentage = round((has_csr_team / total_csr_responses * 100) if total_csr_responses > 0 else 0)
    
    offers_training = df["org_offers_sustainability_training"].value_counts().get("Yes", 0)
    total_training_responses = df["org_offers_sustainability_training"].notna().sum()
    training_percentage = round((offers_training / total_training_responses * 100) if total_training_responses > 0 else 0)
    
    # Top statistics row
    stats_row = dbc.Row([
        dbc.Col(build_stat_card(
            "Have Sustainability Goals", f"{goals_percentage}%", "bi-bullseye", subtitle=f"{has_sustainability_goals} out of {total_goals_responses}"
        ), width=4, className="px-2"),
        dbc.Col(build_stat_card(
            "Have CSR/Sustainability Team", f"{csr_percentage}%", "bi-people-fill", subtitle=f"{has_csr_team} out of {total_csr_responses}"
        ), width=4, className="px-2"),
        dbc.Col(build_stat_card(
            "Offer Sustainability Training", f"{training_percentage}%", "bi-mortarboard-fill", subtitle=f"{offers_training} out of {total_training_responses}"
        ), width=4, className="px-2"),
    ], className="mb-5 g-4")
    
    # Create visualizations with appropriate types for each data point
    # Organization Sustainability Goals - Donut chart
    goals_fig = make_donut_chart(df, "org_sustainability_goals", "")
    
    # CSR Expert Team - Donut chart
    csr_fig = make_donut_chart(df, "org_csr_expert_team", "")
    
    # Incorporation of Sustainability - Donut chart
    incorporation_fig = make_donut_chart(df, "org_incorporates_sustainability", "")
    
    # Coordination on Sustainability - Bar chart
    coordination_fig = make_bar_chart(df, "org_coordination_on_sustainability", "", horizontal=True)
    
    # Reports Sustainability - Donut chart
    reports_fig = make_donut_chart(df, "org_reports_sustainability", "")
    
    # Offers Training - Donut chart
    offers_training_fig = make_donut_chart(df, "org_offers_sustainability_training", "")
    
    # Customer Requires Sustainability - Donut chart
    customer_requires_fig = make_donut_chart(df, "customer_requires_sustainability", "")
    
    # Multi-select figures - use make_multi_select_bar with better formatting
    
    # Reasons for no training
    no_training_reasons_fig = make_multi_select_bar(df, org_multi_training, "")
    
    # Sustainability dimensions considered
    dimensions_fig = make_multi_select_bar(df, org_multi_dimensions, "")
    
    # First row of charts - 3 key yes/no questions
    row1 = dbc.Row([
        build_chart_card("Does your organization have specific digital sustainability goals?", goals_fig, 4),
        build_chart_card("Does your organization have a CSR/sustainability expert or team?", csr_fig, 4),
        build_chart_card("Does your organization incorporate sustainability in projects?", incorporation_fig, 4)
    ], className="mb-5 g-4")
    
    # Second row of charts - coordination and reporting
    row2 = dbc.Row([
        build_chart_card("Is there coordination on sustainability for development projects?", coordination_fig, 6),
        build_chart_card("Does your organization report on sustainability efforts?", reports_fig, 6)
    ], className="mb-5 g-4")
    
    # Third row of charts - training and customer requirements
    row3 = dbc.Row([
        build_chart_card("Does your organization offer sustainability training?", offers_training_fig, 6),
        build_chart_card("Do customers require sustainability considerations?", customer_requires_fig, 6)
    ], className="mb-5 g-4")
    
    # Fourth row - Multi-select data
    row4 = dbc.Row([
        dbc.Col([
            html.H4("Sustainability Dimensions Considered", className="mt-4 mb-3", style={"color": PRIMARY_COLOR}),
            dcc.Graph(figure=dimensions_fig, config={'displayModeBar': False})
        ], width=6, className="mb-5"),
        dbc.Col([
            html.H4("Reasons for Not Offering Training/Resources", className="mt-4 mb-3", style={"color": PRIMARY_COLOR}),
            dcc.Graph(figure=no_training_reasons_fig, config={'displayModeBar': False})
        ], width=6, className="mb-5")
    ], className="mb-5")
    
    return html.Div([stats_row, row1, row2, row3, row4])

# -----------------------------
# Build the Job & Tasks page
# -----------------------------
def build_job_tasks_page():
    # Calculate key statistics for Job & Tasks section
    incorporates_in_tasks = df["incorporate_sustainability_in_tasks"].value_counts().get("Yes", 0)
    total_tasks_responses = df["incorporate_sustainability_in_tasks"].notna().sum()
    incorporate_percentage = round((incorporates_in_tasks / total_tasks_responses * 100) if total_tasks_responses > 0 else 0)
    
    uses_tools = df["tools_for_sustainability"].value_counts().get("Yes", 0)
    total_tools_responses = df["tools_for_sustainability"].notna().sum()
    tools_percentage = round((uses_tools / total_tools_responses * 100) if total_tools_responses > 0 else 0)
    
    # Top statistics row
    stats_row = dbc.Row([
        dbc.Col(build_stat_card(
            "Incorporate Sustainability", f"{incorporate_percentage}%", "bi-check-circle-fill", 
            subtitle=f"{incorporates_in_tasks} out of {total_tasks_responses}"
        ), width=6, className="px-2"),
        dbc.Col(build_stat_card(
            "Use Sustainability Tools", f"{tools_percentage}%", "bi-tools", 
            subtitle=f"{uses_tools} out of {total_tools_responses}"
        ), width=6, className="px-2"),
    ], className="mb-5 g-4")
    
    # Create visualizations for primary questions
    incorporate_fig = make_donut_chart(df, "incorporate_sustainability_in_tasks", "")
    tools_fig = make_donut_chart(df, "tools_for_sustainability", "")
    
    # Multi-select figures with improved horizontal bar charts
    drivers_fig = make_multi_select_bar(df, job_task_multi_drives, "")
    hindrances_fig = make_multi_select_bar(df, job_task_multi_hinder, "")
    knowledge_fig = make_multi_select_bar(df, job_task_multi_knowledge, "")
    support_fig = make_multi_select_bar(df, job_task_multi_support, "")
    
    # First row of charts - two main questions
    row1 = dbc.Row([
        build_chart_card("Do you incorporate sustainability in your tasks?", incorporate_fig, 6),
        build_chart_card("Do you use specific tools for sustainability?", tools_fig, 6)
    ], className="mb-5 g-4")
    
    # Second row - Drivers and Hindrances
    row2 = dbc.Row([
        dbc.Col([
            html.H4("What drives you to incorporate sustainability?", className="mt-4 mb-3", style={"color": PRIMARY_COLOR}),
            dcc.Graph(figure=drivers_fig, config={'displayModeBar': False})
        ], width=6, className="mb-4")
    ], className="mb-5")
    
    # Third row - Hindrances
    row3 = dbc.Row([
        dbc.Col([
            html.H4("What hinders incorporating sustainability in your tasks?", className="mt-4 mb-3", style={"color": PRIMARY_COLOR}),
            dcc.Graph(figure=hindrances_fig, config={'displayModeBar': False})
        ], width=6, className="mb-4")
    ], className="mb-5")
    
    # Fourth row - Knowledge Gaps and Support Needed
    row4 = dbc.Row([
        dbc.Col([
            html.H4("In which areas do you lack knowledge?", className="mt-4 mb-3", style={"color": PRIMARY_COLOR}),
            dcc.Graph(figure=knowledge_fig, config={'displayModeBar': False})
        ], width=6, className="mb-4")
    ], className="mb-5")
    
    # Fifth row - Support/Resources Needed
    row5 = dbc.Row([
        dbc.Col([
            html.H4("What support or resources do you need?", className="mt-4 mb-3", style={"color": PRIMARY_COLOR}),
            dcc.Graph(figure=support_fig, config={'displayModeBar': False})
        ], width=6, className="mb-4")
    ], className="mb-5")
    
    # Prepare your chart info as (title, figure) pairs
    bar_charts = [
        ("What drives you to incorporate sustainability?", drivers_fig),
        ("What hinders incorporating sustainability in your tasks?", hindrances_fig),
        ("In which areas do you lack knowledge?", knowledge_fig),
        ("What support or resources do you need?", support_fig),
    ]

    # Use the helper to create two rows with two charts each
    bar_chart_rows = build_chart_grid(bar_charts, cards_per_row=2)

    return html.Div([stats_row, row1] + bar_chart_rows)

def parse_experience(val):
    import re
    import pandas as pd

    def parse_experience(val):
        if pd.isna(val):
            return None
        val = str(val).strip()
        # If already a number
        try:
            return float(val)
        except:
            pass
        # If range like "5-10"
        match = re.match(r"(\d+)\s*-\s*(\d+)", val)
        if match:
            low, high = map(int, match.groups())
            return (low + high) / 2
        # If "10+" or "10 or more"
        match = re.match(r"(\d+)\s*\+|(\d+)\s*or more", val)
        if match:
            return float(match.group(1) or match.group(2))
        return None

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
        rows.append(dbc.Row(row_cards, className="mb-5 g-4"))
    return rows

if __name__ == "__main__":
    app.run(debug=True)
