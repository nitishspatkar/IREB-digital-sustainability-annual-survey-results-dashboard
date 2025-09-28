"""Utility functions for Streamlit app."""

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from typing import Dict, List, Tuple, Union

def create_bar_chart(df: pd.DataFrame, column: str, title: str = None) -> go.Figure:
    """Create a horizontal bar chart from a DataFrame column."""
    if column not in df.columns:
        return go.Figure()
    
    # Count values
    value_counts = df[column].value_counts()
    
    if len(value_counts) == 0:
        return go.Figure()
    
    # Use single IREB color
    single_color = '#831E82'
    
    fig = px.bar(
        x=value_counts.values,
        y=value_counts.index,
        orientation='h',
        title=None,  # Don't show title in chart
        color_discrete_sequence=[single_color]
    )
    
    fig.update_layout(
        height=400,
        showlegend=False,
        xaxis_title="Count",
        yaxis_title="",
        font=dict(size=12),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)'
    )
    
    return fig

def create_pie_chart(df: pd.DataFrame, column: str, title: str = None) -> go.Figure:
    """Create a pie chart from a DataFrame column."""
    if column not in df.columns:
        return go.Figure()
    
    # Count values
    value_counts = df[column].value_counts()
    
    if len(value_counts) == 0:
        return go.Figure()
    
    # IREB color palette with contrasting shades
    ireb_colors = ['#831E82', '#A450A3', '#C581C4', '#E6B3E5', '#F0D9F0']
    
    fig = px.pie(
        values=value_counts.values,
        names=value_counts.index,
        title=None,  # Don't show title in chart
        color_discrete_sequence=ireb_colors
    )
    
    # Remove legend title and clean up legend
    fig.update_layout(
        height=400,
        font=dict(size=12),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        legend=dict(
            title=None,
            font=dict(size=11)
        )
    )
    
    return fig

def create_histogram(df: pd.DataFrame, column: str, title: str = None, bins: int = 10) -> go.Figure:
    """Create a histogram from a numeric DataFrame column."""
    if column not in df.columns:
        return go.Figure()
    
    # Convert to numeric, coercing errors
    numeric_data = pd.to_numeric(df[column], errors='coerce')
    numeric_data = numeric_data.dropna()
    
    if len(numeric_data) == 0:
        return go.Figure()
    
    # Use single IREB color
    single_color = '#831E82'
    
    fig = px.histogram(
        x=numeric_data,
        nbins=bins,
        title=None,  # Don't show title in chart
        color_discrete_sequence=[single_color]
    )
    
    fig.update_layout(
        height=400,
        xaxis_title=column,
        yaxis_title="Count",
        font=dict(size=12),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)'
    )
    
    return fig

def create_multi_select_chart(df: pd.DataFrame, columns: List[str], title: str = None) -> go.Figure:
    """Create a bar chart for multi-select questions."""
    if not columns:
        return go.Figure()
    
    # Count "Yes" responses for each column
    counts = {}
    for col in columns:
        if col in df.columns:
            # Count "Yes" responses (case insensitive)
            yes_count = df[col].astype(str).str.strip().str.lower().eq('yes').sum()
            # Extract option text from column name (remove question part)
            if '[' in col and ']' in col:
                option_text = col[col.find('[')+1:col.rfind(']')].strip()
            else:
                option_text = col
            counts[option_text] = yes_count
    
    if not counts or all(count == 0 for count in counts.values()):
        return go.Figure()
    
    # Create DataFrame for plotting
    plot_df = pd.DataFrame(list(counts.items()), columns=['Option', 'Count'])
    
    # Use single IREB color
    single_color = '#831E82'
    
    fig = px.bar(
        plot_df,
        x='Count',
        y='Option',
        orientation='h',
        title=None,  # Don't show title in chart
        color_discrete_sequence=[single_color]
    )
    
    fig.update_layout(
        height=max(400, len(plot_df) * 30),
        showlegend=False,
        xaxis_title="Count",
        yaxis_title="",
        font=dict(size=12),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)'
    )
    
    return fig

def create_world_map(df: pd.DataFrame, country_col: str = 'country') -> go.Figure:
    """Create a world map showing country distribution."""
    if country_col not in df.columns:
        return go.Figure()
    
    # Count countries
    country_counts = df[country_col].value_counts().reset_index()
    country_counts.columns = ['country', 'count']
    
    # Create world map
    fig = px.choropleth(
        country_counts,
        locations='country',
        locationmode='country names',
        color='count',
        color_continuous_scale='Viridis',
        title=None  # Don't show title in chart
    )
    
    fig.update_layout(
        height=500,
        font=dict(size=12)
    )
    
    return fig

def display_metric_card(title: str, value: Union[str, int], delta: str = None):
    """Display a metric card with enhanced styling and borders."""
    st.markdown("""
    <div style="
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        padding: 15px;
        margin: 10px 0;
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        text-align: center;
    ">
    """, unsafe_allow_html=True)
    
    if delta:
        st.metric(label=title, value=value, delta=delta)
    else:
        st.metric(label=title, value=value)
    
    st.markdown("</div>", unsafe_allow_html=True)

def display_chart_in_container(fig: go.Figure, title: str = None):
    """Display a chart in a styled container with borders and spacing."""
    # Check if the figure has data before creating container
    if fig is None or len(fig.data) == 0:
        return  # Don't create empty container
    
    # Create a container with border and padding
    st.markdown("""
    <div style="
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    ">
    """, unsafe_allow_html=True)
    
    # Show title in container
    if title:
        st.markdown(f"<h4 style='color: #831E82; margin-bottom: 15px;'>{title}</h4>", unsafe_allow_html=True)
    
    st.plotly_chart(fig, use_container_width=True)
    
    st.markdown("</div>", unsafe_allow_html=True)

