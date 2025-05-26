import plotly.express as px
import plotly.graph_objects as go
import pandas as pd

# Import color/style variables if needed
try:
    from layout import STYLE_VARS, MULTI_COLOR_PALETTE, PRIMARY_COLOR
except ImportError:
    # Fallbacks if layout.py is not yet available
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

def create_no_data_figure(title="No Data Available"):
    fig = go.Figure()
    fig.add_annotation(
        text="No data available",
        xref="paper", yref="paper",
        showarrow=False,
        font=dict(size=18, color="gray")
    )
    fig.update_layout(
        title=title,
        paper_bgcolor=STYLE_VARS["BACKGROUND_COLOR"],
        plot_bgcolor=STYLE_VARS["BACKGROUND_COLOR"],
        xaxis=dict(visible=False),
        yaxis=dict(visible=False),
        margin=dict(l=20, r=20, t=40, b=20),
        hovermode=False
    )
    fig.update_traces(hoverinfo="skip", hovertemplate=None)
    return fig

def make_bar_chart(df, col, title, horizontal=False):
    if col not in df or df[col].dropna().empty:
        return create_no_data_figure(title)
    counts = df[col].value_counts(dropna=False).sort_index()
    fig = go.Figure()
    if horizontal:
        fig.add_trace(go.Bar(
            y=counts.index.astype(str),
            x=counts.values,
            orientation='h',
            marker_color=PRIMARY_COLOR
        ))
    else:
        fig.add_trace(go.Bar(
            x=counts.index.astype(str),
            y=counts.values,
            marker_color=PRIMARY_COLOR
        ))
    fig.update_layout(
        title=title,
        paper_bgcolor=STYLE_VARS["BACKGROUND_COLOR"],
        plot_bgcolor=STYLE_VARS["BACKGROUND_COLOR"],
        font=dict(family=STYLE_VARS["FONT_FAMILY"], size=STYLE_VARS["FONT_SIZE"]),
        margin=dict(l=20, r=20, t=40, b=20),
        hovermode=False
    )
    fig.update_traces(hoverinfo="skip", hovertemplate=None)
    return fig

def make_pie_chart(df, col, title):
    if col not in df or df[col].dropna().empty:
        return create_no_data_figure(title)
    counts = df[col].value_counts(dropna=False)
    fig = px.pie(
        names=counts.index.astype(str),
        values=counts.values,
        title=title,
        color_discrete_sequence=MULTI_COLOR_PALETTE
    )
    fig.update_layout(
        paper_bgcolor=STYLE_VARS["BACKGROUND_COLOR"],
        font=dict(family=STYLE_VARS["FONT_FAMILY"], size=STYLE_VARS["FONT_SIZE"]),
        margin=dict(l=20, r=20, t=40, b=20),
        hovermode=False
    )
    fig.update_traces(hovertemplate=None)
    return fig

def make_donut_chart(df, col, title):
    if col not in df or df[col].dropna().empty:
        return create_no_data_figure(title)
    counts = df[col].value_counts(dropna=False)
    fig = px.pie(
        names=counts.index.astype(str),
        values=counts.values,
        hole=0.5,
        title=title,
        color_discrete_sequence=MULTI_COLOR_PALETTE
    )
    fig.update_traces(textinfo='percent+label')
    fig.update_layout(
        paper_bgcolor=STYLE_VARS["BACKGROUND_COLOR"],
        font=dict(family=STYLE_VARS["FONT_FAMILY"], size=STYLE_VARS["FONT_SIZE"]),
        margin=dict(l=20, r=20, t=40, b=20),
        hovermode=False
    )
    fig.update_traces(hovertemplate=None)
    return fig

def make_histogram(df, col, title, bins=10, kde=True):
    if col not in df or df[col].dropna().empty:
        return create_no_data_figure(title)
    try:
        data = pd.to_numeric(df[col], errors='coerce').dropna()
    except Exception:
        return create_no_data_figure(title)
    if data.empty:
        return create_no_data_figure(title)
    fig = px.histogram(
        data, 
        nbins=bins, 
        title=title, 
        color_discrete_sequence=[PRIMARY_COLOR]
    )
    fig.update_layout(
        paper_bgcolor=STYLE_VARS["BACKGROUND_COLOR"],
        font=dict(family=STYLE_VARS["FONT_FAMILY"], size=STYLE_VARS["FONT_SIZE"]),
        margin=dict(l=20, r=20, t=40, b=20),
        hovermode=False
    )
    fig.update_traces(hovertemplate=None)
    return fig

def make_world_map(df, col, title):
    if col not in df or df[col].dropna().empty:
        return create_no_data_figure(title)
    counts = df[col].value_counts(dropna=False)
    fig = px.choropleth(
        locations=counts.index,
        locationmode="country names",
        color=counts.values,
        hover_name=counts.index,
        color_continuous_scale=px.colors.sequential.Plasma,
        title=title
    )
    fig.update_layout(
        paper_bgcolor=STYLE_VARS["BACKGROUND_COLOR"],
        font=dict(family=STYLE_VARS["FONT_FAMILY"], size=STYLE_VARS["FONT_SIZE"]),
        margin=dict(l=20, r=20, t=40, b=20),
        hovermode=False
    )
    fig.update_traces(hovertemplate=None)
    return fig

def make_multi_select_bar(df, cols, title):
    # cols: list of column names for multi-select (one-hot) questions
    data = []
    labels = []
    for col in cols:
        if col in df:
            count = df[col].fillna(0).astype(bool).sum()
            labels.append(col)
            data.append(count)
    if not data or sum(data) == 0:
        return create_no_data_figure(title)
    fig = go.Figure(go.Bar(
        x=labels,
        y=data,
        marker_color=MULTI_COLOR_PALETTE * (len(labels) // len(MULTI_COLOR_PALETTE) + 1)
    ))
    fig.update_layout(
        title=title,
        paper_bgcolor=STYLE_VARS["BACKGROUND_COLOR"],
        font=dict(family=STYLE_VARS["FONT_FAMILY"], size=STYLE_VARS["FONT_SIZE"]),
        margin=dict(l=20, r=20, t=40, b=20),
        xaxis_title="",
        yaxis_title="Count",
        hovermode=False
    )
    fig.update_traces(hoverinfo="skip", hovertemplate=None)
    return fig

def generate_chart(df, col, title=None, chart_type='auto'):
    """
    Smart chart generator: chooses chart type based on data.
    """
    if title is None:
        title = col.replace('_', ' ').title()
    if chart_type == 'auto':
        # Heuristic: numeric = histogram, categorical = bar, <=5 unique = pie
        if pd.api.types.is_numeric_dtype(df[col]):
            return make_histogram(df, col, title)
        elif df[col].nunique() <= 5:
            return make_pie_chart(df, col, title)
        else:
            return make_bar_chart(df, col, title)
    elif chart_type == 'bar':
        return make_bar_chart(df, col, title)
    elif chart_type == 'pie':
        return make_pie_chart(df, col, title)
    elif chart_type == 'donut':
        return make_donut_chart(df, col, title)
    elif chart_type == 'hist':
        return make_histogram(df, col, title)
    elif chart_type == 'map':
        return make_world_map(df, col, title)
    else:
        return create_no_data_figure(title)