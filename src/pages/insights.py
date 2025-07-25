"""Insights page module for cross-question analysis."""

import pandas as pd
import dash_bootstrap_components as dbc
from dash import html, dcc
import plotly.express as px
import plotly.graph_objects as go
import numpy as np

from src.components.charts import (
    generate_chart,
    make_donut_chart,
    make_multi_select_bar,
    make_bar_chart,
    create_no_data_figure
)
from src.components.layout import build_stat_card, build_chart_card
from src.config import PRIMARY_COLOR

def build_enhanced_stat_card(title: str, value: str, icon: str, gradient: str, description: str) -> dbc.Col:
    """Build an enhanced statistics card with gradient background and icon."""
    return dbc.Col([
        dbc.Card([
            dbc.CardBody([
                html.Div([
                    html.Div([
                        html.I(className=f"bi {icon}", style={
                            "fontSize": "2.5rem",
                            "color": "white",
                            "opacity": "0.9",
                            "marginRight": "1rem"
                        })
                    ]),
                    html.Div([
                        html.H2(value, className="stat-value mb-1"),
                        html.H6(title, className="stat-title mb-0"),
                        html.Small(description, className="stat-description")
                    ], className="flex-grow-1")
                ], className="d-flex align-items-center h-100")
            ])
        ], className="stat-card h-100", style={
            "background": gradient,
            "border": "none",
            "borderRadius": "15px",
            "boxShadow": "0 8px 25px rgba(131, 30, 130, 0.15)",
            "color": "white"
        })
    ], width=12, lg=6, className="mb-4")

def create_awareness_implementation_chart(df: pd.DataFrame) -> go.Figure:
    """Create a chart showing relationship between definition awareness and implementation."""
    # Find awareness column by partial match
    awareness_cols = [col for col in df.columns if "umbrella term" in col]
    if not awareness_cols:
        return create_no_data_figure("Could not find definition awareness column")
    
    # Use the first matching column
    awareness_col = awareness_cols[0]
    implementation_col = "incorporate_sustainability_in_tasks"
    
    # Create contingency table
    contingency = pd.crosstab(
        df[awareness_col],
        df[implementation_col],
        normalize='index'
    ) * 100  # Convert to percentages
    
    # Create grouped bar chart
    fig = go.Figure()
    
    for implementation_status in contingency.columns:
        fig.add_trace(go.Bar(
            name=implementation_status,
            x=contingency.index,
            y=contingency[implementation_status],
            text=[f"{val:.1f}%" for val in contingency[implementation_status]],
            textposition='auto',
            hovertemplate=f'<b>{implementation_status}</b><br>' +
                         'Awareness: %{x}<br>' +
                         'Percentage: %{y:.1f}%<extra></extra>'
        ))
    
    fig.update_layout(
        barmode='group',
        title="Relationship between Definition Awareness and Implementation",
        xaxis_title="Familiar with Digital Sustainability Definition",
        yaxis_title="Percentage",
        showlegend=True,
        legend_title="Implementation Status",
        template="plotly_white",
        height=400,
        font=dict(family="Inter, sans-serif")
    )
    
    return fig

def create_training_implementation_chart(df: pd.DataFrame) -> go.Figure:
    """Create a chart showing relationship between training participation and implementation."""
    # Cross-tabulate training participation with implementation
    training_col = "participated_sustainability_training"
    implementation_col = "incorporate_sustainability_in_tasks"
    
    # Create contingency table
    contingency = pd.crosstab(
        df[training_col],
        df[implementation_col],
        normalize='index'
    ) * 100  # Convert to percentages
    
    # Create grouped bar chart
    fig = go.Figure()
    
    for implementation_status in contingency.columns:
        fig.add_trace(go.Bar(
            name=implementation_status,
            x=contingency.index,
            y=contingency[implementation_status],
            text=[f"{val:.1f}%" for val in contingency[implementation_status]],
            textposition='auto',
            hovertemplate=f'<b>{implementation_status}</b><br>' +
                         'Training: %{x}<br>' +
                         'Percentage: %{y:.1f}%<extra></extra>'
        ))
    
    fig.update_layout(
        barmode='group',
        title="Relationship between Training Participation and Implementation",
        xaxis_title="Participated in Sustainability Training",
        yaxis_title="Percentage",
        showlegend=True,
        legend_title="Implementation Status",
        template="plotly_white",
        height=400,
        font=dict(family="Inter, sans-serif")
    )
    
    return fig

def create_discussion_implementation_chart(df: pd.DataFrame) -> go.Figure:
    """Create a chart showing relationship between discussion frequency and implementation."""
    # Cross-tabulate discussion frequency with implementation
    discussion_col = "frequency_sustainability_discussions"
    implementation_col = "incorporate_sustainability_in_tasks"
    
    # Create contingency table
    contingency = pd.crosstab(
        df[discussion_col],
        df[implementation_col],
        normalize='index'
    ) * 100  # Convert to percentages
    
    # Create grouped bar chart
    fig = go.Figure()
    
    for implementation_status in contingency.columns:
        fig.add_trace(go.Bar(
            name=implementation_status,
            x=contingency.index,
            y=contingency[implementation_status],
            text=[f"{val:.1f}%" for val in contingency[implementation_status]],
            textposition='auto',
            hovertemplate=f'<b>{implementation_status}</b><br>' +
                         'Discussion Frequency: %{x}<br>' +
                         'Percentage: %{y:.1f}%<extra></extra>'
        ))
    
    fig.update_layout(
        barmode='group',
        title="Relationship between Discussion Frequency and Implementation",
        xaxis_title="Frequency of Sustainability Discussions",
        yaxis_title="Percentage",
        showlegend=True,
        legend_title="Implementation Status",
        template="plotly_white",
        height=400,
        font=dict(family="Inter, sans-serif")
    )
    
    return fig

