"""Chart creation components for the dashboard."""

from typing import List, Dict, Optional, Union
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from collections import defaultdict

from src.config import PRIMARY_COLOR, MULTI_COLOR_PALETTE, STYLE_VARS, NUMERIC_COLS

# Font size configurations
TITLE_FONT_SIZE = STYLE_VARS["FONT_SIZE"] + 2  # Slightly larger for titles
LABEL_FONT_SIZE = STYLE_VARS["FONT_SIZE"] + 4  # Larger size for bar chart labels
ANNOTATION_FONT_SIZE = STYLE_VARS["FONT_SIZE"]  # Base size for annotations

def create_no_data_figure(title: Optional[str] = None) -> go.Figure:
    """Create a placeholder figure when no data is available."""
    fig = go.Figure()
    
    fig.add_annotation(
        text="No data available",
        x=0.5, y=0.5,
        xref="paper", yref="paper",
        showarrow=False,
        font=dict(size=ANNOTATION_FONT_SIZE, color="gray"),
    )
    
    fig.update_layout(
        title=title if title else None,
        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=10, r=10, t=30 if title else 10, b=10),
        height=300,
        font=dict(
            family=STYLE_VARS["FONT_FAMILY"],
            size=LABEL_FONT_SIZE
        )
    )
    
    return fig

def simplify_label(col: str) -> str:
    """Simplify column labels for better visualization.
    
    For multi-select questions, extracts only the option part after [...]
    For regular questions, returns the original text.
    """
    # Handle numeric values by converting to string
    if pd.isna(col):
        return "N/A"
    
    # Convert to string if numeric
    col = str(col)
    
    # First check if it's a multi-select question with square brackets
    if '[' in col and ']' in col:
        # Extract text between square brackets
        start = col.find('[') + 1
        end = col.rfind(']')  # Use rfind to handle nested brackets
        if end == -1:  # If no closing bracket found
            end = len(col)
        option = col[start:end].strip()
        
        # Clean up any trailing spaces or brackets
        option = option.strip(' ]')
        
        # If the option contains explanatory text in parentheses, keep it clean
        if '(' in option and ')' in option:
            parts = option.split('(', 1)
            explanation = parts[1].split(')')[0]
            return f"{parts[0].strip()} ({explanation})"
        
        return option
    
    # For regular questions, try to extract just the answer part
    # Common patterns in the questions
    patterns = [
        "What hinders you from incorporating sustainability in your role-specific tasks?",
        "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?",
        "What additional support or resources would help you integrate digital sustainability into your work?",
        "What drives you to incorporate sustainability in your role-related tasks?",
        "Do you incorporate",
        "Are there specific",
        "Does your organization",
        "How frequently",
        "Have you participated",
        "Are you satisfied"
    ]
    
    # Remove any known question patterns
    text = col
    for pattern in patterns:
        text = text.replace(pattern, "").strip()
    
    # Remove any remaining question marks and clean up
    text = text.split('?')[-1].strip()
    
    # Clean up any leading/trailing punctuation and whitespace
    text = text.strip('[]() .,:-')
    
    # If the text is empty after cleaning, return the original
    if not text:
        return col
    
    return text

