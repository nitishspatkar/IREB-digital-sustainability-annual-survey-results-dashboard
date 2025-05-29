"""Chart creation components for the dashboard."""

from typing import List, Dict, Optional, Union
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from collections import defaultdict

from src.config import PRIMARY_COLOR, MULTI_COLOR_PALETTE, STYLE_VARS, NUMERIC_COLS

def create_no_data_figure(title: str = "") -> go.Figure:
    """Create a placeholder figure when no data is available."""
    fig = go.Figure()
    
    fig.add_annotation(
        text="No data available",
        x=0.5, y=0.5,
        xref="paper", yref="paper",
        showarrow=False,
        font=dict(size=16, color="gray"),
    )
    
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

def make_bar_chart(
    df: pd.DataFrame,
    col: str,
    title: str,
    horizontal: bool = False
) -> go.Figure:
    """Create a bar chart for a categorical column."""
    if df[col].notna().sum() == 0:
        return create_no_data_figure(title)
    
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = [col, "count"]
    
    if counts.shape[0] == 0 or (counts.shape[0] == 1 and pd.isna(counts[col].iloc[0])):
        return create_no_data_figure(title)
    
    if horizontal:
        counts = counts.sort_values("count")
        fig = px.bar(
            counts,
            y=col,
            x="count",
            title=title,
            template="plotly_white",
            color_discrete_sequence=[PRIMARY_COLOR]
        )
        fig.update_layout(
            yaxis_title=col.replace("_", " ").title(), 
            xaxis_title="Count",
            height=350,
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

def make_pie_chart(df: pd.DataFrame, col: str, title: str) -> go.Figure:
    """Create a pie chart for a categorical column."""
    if df[col].notna().sum() == 0:
        return create_no_data_figure(title)
    
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = [col, "count"]
    
    if counts.shape[0] == 0 or (counts.shape[0] == 1 and pd.isna(counts[col].iloc[0])):
        return create_no_data_figure(title)
    
    total = counts["count"].sum()
    counts["percentage"] = counts["count"] / total * 100
    
    fig = px.pie(
        counts,
        names=col,
        values="count",
        title=title,
        template="plotly_white",
        color_discrete_sequence=MULTI_COLOR_PALETTE,
        hole=0.4
    )
    
    fig.update_traces(
        textposition='inside',
        textinfo='percent',
        hovertemplate='%{label}<br>Count: %{value}<br>Percentage: %{percent:.1f}%<extra></extra>'
    )
    
    fig.update_layout(
        margin=dict(l=10, r=10, t=50, b=100),
        legend=dict(
            orientation="h",
            yanchor="bottom", 
            y=-0.5,
            xanchor="center", 
            x=0.5
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Helvetica", size=12),
        height=500
    )
    
    fig.add_annotation(
        text=f"Total<br>{total}",
        x=0.5, y=0.5,
        font_size=15,
        showarrow=False
    )
    return fig

def make_donut_chart(df: pd.DataFrame, col: str, title: str) -> go.Figure:
    """Create a donut chart for a categorical column."""
    return make_pie_chart(df, col, title)  # Same as pie chart with hole

def make_histogram(
    df: pd.DataFrame,
    col: str,
    title: str,
    bins: int = 10,
    kde: bool = True
) -> go.Figure:
    """Create a histogram for a numeric column with option for KDE curve."""
    numeric_values = pd.to_numeric(df[col], errors='coerce')
    valid_data_count = numeric_values.notna().sum()
    
    if valid_data_count < 3:
        return create_no_data_figure(title)
    
    if kde:
        hist_data = numeric_values.dropna()
        fig = go.Figure()
        
        fig.add_trace(go.Histogram(
            x=hist_data,
            nbinsx=bins,
            marker_color=PRIMARY_COLOR,
            opacity=0.7,
            name="Count"
        ))
        
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

def make_world_map(df: pd.DataFrame, col: str, title: str) -> go.Figure:
    """Create a choropleth map for countries or continents."""
    if df[col].notna().sum() == 0:
        return create_no_data_figure(title)
    
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = [col, "count"]
    
    if counts.shape[0] == 0 or (counts.shape[0] == 1 and pd.isna(counts[col].iloc[0])):
        return create_no_data_figure(title)
    
    if col == "continent":
        fig = px.choropleth(
            counts,
            locations=col,
            locationmode="country names",
            color="count",
            color_continuous_scale=px.colors.sequential.Purp,
            title=title
        )
    else:
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
            projection_type='natural earth',
            showland=True,
            showcountries=True,
            landcolor='rgb(243, 243, 243)',
            countrycolor='rgb(204, 204, 204)',
            coastlinecolor='rgb(204, 204, 204)',
            projection_scale=1.3  # Adjust the zoom level
        ),
        margin=dict(l=0, r=0, t=50, b=0),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Helvetica", size=12),
        height=600  # Increase the height
    )
    return fig