def create_org_type_sustainability_chart(df: pd.DataFrame) -> go.Figure:
    """Create a chart showing sustainability practices by organization type."""
    org_type_col = "organization_type"
    practices_col = "incorporate_sustainability_in_tasks"
    
    # Create contingency table
    contingency = pd.crosstab(
        df[org_type_col],
        df[practices_col],
        normalize='index'
    ) * 100  # Convert to percentages
    
    # Create grouped bar chart
    fig = go.Figure()
    
    for practice_status in contingency.columns:
        fig.add_trace(go.Bar(
            name=practice_status,
            x=contingency.index,
            y=contingency[practice_status],
            text=[f"{val:.1f}%" for val in contingency[practice_status]],
            textposition='auto',
            hovertemplate=f'<b>{practice_status}</b><br>' +
                         'Organization: %{x}<br>' +
                         'Percentage: %{y:.1f}%<extra></extra>'
        ))
    
    fig.update_layout(
        barmode='group',
        title="Sustainability Practices by Organization Type",
        xaxis_title="Organization Type",
        yaxis_title="Percentage",
        showlegend=True,
        legend_title="Implementation Status",
        template="plotly_white",
        xaxis={'tickangle': -45},
        height=400,
        font=dict(family="Inter, sans-serif")
    )
    
    return fig

def create_org_goals_practices_chart(df: pd.DataFrame) -> go.Figure:
    """Create a chart showing relationship between sustainability goals and practices."""
    goals_col = "org_sustainability_goals"
    practices_col = "incorporate_sustainability_in_tasks"
    
    # Create contingency table
    contingency = pd.crosstab(
        df[goals_col],
        df[practices_col],
        normalize='index'
    ) * 100  # Convert to percentages
    
    # Create grouped bar chart
    fig = go.Figure()
    
    for practice_status in contingency.columns:
        fig.add_trace(go.Bar(
            name=practice_status,
            x=contingency.index,
            y=contingency[practice_status],
            text=[f"{val:.1f}%" for val in contingency[practice_status]],
            textposition='auto',
            hovertemplate=f'<b>{practice_status}</b><br>' +
                         'Has Goals: %{x}<br>' +
                         'Percentage: %{y:.1f}%<extra></extra>'
        ))
    
    fig.update_layout(
        barmode='group',
        title="Impact of Having Sustainability Goals on Implementation",
        xaxis_title="Has Sustainability Goals",
        yaxis_title="Percentage",
        showlegend=True,
        legend_title="Implementation Status",
        template="plotly_white",
        height=400,
        font=dict(family="Inter, sans-serif")
    )
    
    return fig

def create_org_csr_practices_chart(df: pd.DataFrame) -> go.Figure:
    """Create a chart showing relationship between having CSR team and practices."""
    csr_col = "org_csr_expert_team"
    practices_col = "incorporate_sustainability_in_tasks"
    
    # Create contingency table
    contingency = pd.crosstab(
        df[csr_col],
        df[practices_col],
        normalize='index'
    ) * 100  # Convert to percentages
    
    # Create grouped bar chart
    fig = go.Figure()
    
    for practice_status in contingency.columns:
        fig.add_trace(go.Bar(
            name=practice_status,
            x=contingency.index,
            y=contingency[practice_status],
            text=[f"{val:.1f}%" for val in contingency[practice_status]],
            textposition='auto',
            hovertemplate=f'<b>{practice_status}</b><br>' +
                         'Has CSR Team: %{x}<br>' +
                         'Percentage: %{y:.1f}%<extra></extra>'
        ))
    
    fig.update_layout(
        barmode='group',
        title="Impact of Having CSR Team on Implementation",
        xaxis_title="Has CSR Team/Expert",
        yaxis_title="Percentage",
        showlegend=True,
        legend_title="Implementation Status",
        template="plotly_white",
        height=400,
        font=dict(family="Inter, sans-serif")
    )
    
    return fig

def create_role_implementation_chart(df: pd.DataFrame) -> go.Figure:
    """Create a chart showing sustainability implementation by role."""
    role_col = "role"
    implementation_col = "incorporate_sustainability_in_tasks"
    
    # Create contingency table
    contingency = pd.crosstab(
        df[role_col],
        df[implementation_col],
        normalize='index'
    ) * 100  # Convert to percentages
    
    # Create grouped bar chart
    fig = go.Figure()
    
    for impl_status in contingency.columns:
        fig.add_trace(go.Bar(
            name=impl_status,
            x=contingency.index,
            y=contingency[impl_status],
            text=[f"{val:.1f}%" for val in contingency[impl_status]],
            textposition='auto',
            hovertemplate=f'<b>{impl_status}</b><br>' +
                         'Role: %{x}<br>' +
                         'Percentage: %{y:.1f}%<extra></extra>'
        ))
    
    fig.update_layout(
        barmode='group',
        title="Sustainability Implementation by Role",
        xaxis_title="Role",
        yaxis_title="Percentage",
        showlegend=True,
        legend_title="Implementation Status",
        template="plotly_white",
        xaxis={'tickangle': -45},
        height=500,
        font=dict(family="Inter, sans-serif")
    )
    
    return fig