def make_bar_chart(
    df: pd.DataFrame,
    col: str,
    title: Optional[str] = None,
    horizontal: bool = False
) -> go.Figure:
    """Create a bar chart for a categorical column."""
    if df[col].notna().sum() == 0:
        return create_no_data_figure(title)
    
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = [col, "count"]
    
    if counts.shape[0] == 0 or (counts.shape[0] == 1 and pd.isna(counts[col].iloc[0])):
        return create_no_data_figure(title)
    
    # Simplify the labels for display
    counts['display_label'] = counts[col].apply(simplify_label)
    
    if horizontal:
        counts = counts.sort_values("count")
        fig = px.bar(
            counts,
            y='display_label',  # Use simplified labels
            x="count",
            template="plotly_white",
            color_discrete_sequence=[PRIMARY_COLOR]
        )
        fig.update_traces(
            hovertemplate='<b>%{y}</b><br>Count: %{x}<extra></extra>',
            text=counts["count"],  # Show count as text
            textposition='outside',
            textfont=dict(size=LABEL_FONT_SIZE)
        )
        fig.update_layout(
            title=dict(
                text=title if title else None,
                font=dict(size=TITLE_FONT_SIZE)
            ),
            yaxis_title=None,
            xaxis_title="Count",
            height=350,
            margin=dict(l=10, r=10, t=30 if title else 10, b=10),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(
                family=STYLE_VARS["FONT_FAMILY"],
                size=LABEL_FONT_SIZE
            )
        )
    else:
        fig = px.bar(
            counts,
            x='display_label',  # Use simplified labels
            y="count",
            template="plotly_white",
            color_discrete_sequence=[PRIMARY_COLOR]
        )
        fig.update_traces(
            hovertemplate='<b>%{x}</b><br>Count: %{y}<extra></extra>',
            text=counts["count"],  # Show count as text
            textposition='outside',
            textfont=dict(size=LABEL_FONT_SIZE)
        )
        fig.update_layout(
            title=dict(
                text=title if title else None,
                font=dict(size=TITLE_FONT_SIZE)
            ),
            xaxis_title=None,
            yaxis_title="Count",
            margin=dict(l=10, r=10, t=30 if title else 10, b=10),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(
                family=STYLE_VARS["FONT_FAMILY"],
                size=LABEL_FONT_SIZE
            )
        )
    return fig