def make_multi_select_bar(df: pd.DataFrame, cols: List[str], title: str) -> go.Figure:
    """Create a horizontal bar chart for multiple-select questions."""
    if not cols or df.empty:
        return create_no_data_figure(title)
    
    # Extract the common question prefix if it exists
    if len(cols) > 1:
        first_col = cols[0]
        if '[' in first_col:
            question_prefix = first_col[:first_col.find('[')].strip()
            title = title or question_prefix  # Use the question as title if no title provided
    
    # Count responses for each option
    counts = []
    for col in cols:
        # Find the matching column in the dataframe
        matching_cols = [c for c in df.columns if c.strip() == col.strip()]
        if matching_cols:
            col_name = matching_cols[0]
            # Extract just the option part from the column name
            if '[' in col_name and ']' in col_name:
                option = col_name[col_name.find('[')+1:col_name.rfind(']')].strip()
                # Clean up the option text
                if '(' in option:
                    # Keep only the main text and first part of explanation
                    main_text = option.split('(')[0].strip()
                    explanation = option.split('(')[1].split(',')[0].strip() + ')'
                    option = f"{main_text} ({explanation}"
                else:
                    option = option.strip()
            else:
                option = col_name.split('?')[0].strip()
            
            # For these specific columns, we're looking for any non-null value as a "yes"
            count = df[col_name].notna().sum()
            total = len(df)
            if total > 0:
                percentage = (count / total) * 100
                counts.append({
                    'option': option,
                    'count': count,
                    'percentage': percentage
                })
    
    if not counts:
        return create_no_data_figure(title)
    
    # Sort by count in descending order
    counts_df = pd.DataFrame(counts).sort_values('count', ascending=True)
    
    # Create the horizontal bar chart
    fig = go.Figure()
    
    fig.add_trace(go.Bar(
        x=counts_df['count'],
        y=counts_df['option'],
        orientation='h',
        marker_color=PRIMARY_COLOR,
        text=counts_df['percentage'].apply(lambda x: f'{x:.1f}%'),  # Show percentage as text
        textposition='outside',
        hoverinfo='none'  # Disable hover effect
    ))
    
    # Update layout
    fig.update_layout(
        title=title,
        xaxis_title="Number of Responses",
        yaxis_title="",
        template="plotly_white",
        margin=dict(l=10, r=10, t=50, b=10),  # Revert to original margins
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Helvetica", size=12),
        showlegend=False,
        height=max(300, len(counts) * 40)  # Dynamic height based on number of options
    )
    
    # Update axes
    fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor='rgba(0,0,0,0.1)')
    fig.update_yaxes(showgrid=False)
    
    return fig

def simplify_label(col: str) -> str:
    """Simplify column labels for better visualization.
    
    For multi-select questions, extracts only the option part after [...]
    For regular questions, returns the original text.
    """
    if '[' in col and ']' in col:
        # Extract text between square brackets
        start = col.find('[') + 1
        end = col.rfind(']')  # Use rfind to handle nested brackets
        if end == -1:  # If no closing bracket found
            end = len(col)
        option = col[start:end].strip()
        
        # Clean up any trailing spaces or brackets
        option = option.strip(' ]')
        
        # If the option contains explanatory text in parentheses, keep it
        if '(' in option and ')' in option:
            # Keep the first part of the explanation if it's too long
            parts = option.split('(', 1)
            if len(parts) == 2:
                explanation = parts[1].split(',')[0] + ')'  # Keep only the first part
                option = f"{parts[0].strip()} ({explanation}"
            return option
        
        return option
    
    return col.split('?')[0].strip()

def generate_chart(
    df: pd.DataFrame,
    col: str,
    title: Optional[str] = None,
    chart_type: str = 'auto'
) -> go.Figure:
    """Automatically generate an appropriate chart based on data type."""
    if not title:
        title = f"{col.replace('_', ' ').title()} Distribution"
    
    df_copy = df.copy()
    
    if col in NUMERIC_COLS:
        df_copy[col] = pd.to_numeric(df_copy[col], errors='coerce')
    
    if df_copy[col].count() == 0:
        return create_no_data_figure(title)
    
    if chart_type == 'auto':
        if col in NUMERIC_COLS:
            return make_histogram(df_copy, col, title, kde=True)
        elif "continent" in col.lower() or "country" in col.lower():
            try:
                return make_world_map(df_copy, col, title)
            except Exception as e:
                print(f"Error creating map for {col}: {str(e)}")
                return make_bar_chart(df_copy, col, title, horizontal=True)
        else:
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
        if col in NUMERIC_COLS:
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
        return make_bar_chart(df_copy, col, title) 