def create_role_drivers_chart(df: pd.DataFrame) -> go.Figure:
    """Create a chart showing sustainability drivers by role."""
    role_col = "role"
    
    # Use the exact driver columns from JOB_TASK_MULTI_DRIVES
    driver_cols = [
        'What drives you to incorporate digital sustainability in your role-related tasks?  [Organizational policies ]',
        'What drives you to incorporate digital sustainability in your role-related tasks?  [Personal beliefs ]',
        'What drives you to incorporate digital sustainability in your role-related tasks?  [Client requirements ]',
        'What drives you to incorporate digital sustainability in your role-related tasks?  [User requirements]',
        'What drives you to incorporate digital sustainability in your role-related tasks?  [Legal requirements ]'
    ]
    
    # Verify each driver column exists
    available_driver_cols = []
    for col in driver_cols:
        if col in df.columns:
            available_driver_cols.append(col)
    
    if not available_driver_cols:
        fig = go.Figure()
        fig.update_layout(
            title="No driver data available",
            annotations=[
                dict(
                    text="No data available for drivers analysis",
                    xref="paper",
                    yref="paper",
                    x=0.5,
                    y=0.5,
                    showarrow=False
                )
            ],
            height=400
        )
        return fig
    
    # Create a mapping for shorter labels
    driver_labels = {
        'Organizational policies ': 'Organizational policies',
        'Personal beliefs ': 'Personal beliefs',
        'Client requirements ': 'Client requirements',
        'User requirements': 'User requirements',
        'Legal requirements ': 'Legal requirements'
    }
    
    # Calculate percentage of each driver by role
    driver_percentages = {}
    for driver_col in available_driver_cols:
        try:
            contingency = pd.crosstab(
                df[role_col],
                df[driver_col],
                normalize='index'
            ) * 100
            if "Selected" in contingency.columns:
                driver_name = driver_col.split('[')[-1].split(']')[0].strip()
                driver_percentages[driver_labels.get(driver_name, driver_name)] = contingency["Selected"]
        except Exception:
            pass
    
    if not driver_percentages:
        fig = go.Figure()
        fig.update_layout(
            title="No driver data available",
            annotations=[
                dict(
                    text="No valid data available for drivers analysis",
                    xref="paper",
                    yref="paper",
                    x=0.5,
                    y=0.5,
                    showarrow=False
                )
            ],
            height=400
        )
        return fig
    
    # Create heatmap
    roles = list(driver_percentages[list(driver_percentages.keys())[0]].index)
    drivers = list(driver_percentages.keys())
    z_values = [[driver_percentages[driver][role] for driver in drivers] for role in roles]
    
    fig = go.Figure(data=go.Heatmap(
        z=z_values,
        x=drivers,
        y=roles,
        colorscale="Viridis",
        text=[[f"{val:.1f}%" for val in row] for row in z_values],
        texttemplate="%{text}",
        textfont={"size": 10},
        textcolor="white",
        showscale=True,
        hovertemplate='<b>%{y}</b><br>' +
                     'Driver: %{x}<br>' +
                     'Percentage: %{z:.1f}%<extra></extra>'
    ))
    
    fig.update_layout(
        title="Drivers of Sustainability Implementation by Role",
        xaxis_title="Driver",
        yaxis_title="Role",
        template="plotly_white",
        height=600,
        xaxis={'tickangle': -45},
        font=dict(family="Inter, sans-serif")
    )
    
    return fig