def get_free_text_responses(df: pd.DataFrame, columns: List[str]) -> Dict[str, List[str]]:
    """Extract free text responses from specified columns."""
    responses = {}
    
    for col in columns:
        if col in df.columns:
            # Get non-null, non-empty responses
            text_responses = df[col].dropna()
            text_responses = text_responses[text_responses.astype(str).str.strip() != '']
            responses[col] = text_responses.tolist()
    
    return responses

def display_free_text_section(responses: Dict[str, List[str]], title: str):
    """Display free text responses in a formatted section."""
    st.subheader(title)
    
    for col, texts in responses.items():
        if texts:
            st.markdown(f"**{col}**")
            for i, text in enumerate(texts, 1):
                st.markdown(f"{i}. {text}")
            st.markdown("---")

def create_binary_chart(df: pd.DataFrame, column: str, title: str = None) -> go.Figure:
    """Create a two-category bar chart for binary questions (Yes/No)."""
    if column not in df.columns:
        return go.Figure()
    
    # Count values
    value_counts = df[column].value_counts()
    
    if len(value_counts) == 0:
        return go.Figure()
    
    # Use single IREB color
    single_color = '#831E82'
    
    fig = px.bar(
        x=value_counts.index,
        y=value_counts.values,
        title=None,
        color_discrete_sequence=[single_color]
    )
    
    fig.update_layout(
        height=300,
        showlegend=False,
        xaxis_title="",
        yaxis_title="Count",
        font=dict(size=12),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)'
    )
    
    return fig

def create_ordinal_chart(df: pd.DataFrame, column: str, title: str = None) -> go.Figure:
    """Create a horizontal ordered bar chart for ordinal questions."""
    if column not in df.columns:
        return go.Figure()
    
    # Count values
    value_counts = df[column].value_counts()
    
    if len(value_counts) == 0:
        return go.Figure()
    
    # Define common ordinal orderings
    ordinal_orders = {
        'years_of_experience': ['Less than 1 year', '1-5 years', '6-10 years', '11-20 years', 'More than 20 years'],
        'frequency_sustainability_discussions': ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
        'satisfied_num_trainings': ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied']
    }
    
    # Try to order the categories properly
    if column in ordinal_orders:
        ordered_categories = [cat for cat in ordinal_orders[column] if cat in value_counts.index]
        remaining_categories = [cat for cat in value_counts.index if cat not in ordered_categories]
        ordered_categories.extend(remaining_categories)
        value_counts = value_counts.reindex(ordered_categories)
    
    # Use single IREB color
    single_color = '#831E82'
    
    fig = px.bar(
        x=value_counts.values,
        y=value_counts.index,
        orientation='h',
        title=None,
        color_discrete_sequence=[single_color]
    )
    
    fig.update_layout(
        height=400,
        showlegend=False,
        xaxis_title="Count",
        yaxis_title="",
        font=dict(size=12),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)'
    )
    
    return fig

def create_stacked_bar_chart(df: pd.DataFrame, columns: List[str], questions: List[str], title: str = None) -> go.Figure:
    """Create a horizontal stacked bar chart for multiple questions with same response options."""
    if not columns or not questions:
        return go.Figure()
    
    # Prepare data for stacked bar chart
    data = []
    for col, question in zip(columns, questions):
        if col in df.columns:
            value_counts = df[col].value_counts()
            for response, count in value_counts.items():
                data.append({
                    'Question': question,
                    'Response': response,
                    'Count': count,
                    'Percentage': (count / value_counts.sum()) * 100
                })
    
    if not data:
        return go.Figure()
    
    df_chart = pd.DataFrame(data)
    
    # Use different shades of IREB color family for different responses
    color_map = {
        'Yes': '#831E82',           # Dark purple
        'No': '#A450A3',            # Medium purple
        'Not sure': '#C581C4',      # Light purple
        'Maybe': '#C581C4',         # Light purple
        'Unsure': '#C581C4',        # Light purple
        'Other': '#E6B3E5',         # Very light purple
        'Never': '#831E82',         # Dark purple
        'Rarely, but it has happened': '#A450A3',  # Medium purple
        'For some projects or digital solutions': '#C581C4',  # Light purple
        'For most projects or digital solutions': '#E6B3E5',  # Very light purple
        'For every project or digital solution': '#F0D9F0'   # Lightest purple
    }
    
    # Create horizontal stacked bar chart
    fig = px.bar(
        df_chart,
        x='Percentage',
        y='Question',
        color='Response',
        orientation='h',
        title=None,
        color_discrete_map=color_map
    )
    
    fig.update_layout(
        height=400,
        xaxis_title="Percentage (%)",
        yaxis_title="",
        font=dict(size=12),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        showlegend=True,
        legend=dict(
            title=None,
            font=dict(size=11),
            orientation="v",
            yanchor="top",
            y=1,
            xanchor="left",
            x=1.02
        )
    )
    
    return fig

@st.cache_data
def load_cached_data(year: int, data_folder: str) -> pd.DataFrame:
    """Load and cache data for a specific year."""
    from src.utils.data_processing import load_single_year_data
    return load_single_year_data(data_folder, year)