def make_pie_chart(df: pd.DataFrame, col: str, title: Optional[str] = None) -> go.Figure:
    """Create a pie chart for a categorical column with improved label handling."""
    if df[col].notna().sum() == 0:
        return create_no_data_figure(title)
    
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = [col, "count"]
    
    if counts.shape[0] == 0 or (counts.shape[0] == 1 and pd.isna(counts[col].iloc[0])):
        return create_no_data_figure(title)
    
    total = counts["count"].sum()
    counts["percentage"] = counts["count"] / total * 100
    
    # Store original labels for hover and truncated for legend
    counts['original_labels'] = counts[col].astype(str)
    counts['display_labels'] = counts[col].astype(str).apply(lambda x: truncate_text(x))
    
    # Calculate dynamic margins based on label lengths
    max_label_length = max(len(label) for label in counts['display_labels']) if len(counts) > 0 else 20
    right_margin = min(max(120, max_label_length * 8), 300)  # Dynamic margin, capped at 300
    
    fig = px.pie(
        counts,
        names='display_labels',
        values="count",
        template="plotly_white",
        color_discrete_sequence=MULTI_COLOR_PALETTE,
        hole=0.4
    )
    
    # Show only percentages on slices with custom hover showing full labels
    fig.update_traces(
        textposition='inside',
        textinfo='percent',  # Only show percentage on slice
        hovertemplate='<b>%{customdata}</b><br>' +
                      'Count: %{value}<br>' +
                      'Percentage: %{percent}<br>' +
                      '<extra></extra>',  # Remove default hover box
        customdata=counts['original_labels'],  # Use original full labels for hover
        textfont=dict(size=LABEL_FONT_SIZE + 2, color='white', family=STYLE_VARS["FONT_FAMILY"]),
        showlegend=True,  # Always show legend
        marker=dict(line=dict(color='white', width=2))  # Add white border for better contrast
    )
    
    # Position legend outside chart area to avoid overlap
    fig.update_layout(
        title=dict(
            text=title if title else None,
            font=dict(size=TITLE_FONT_SIZE, family=STYLE_VARS["FONT_FAMILY"])
        ),
        margin=dict(l=20, r=right_margin, t=40 if title else 20, b=20),
        legend=dict(
            orientation="v",
            yanchor="top",
            y=1,
            xanchor="left",
            x=1.02,  # Position legend outside the chart
            font=dict(size=LABEL_FONT_SIZE, family=STYLE_VARS["FONT_FAMILY"]),
            bgcolor="rgba(255,255,255,0.8)",
            bordercolor="rgba(0,0,0,0.1)",
            borderwidth=1
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(
            family=STYLE_VARS["FONT_FAMILY"],
            size=LABEL_FONT_SIZE
        ),
        height=450  # Consistent height with donut chart
    )
    
    # Add total in the center with better styling
    fig.add_annotation(
        text=f"<b>Total</b><br><span style='font-size:24px'>{total}</span>",
        x=0.5, y=0.5,
        font=dict(size=ANNOTATION_FONT_SIZE + 2, family=STYLE_VARS["FONT_FAMILY"], color=PRIMARY_COLOR),
        showarrow=False,
        align="center"
    )
    return fig

def truncate_text(text: str, max_length: int = 35) -> str:
    """Truncate text to a maximum length for better display."""
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."

def make_donut_chart(df: pd.DataFrame, col: str, title: Optional[str] = None) -> go.Figure:
    """Create a donut chart for a categorical column with improved label handling."""
    if df[col].notna().sum() == 0:
        return create_no_data_figure(title)
    
    counts = df[col].value_counts(dropna=False)
    
    # Store original labels for hover and truncated for legend
    original_labels = [str(label) for label in counts.index]
    truncated_labels = [truncate_text(str(label)) for label in counts.index]
    
    # Calculate percentages
    total = counts.sum()
    percentages = [(count / total * 100) for count in counts.values]
    
    # Calculate dynamic margins based on label lengths
    max_label_length = max(len(label) for label in truncated_labels) if truncated_labels else 20
    right_margin = min(max(120, max_label_length * 8), 300)  # Dynamic margin, capped at 300
    
    fig = px.pie(
        names=truncated_labels,
        values=counts.values,
        hole=0.5,
        title=title,
        color_discrete_sequence=MULTI_COLOR_PALETTE
    )
    
    # Show only percentages on slices with custom hover showing full labels
    fig.update_traces(
        textposition='inside',
        textinfo='percent',  # Only show percentage on slice
        hovertemplate='<b>%{customdata}</b><br>' +
                      'Count: %{value}<br>' +
                      'Percentage: %{percent}<br>' +
                      '<extra></extra>',  # Remove default hover box
        customdata=original_labels,  # Use original full labels for hover
        textfont=dict(size=LABEL_FONT_SIZE + 2, color='white', family=STYLE_VARS["FONT_FAMILY"]),
        showlegend=True,  # Always show legend
        marker=dict(line=dict(color='white', width=2))  # Add white border for better contrast
    )
    
    # Position legend outside chart area to avoid overlap
    fig.update_layout(
        title=dict(
            text=title if title else None,
            font=dict(size=TITLE_FONT_SIZE, family=STYLE_VARS["FONT_FAMILY"])
        ),
        margin=dict(l=20, r=right_margin, t=40 if title else 20, b=20),
        legend=dict(
            orientation="v",
            yanchor="top",
            y=1,
            xanchor="left",
            x=1.02,  # Position legend outside the chart
            font=dict(size=LABEL_FONT_SIZE, family=STYLE_VARS["FONT_FAMILY"]),
            bgcolor="rgba(255,255,255,0.8)",
            bordercolor="rgba(0,0,0,0.1)",
            borderwidth=1
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(
            family=STYLE_VARS["FONT_FAMILY"],
            size=LABEL_FONT_SIZE
        ),
        height=450,  # Slightly reduced height for better proportions
        hovermode=False
    )
    
    # Add total in the center with better styling
    total = counts.sum()
    fig.add_annotation(
        text=f"<b>Total</b><br><span style='font-size:24px'>{total}</span>",
        x=0.5, y=0.5,
        font=dict(size=ANNOTATION_FONT_SIZE + 2, family=STYLE_VARS["FONT_FAMILY"], color=PRIMARY_COLOR),
        showarrow=False,
        align="center"
    )
    
    return fig

def make_histogram(
    df: pd.DataFrame,
    col: str,
    title: Optional[str] = None,
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
            name="Count",
            hovertemplate='Range: %{x}<br>Count: %{y}<extra></extra>',
            showlegend=False
        ))
        
        fig.update_layout(
            title=dict(
                text=title if title else None,
                font=dict(size=TITLE_FONT_SIZE)
            ),
            xaxis_title=None,
            yaxis_title="Frequency",
            template="plotly_white",
            margin=dict(l=10, r=10, t=30 if title else 10, b=10),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(
                family=STYLE_VARS["FONT_FAMILY"],
                size=LABEL_FONT_SIZE
            )
        )
    else:
        fig = px.histogram(
            df,
            x=numeric_values,
            nbins=bins,
            template="plotly_white",
            color_discrete_sequence=[PRIMARY_COLOR]
        )
        fig.update_traces(
            hovertemplate='Range: %{x}<br>Count: %{y}<extra></extra>'
        )
        fig.update_layout(
            title=dict(
                text=title if title else None,
                font=dict(size=TITLE_FONT_SIZE)
            ),
            xaxis_title=None,
            yaxis_title="Frequency",
            margin=dict(l=10, r=10, t=30 if title else 10, b=10),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(
                family=STYLE_VARS["FONT_FAMILY"],
                size=LABEL_FONT_SIZE
            )
        )
    return fig

def make_world_map(df: pd.DataFrame, col: str, title: Optional[str] = None) -> go.Figure:
    """Create a choropleth map for countries or continents with improved colors and hover info."""
    if df[col].notna().sum() == 0:
        return create_no_data_figure(title)
    
    counts = df[col].value_counts(dropna=False).reset_index()
    counts.columns = ['country', 'count']
    
    fig = px.choropleth(
        counts,
        locations='country',
        locationmode='country names',
        color='count',
        color_continuous_scale='Viridis',
        range_color=(counts['count'].min(), counts['count'].max()),
        hover_name='country',
        hover_data={'count': True, 'country': False},
        title=title
    )
    fig.update_layout(
        title=dict(
            text=title if title else None,
            font=dict(size=TITLE_FONT_SIZE)
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(
            family=STYLE_VARS["FONT_FAMILY"],
            size=LABEL_FONT_SIZE
        ),
        margin=dict(l=10, r=10, t=30 if title else 10, b=10),
        height=500,
        coloraxis_colorbar=dict(
            title="Respondents",
            tickvals=[counts['count'].min(), counts['count'].max()],
            ticktext=[str(counts['count'].min()), str(counts['count'].max())]
        )
    )
    return fig

def make_multi_select_bar(df: pd.DataFrame, cols: List[str], title: Optional[str] = None) -> go.Figure:
    """Create a horizontal bar chart for multiple-select questions."""
    if not cols or df.empty:
        return create_no_data_figure(title)
    
    # Count responses for each option
    counts = []
    for col in cols:
        if col in df:
            count = df[col].astype(str).str.strip().str.lower().eq('yes').sum()
            total = len(df)
            if total > 0:
                percentage = (count / total) * 100
                # Extract text within brackets if present, otherwise use full text
                label = col
                if '[' in col and ']' in col:
                    start = col.find('[') + 1
                    end = col.rfind(']')
                    label = col[start:end].strip()
                counts.append({
                    'option': label,
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
        text=[f"{count} ({percentage:.1f}%)" for count, percentage in zip(counts_df['count'], counts_df['percentage'])],
        textposition='outside',
        hovertemplate='<b>%{y}</b><br>Count: %{x}<br>Percentage: %{customdata:.1f}%<extra></extra>',
        customdata=counts_df['percentage'],
        textfont=dict(size=LABEL_FONT_SIZE)
    ))
    
    # Update layout
    fig.update_layout(
        title=dict(
            text=title if title else None,
            font=dict(size=TITLE_FONT_SIZE)
        ),
        xaxis_title="Number of Responses",
        yaxis_title=None,
        template="plotly_white",
        margin=dict(l=10, r=10, t=30 if title else 10, b=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(
            family=STYLE_VARS["FONT_FAMILY"],
            size=LABEL_FONT_SIZE
        ),
        showlegend=False,
        height=max(300, len(counts) * 40)  # Adjust height based on number of options
    )
    
    # Update axes
    fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor='rgba(0,0,0,0.1)')
    fig.update_yaxes(showgrid=False)
    
    return fig

def generate_chart(
    df: pd.DataFrame,
    col: str,
    title: Optional[str] = None,
    chart_type: str = 'auto'
) -> go.Figure:
    """Automatically generate an appropriate chart based on data type."""
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
            return make_bar_chart(df_copy, col, title)
    elif chart_type == 'pie':
        return make_pie_chart(df_copy, col, title)
    elif chart_type == 'donut':
        return make_donut_chart(df_copy, col, title)
    elif chart_type == 'map':
        return make_world_map(df_copy, col, title)
    else:
        return make_bar_chart(df_copy, col, title) 