def create_role_barriers_chart(df: pd.DataFrame) -> go.Figure:
    """Create a chart showing sustainability barriers by role."""
    role_col = "role"
    
    # Use a subset of barriers for better visualization, with exact column names
    barrier_cols = [
        "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Lack of knowledge or awareness (e.g., not knowing enough about sustainability impact or best practices)]",
        "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Limited resources or budget (e.g., financial constraints, insufficient tools or technology)]",
        "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Insufficient time or competing priorities (e.g., pressing deadlines, other projects taking precedence)]",
        "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Lack of organizational or leadership support (e.g., limited buy-in from management, inadequate policy frameworks)]",
        "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Complexity or uncertainty of sustainability solutions (e.g., difficulty measuring impact or navigating standards)]"
    ]
    
    # Verify each barrier column exists
    available_barrier_cols = []
    for col in barrier_cols:
        if col in df.columns:
            available_barrier_cols.append(col)
    
    if not available_barrier_cols:
        fig = go.Figure()
        fig.update_layout(
            title="No barrier data available",
            annotations=[
                dict(
                    text="No data available for barriers analysis",
                    xref="paper",
                    yref="paper",
                    x=0.5,
                    y=0.5,
                    showarrow=False
                )
            ],
            height=400
        )
        return fig
    
    # Create a mapping for shorter labels
    barrier_labels = {
        'Lack of knowledge or awareness (e.g., not knowing enough about sustainability impact or best practices)': 'Lack of knowledge or awareness',
        'Limited resources or budget (e.g., financial constraints, insufficient tools or technology)': 'Limited resources or budget',
        'Insufficient time or competing priorities (e.g., pressing deadlines, other projects taking precedence)': 'Insufficient time or competing priorities',
        'Lack of organizational or leadership support (e.g., limited buy-in from management, inadequate policy frameworks)': 'Lack of organizational or leadership support',
        'Complexity or uncertainty of sustainability solutions (e.g., difficulty measuring impact or navigating standards)': 'Complexity or uncertainty of sustainability solutions'
    }
    
    # Calculate percentage of each barrier by role
    barrier_percentages = {}
    for barrier_col in available_barrier_cols:
        try:
            contingency = pd.crosstab(
                df[role_col],
                df[barrier_col],
                normalize='index'
            ) * 100
            if "Selected" in contingency.columns:
                barrier_name = barrier_col.split('[')[-1].split(']')[0].strip()
                barrier_percentages[barrier_labels.get(barrier_name, barrier_name)] = contingency["Selected"]
        except Exception:
            pass
    
    if not barrier_percentages:
        fig = go.Figure()
        fig.update_layout(
            title="No barrier data available",
            annotations=[
                dict(
                    text="No valid data available for barriers analysis",
                    xref="paper",
                    yref="paper",
                    x=0.5,
                    y=0.5,
                    showarrow=False
                )
            ],
            height=400
        )
        return fig
    
    # Create heatmap
    roles = list(barrier_percentages[list(barrier_percentages.keys())[0]].index)
    barriers = list(barrier_percentages.keys())
    z_values = [[barrier_percentages[barrier][role] for barrier in barriers] for role in roles]
    
    fig = go.Figure(data=go.Heatmap(
        z=z_values,
        x=barriers,
        y=roles,
        colorscale="Reds",
        text=[[f"{val:.1f}%" for val in row] for row in z_values],
        texttemplate="%{text}",
        textfont={"size": 10},
        textcolor="white",
        showscale=True,
        hovertemplate='<b>%{y}</b><br>' +
                     'Barrier: %{x}<br>' +
                     'Percentage: %{z:.1f}%<extra></extra>'
    ))
    
    fig.update_layout(
        title="Barriers to Sustainability Implementation by Role",
        xaxis_title="Barrier",
        yaxis_title="Role",
        template="plotly_white",
        height=600,
        xaxis={'tickangle': -45},
        font=dict(family="Inter, sans-serif")
    )
    
    return fig

def create_barriers_by_org_type_chart(df: pd.DataFrame) -> go.Figure:
    """Create a heatmap showing barriers by organization type."""
    org_type_col = "organization_type"
    
    # Use the same barrier columns as in create_role_barriers_chart
    barrier_cols = [
        "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Lack of knowledge or awareness (e.g., not knowing enough about sustainability impact or best practices)]",
        "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Limited resources or budget (e.g., financial constraints, insufficient tools or technology)]",
        "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Insufficient time or competing priorities (e.g., pressing deadlines, other projects taking precedence)]",
        "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Lack of organizational or leadership support (e.g., limited buy-in from management, inadequate policy frameworks)]",
        "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Complexity or uncertainty of sustainability solutions (e.g., difficulty measuring impact or navigating standards)]"
    ]
    
    # Create a mapping for shorter labels
    barrier_labels = {
        'Lack of knowledge or awareness (e.g., not knowing enough about sustainability impact or best practices)': 'Lack of knowledge or awareness',
        'Limited resources or budget (e.g., financial constraints, insufficient tools or technology)': 'Limited resources or budget',
        'Insufficient time or competing priorities (e.g., pressing deadlines, other projects taking precedence)': 'Insufficient time or competing priorities',
        'Lack of organizational or leadership support (e.g., limited buy-in from management, inadequate policy frameworks)': 'Lack of organizational or leadership support',
        'Complexity or uncertainty of sustainability solutions (e.g., difficulty measuring impact or navigating standards)': 'Complexity or uncertainty of sustainability solutions'
    }
    
    # Calculate percentage of each barrier by organization type
    barrier_percentages = {}
    for barrier_col in barrier_cols:
        try:
            contingency = pd.crosstab(
                df[org_type_col],
                df[barrier_col],
                normalize='index'
            ) * 100
            if "Selected" in contingency.columns:
                barrier_name = barrier_col.split('[')[-1].split(']')[0].strip()
                barrier_percentages[barrier_labels.get(barrier_name, barrier_name)] = contingency["Selected"]
        except Exception:
            pass
    
    if not barrier_percentages:
        return create_no_data_figure("No barrier data available")
    
    # Create heatmap
    org_types = list(barrier_percentages[list(barrier_percentages.keys())[0]].index)
    barriers = list(barrier_percentages.keys())
    z_values = [[barrier_percentages[barrier][org_type] for barrier in barriers] for org_type in org_types]
    
    fig = go.Figure(data=go.Heatmap(
        z=z_values,
        x=barriers,
        y=org_types,
        colorscale="Reds",
        text=[[f"{val:.1f}%" for val in row] for row in z_values],
        texttemplate="%{text}",
        textfont={"size": 10},
        textcolor="white",
        showscale=True,
        hovertemplate='<b>%{y}</b><br>' +
                     'Barrier: %{x}<br>' +
                     'Percentage: %{z:.1f}%<extra></extra>'
    ))
    
    fig.update_layout(
        title="Barriers by Organization Type",
        xaxis_title="Barrier",
        yaxis_title="Organization Type",
        template="plotly_white",
        height=500,
        xaxis={'tickangle': -45},
        font=dict(family="Inter, sans-serif")
    )
    
    return fig

def create_drivers_by_org_type_chart(df: pd.DataFrame) -> go.Figure:
    """Create a heatmap showing drivers by organization type."""
    org_type_col = "organization_type"
    
    # Use the same driver columns as in create_role_drivers_chart
    driver_cols = [
        'What drives you to incorporate digital sustainability in your role-related tasks?  [Organizational policies ]',
        'What drives you to incorporate digital sustainability in your role-related tasks?  [Personal beliefs ]',
        'What drives you to incorporate digital sustainability in your role-related tasks?  [Client requirements ]',
        'What drives you to incorporate digital sustainability in your role-related tasks?  [User requirements]',
        'What drives you to incorporate digital sustainability in your role-related tasks?  [Legal requirements ]'
    ]
    
    # Create a mapping for shorter labels
    driver_labels = {
        'Organizational policies ': 'Organizational policies',
        'Personal beliefs ': 'Personal beliefs',
        'Client requirements ': 'Client requirements',
        'User requirements': 'User requirements',
        'Legal requirements ': 'Legal requirements'
    }
    
    # Calculate percentage of each driver by organization type
    driver_percentages = {}
    for driver_col in driver_cols:
        try:
            contingency = pd.crosstab(
                df[org_type_col],
                df[driver_col],
                normalize='index'
            ) * 100
            if "Selected" in contingency.columns:
                driver_name = driver_col.split('[')[-1].split(']')[0].strip()
                driver_percentages[driver_labels.get(driver_name, driver_name)] = contingency["Selected"]
        except Exception:
            pass
    
    if not driver_percentages:
        return create_no_data_figure("No driver data available")
    
    # Create heatmap
    org_types = list(driver_percentages[list(driver_percentages.keys())[0]].index)
    drivers = list(driver_percentages.keys())
    z_values = [[driver_percentages[driver][org_type] for driver in drivers] for org_type in org_types]
    
    fig = go.Figure(data=go.Heatmap(
        z=z_values,
        x=drivers,
        y=org_types,
        colorscale="Viridis",
        text=[[f"{val:.1f}%" for val in row] for row in z_values],
        texttemplate="%{text}",
        textfont={"size": 10},
        textcolor="white",
        showscale=True,
        hovertemplate='<b>%{y}</b><br>' +
                     'Driver: %{x}<br>' +
                     'Percentage: %{z:.1f}%<extra></extra>'
    ))
    
    fig.update_layout(
        title="Drivers by Organization Type",
        xaxis_title="Driver",
        yaxis_title="Organization Type",
        template="plotly_white",
        height=500,
        xaxis={'tickangle': -45},
        font=dict(family="Inter, sans-serif")
    )
    
    return fig

def create_barriers_drivers_correlation_chart(df: pd.DataFrame) -> go.Figure:
    """Create a correlation heatmap between barriers and drivers."""
    # Get barrier and driver columns
    barrier_cols = [col for col in df.columns if "hinder" in col.lower() and "[" in col]
    driver_cols = [col for col in df.columns if "drive" in col.lower() and "[" in col]
    
    if not barrier_cols or not driver_cols:
        return create_no_data_figure("No barrier/driver data available")
    
    # Create binary matrices for barriers and drivers
    barrier_matrix = df[barrier_cols].fillna(0).astype(bool).astype(int)
    driver_matrix = df[driver_cols].fillna(0).astype(bool).astype(int)
    
    # Calculate correlation matrix
    correlation_matrix = pd.DataFrame(index=barrier_cols, columns=driver_cols)
    for barrier in barrier_cols:
        for driver in driver_cols:
            correlation = np.corrcoef(barrier_matrix[barrier], driver_matrix[driver])[0, 1]
            correlation_matrix.loc[barrier, driver] = correlation
    
    # Simplify labels
    barrier_labels = [col.split('[')[-1].split(']')[0].strip() for col in barrier_cols]
    driver_labels = [col.split('[')[-1].split(']')[0].strip() for col in driver_cols]
    
    # Create heatmap
    fig = go.Figure(data=go.Heatmap(
        z=correlation_matrix.values,
        x=driver_labels,
        y=barrier_labels,
        colorscale="RdBu",
        zmid=0,
        text=[[f"{val:.2f}" for val in row] for row in correlation_matrix.values],
        texttemplate="%{text}",
        textfont={"size": 10, "color": "black"},
        showscale=True,
        hovertemplate='<b>Barrier:</b> %{y}<br>' +
                     '<b>Driver:</b> %{x}<br>' +
                     '<b>Correlation:</b> %{z:.2f}<extra></extra>'
    ))
    
    fig.update_layout(
        title="Correlation between Barriers and Drivers",
        xaxis_title="Drivers",
        yaxis_title="Barriers",
        template="plotly_white",
        height=600,
        xaxis={'tickangle': -45},
        font=dict(family="Inter, sans-serif")
    )
    
    return fig

def build_insights_page(df: pd.DataFrame) -> html.Div:
    """Build the insights page layout with cross-question analysis."""
    
    # Find awareness column by partial match
    awareness_cols = [col for col in df.columns if "umbrella term" in col]
    
    if not awareness_cols:
        return html.Div("Error: Could not find the definition awareness column. Please check the data.")
    
    # Use the first matching column
    awareness_col = awareness_cols[0]
    implementation_col = "incorporate_sustainability_in_tasks"
    
    # Enhanced page header
    page_header = html.Div([
        html.Div([
            html.H2([
                html.I(className="bi bi-graph-up-arrow me-3"),
                "Cross-Question Insights"
            ], className="page-title mb-0"),
            html.P("Deep analytical insights revealing patterns and relationships across survey responses", 
                   className="page-subtitle mb-0")
        ], className="page-header-content")
    ], className="page-header mb-5")

    # Calculate key statistics for awareness impact
    def_aware_count = df[awareness_col].value_counts().get("Yes", 0)
    total_def_responses = df[awareness_col].notna().sum()
    def_aware_pct = round((def_aware_count / total_def_responses * 100) if total_def_responses > 0 else 0)

    impl_count = df[implementation_col].value_counts().get("Yes", 0)
    total_impl_responses = df[implementation_col].notna().sum()
    impl_pct = round((impl_count / total_impl_responses * 100) if total_impl_responses > 0 else 0)

    # Create enhanced statistics cards for awareness section
    awareness_stats_row = dbc.Row([
        build_enhanced_stat_card(
            "Definition Awareness",
            f"{def_aware_pct}%",
            "bi-lightbulb-fill",
            "linear-gradient(135deg, #831E82 0%, #A450A3 100%)",
            f"{def_aware_count} out of {total_def_responses} respondents"
        ),
        build_enhanced_stat_card(
            "Implementation Rate",
            f"{impl_pct}%",
            "bi-gear-fill", 
            "linear-gradient(135deg, #A450A3 0%, #C581C4 100%)",
            f"{impl_count} out of {total_impl_responses} organizations"
        )
    ], className="mb-5")

    # Create the awareness impact charts
    awareness_impl_fig = create_awareness_implementation_chart(df)
    training_impl_fig = create_training_implementation_chart(df)
    discussion_impl_fig = create_discussion_implementation_chart(df)

    # Awareness and Implementation section
    awareness_section = dbc.Container([
        dbc.Card([
            dbc.CardHeader([
                html.H4([
                    html.I(className="bi bi-lightbulb me-3"),
                    "Awareness and Implementation"
                ], className="mb-0 text-white")
            ], className="enhanced-card-header"),
            dbc.CardBody([
                html.P(
                    "Analyze the relationship between awareness of digital sustainability and its practical implementation in organizations.",
                    className="mb-4 text-muted"
                ),
                awareness_stats_row,
                
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-bar-chart me-2"),
                            "Impact of Definition Awareness on Implementation"
                        ], className="mb-0")
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=awareness_impl_fig, responsive=True),
                        html.Hr(),
                        html.Div([
                            html.H6([html.I(className="bi bi-info-circle me-2"), "Analysis Methodology:"], className="text-primary"),
                            html.P([
                                "This chart examines the correlation between understanding of digital sustainability concepts and actual implementation. ",
                                "We calculate the percentage of organizations implementing sustainable practices within each awareness group (Yes/No). ",
                                "The calculation uses cross-tabulation (contingency tables) with row-wise normalization to show the proportion of implementation ",
                                "status for each level of awareness. This helps identify if organizations with better understanding are more likely to implement practices."
                            ], className="text-muted small")
                        ])
                    ])
                ], className="enhanced-chart-card mb-4"),

                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-mortarboard me-2"),
                            "Impact of Training on Implementation"
                        ], className="mb-0")
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=training_impl_fig, responsive=True),
                        html.Hr(),
                        html.Div([
                            html.H6([html.I(className="bi bi-info-circle me-2"), "Analysis Methodology:"], className="text-primary"),
                            html.P([
                                "This visualization explores how training participation influences implementation rates. ",
                                "Using cross-tabulation analysis, we compare the implementation rates between organizations where employees have/haven't participated in training. ",
                                "The percentages are calculated by dividing the count of each implementation status by the total number of organizations in each training group. ",
                                "This helps quantify the effectiveness of training programs in driving sustainable practices."
                            ], className="text-muted small")
                        ])
                    ])
                ], className="enhanced-chart-card mb-4"),

                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-chat-dots me-2"),
                            "Impact of Discussion Frequency on Implementation"
                        ], className="mb-0")
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=discussion_impl_fig, responsive=True),
                        html.Hr(),
                        html.Div([
                            html.H6([html.I(className="bi bi-info-circle me-2"), "Analysis Methodology:"], className="text-primary"),
                            html.P([
                                "This chart analyzes how the frequency of sustainability discussions correlates with implementation. ",
                                "We use cross-tabulation to show the percentage of organizations implementing practices across different discussion frequency levels. ",
                                "The analysis helps understand if more frequent discussions about sustainability translate to higher implementation rates, ",
                                "suggesting the importance of organizational discourse in driving sustainable practices."
                            ], className="text-muted small")
                        ])
                    ])
                ], className="enhanced-chart-card")
            ])
        ], className="enhanced-chart-card mb-5")
    ], fluid=True)
    
    # Create organizational factors charts
    org_type_fig = create_org_type_sustainability_chart(df)
    org_goals_fig = create_org_goals_practices_chart(df)
    org_csr_fig = create_org_csr_practices_chart(df)
    
    # Calculate key statistics for organizational factors
    has_goals_count = df["org_sustainability_goals"].value_counts().get("Yes", 0)
    has_csr_count = df["org_csr_expert_team"].value_counts().get("Yes", 0)
    total_orgs = len(df)
    
    goals_pct = round((has_goals_count / total_orgs * 100) if total_orgs > 0 else 0)
    csr_pct = round((has_csr_count / total_orgs * 100) if total_orgs > 0 else 0)
    
    # Create enhanced statistics cards for organizational factors
    org_stats_row = dbc.Row([
        build_enhanced_stat_card(
            "Have Sustainability Goals",
            f"{goals_pct}%",
            "bi-bullseye",
            "linear-gradient(135deg, #C581C4 0%, #E6B3E5 100%)",
            f"{has_goals_count} out of {total_orgs} organizations"
        ),
        build_enhanced_stat_card(
            "Have CSR Team/Expert",
            f"{csr_pct}%",
            "bi-people-fill",
            "linear-gradient(135deg, #E6B3E5 0%, #F0D0EF 100%)",
            f"{has_csr_count} out of {total_orgs} organizations"
        )
    ], className="mb-5")
    
    # Organizational factors section
    org_factors_section = dbc.Container([
        dbc.Card([
            dbc.CardHeader([
                html.H4([
                    html.I(className="bi bi-building me-3"),
                    "Organizational Factors"
                ], className="mb-0 text-white")
            ], className="enhanced-card-header"),
            dbc.CardBody([
                html.P(
                    "Explore how organizational characteristics influence digital sustainability practices and outcomes.",
                    className="mb-4 text-muted"
                ),
                org_stats_row,
                
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-building-gear me-2"),
                            "Sustainability Implementation by Organization Type"
                        ], className="mb-0")
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=org_type_fig, responsive=True),
                        html.Hr(),
                        html.Div([
                            html.H6([html.I(className="bi bi-info-circle me-2"), "Analysis Methodology:"], className="text-primary"),
                            html.P([
                                "This visualization breaks down sustainability implementation rates across different organization types. ",
                                "Using cross-tabulation with row-wise normalization, we calculate the percentage of organizations implementing sustainable practices within each organization type. ",
                                "This analysis helps identify which sectors are leading in sustainability adoption and where there might be room for improvement. ",
                                "The percentages are calculated by dividing the count of each implementation status by the total number of organizations of each type."
                            ], className="text-muted small")
                        ])
                    ])
                ], className="enhanced-chart-card mb-4"),

                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-target me-2"),
                            "Impact of Having Sustainability Goals"
                        ], className="mb-0")
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=org_goals_fig, responsive=True),
                        html.Hr(),
                        html.Div([
                            html.H6([html.I(className="bi bi-info-circle me-2"), "Analysis Methodology:"], className="text-primary"),
                            html.P([
                                "This chart examines the relationship between having formal sustainability goals and actual implementation. ",
                                "We use contingency table analysis to compare implementation rates between organizations with and without specific sustainability goals. ",
                                "The percentages show what proportion of organizations in each group (with/without goals) are implementing sustainable practices. ",
                                "This helps quantify how formal goal-setting influences practical implementation."
                            ], className="text-muted small")
                        ])
                    ])
                ], className="enhanced-chart-card mb-4"),

                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-people-fill me-2"),
                            "Impact of Having CSR Team/Expert"
                        ], className="mb-0")
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=org_csr_fig, responsive=True),
                        html.Hr(),
                        html.Div([
                            html.H6([html.I(className="bi bi-info-circle me-2"), "Analysis Methodology:"], className="text-primary"),
                            html.P([
                                "This visualization analyzes how having dedicated sustainability resources affects implementation. ",
                                "Using cross-tabulation, we compare implementation rates between organizations with and without CSR teams/experts. ",
                                "The percentages represent the proportion of organizations implementing practices within each group. ",
                                "This helps understand the value of dedicated sustainability resources in driving implementation."
                            ], className="text-muted small")
                        ])
                    ])
                ], className="enhanced-chart-card")
            ])
        ], className="enhanced-chart-card mb-5")
    ], fluid=True)
    
    # Create role-based analysis charts
    role_impl_fig = create_role_implementation_chart(df)
    role_drivers_fig = create_role_drivers_chart(df)
    role_barriers_fig = create_role_barriers_chart(df)
    
    # Calculate key statistics for role-based analysis
    total_respondents = len(df)
    implements_sustainability = df[implementation_col].value_counts().get("Yes", 0)
    implementation_rate = round((implements_sustainability / total_respondents * 100) if total_respondents > 0 else 0)
    
    # Create enhanced statistics card for role-based analysis
    role_stats_row = dbc.Row([
        build_enhanced_stat_card(
            "Overall Implementation Rate",
            f"{implementation_rate}%",
            "bi-person-workspace",
            "linear-gradient(135deg, #831E82 0%, #A450A3 100%)",
            f"{implements_sustainability} out of {total_respondents} respondents"
        )
    ], className="mb-5")
    
    # Role-based section
    role_section = dbc.Container([
        dbc.Card([
            dbc.CardHeader([
                html.H4([
                    html.I(className="bi bi-person-badge me-3"),
                    "Role-Based Analysis"
                ], className="mb-0 text-white")
            ], className="enhanced-card-header"),
            dbc.CardBody([
                html.P(
                    "Understand how different roles perceive and implement digital sustainability practices.",
                    className="mb-4 text-muted"
                ),
                role_stats_row,
                
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-person-workspace me-2"),
                            "Implementation by Role"
                        ], className="mb-0")
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=role_impl_fig, responsive=True),
                        html.Hr(),
                        html.Div([
                            html.H6([html.I(className="bi bi-info-circle me-2"), "Analysis Methodology:"], className="text-primary"),
                            html.P([
                                "This visualization shows how sustainability implementation varies across different professional roles. ",
                                "Using cross-tabulation with row-wise normalization, we calculate the percentage of individuals in each role who incorporate sustainability practices. ",
                                "This helps identify which roles are most actively engaged in sustainability implementation and where there might be opportunities for improvement. ",
                                "The percentages represent the proportion of individuals implementing practices within each role category."
                            ], className="text-muted small")
                        ])
                    ])
                ], className="enhanced-chart-card mb-4"),

                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-arrow-up-circle me-2"),
                            "Drivers by Role"
                        ], className="mb-0")
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=role_drivers_fig, responsive=True),
                        html.Hr(),
                        html.Div([
                            html.H6([html.I(className="bi bi-info-circle me-2"), "Analysis Methodology:"], className="text-primary"),
                            html.P([
                                "This heatmap visualizes what drives sustainability implementation across different roles. ",
                                "For each role-driver combination, we calculate the percentage of respondents who selected that driver. ",
                                "The color intensity represents the percentage, with darker colors indicating higher percentages. ",
                                "This analysis helps understand what motivates different roles to implement sustainable practices and can inform role-specific strategies."
                            ], className="text-muted small")
                        ])
                    ])
                ], className="enhanced-chart-card mb-4"),

                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-exclamation-triangle me-2"),
                            "Barriers by Role"
                        ], className="mb-0")
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=role_barriers_fig, responsive=True),
                        html.Hr(),
                        html.Div([
                            html.H6([html.I(className="bi bi-info-circle me-2"), "Analysis Methodology:"], className="text-primary"),
                            html.P([
                                "This heatmap shows the barriers to sustainability implementation faced by different roles. ",
                                "For each role-barrier combination, we calculate the percentage of respondents who identified that barrier. ",
                                "The color intensity indicates the percentage, with darker colors showing higher percentages. ",
                                "This analysis helps identify role-specific challenges and can guide targeted interventions to overcome these barriers."
                            ], className="text-muted small")
                        ])
                    ])
                ], className="enhanced-chart-card")
            ])
        ], className="enhanced-chart-card mb-5")
    ], fluid=True)
    
    # Barriers and drivers section
    barriers_drivers_section = dbc.Container([
        dbc.Card([
            dbc.CardHeader([
                html.H4([
                    html.I(className="bi bi-bar-chart-steps me-3"),
                    "Barriers and Drivers Analysis"
                ], className="mb-0 text-white")
            ], className="enhanced-card-header"),
            dbc.CardBody([
                html.P(
                    "Analyze the relationships between various barriers and drivers across different organizational contexts.",
                    className="mb-4 text-muted"
                ),
                
                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-shield-exclamation me-2"),
                            "Barriers by Organization Type"
                        ], className="mb-0")
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=create_barriers_by_org_type_chart(df), responsive=True),
                        html.Hr(),
                        html.Div([
                            html.H6([html.I(className="bi bi-info-circle me-2"), "Analysis Methodology:"], className="text-primary"),
                            html.P([
                                "This heatmap visualizes how different barriers to sustainability implementation vary across organization types. ",
                                "For each organization type-barrier combination, we calculate the percentage of respondents who identified that barrier. ",
                                "The color intensity represents the percentage, with darker colors indicating higher percentages. ",
                                "This analysis helps identify which barriers are most prevalent in different organizational contexts."
                            ], className="text-muted small")
                        ])
                    ])
                ], className="enhanced-chart-card mb-4"),

                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-rocket me-2"),
                            "Drivers by Organization Type"
                        ], className="mb-0")
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=create_drivers_by_org_type_chart(df), responsive=True),
                        html.Hr(),
                        html.Div([
                            html.H6([html.I(className="bi bi-info-circle me-2"), "Analysis Methodology:"], className="text-primary"),
                            html.P([
                                "This heatmap shows how different drivers of sustainability implementation vary across organization types. ",
                                "For each organization type-driver combination, we calculate the percentage of respondents who selected that driver. ",
                                "The color intensity represents the percentage, with darker colors showing higher percentages. ",
                                "This analysis helps understand what motivates sustainability implementation in different organizational contexts."
                            ], className="text-muted small")
                        ])
                    ])
                ], className="enhanced-chart-card mb-4"),

                dbc.Card([
                    dbc.CardHeader([
                        html.H5([
                            html.I(className="bi bi-diagram-3 me-2"),
                            "Correlation between Barriers and Drivers"
                        ], className="mb-0")
                    ]),
                    dbc.CardBody([
                        dcc.Graph(figure=create_barriers_drivers_correlation_chart(df), responsive=True),
                        html.Hr(),
                        html.Div([
                            html.H6([html.I(className="bi bi-info-circle me-2"), "Analysis Methodology:"], className="text-primary"),
                            html.P([
                                "This correlation matrix explores the relationships between barriers and drivers of sustainability implementation. ",
                                "We calculate the correlation coefficient between each barrier-driver pair based on whether respondents selected them. ",
                                "Positive correlations (red) indicate that the barrier and driver tend to be selected together, ",
                                "while negative correlations (blue) suggest they tend to be selected separately. ",
                                "This analysis helps identify potential relationships between obstacles and motivations."
                            ], className="text-muted small")
                        ])
                    ])
                ], className="enhanced-chart-card")
            ])
        ], className="enhanced-chart-card")
    ], fluid=True)

    return html.Div([
        page_header,
        awareness_section,
        org_factors_section,
        role_section,
        barriers_drivers_section
    ], className="insights-page") 