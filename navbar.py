"""Reusable navbar component for Dash/Plotly applications."""

import dash_bootstrap_components as dbc
from dash import html

# ---- Style Variables (can be customized per project) ----
NAVBAR_STYLE_VARS = {
    "PRIMARY_COLOR": "#831E82",
    "SECONDARY_COLOR": "#A450A3",
    "TERTIARY_COLOR": "#C581C4",
    "BACKGROUND_COLOR": "#f8f9fa",
    "FONT_FAMILY": "Helvetica",
    "FONT_SIZE": 16,
    "BRAND_FONT_SIZE": 20,
    "BRAND_FONT_WEIGHT": "bold",
    "NAV_LINK_FONT_SIZE": 14,
    "NAV_LINK_PADDING": "0.5rem 1rem",
    "NAV_LINK_MARGIN": "0 0.25rem",
    "STICKY_TOP": True,
    "MARGIN_BOTTOM": "2rem",
}

def build_navbar(
    brand_text: str = "Dashboard",
    brand_href: str = "/",
    nav_items: list = None,
    custom_style: dict = None,
    show_brand: bool = True,
    dark_theme: bool = True
) -> dbc.Navbar:
    """
    Build a reusable navbar component.
    
    Args:
        brand_text (str): Text to display as the brand/logo
        brand_href (str): Link for the brand (usually home page)
        nav_items (list): List of navigation items, each should be a dict with 'text' and 'href'
        custom_style (dict): Custom style overrides
        show_brand (bool): Whether to show the brand/logo
        dark_theme (bool): Whether to use dark theme (True) or light theme (False)
    
    Returns:
        dbc.Navbar: Configured navbar component
    """
    
    # Default navigation items if none provided
    if nav_items is None:
        nav_items = [
            {"text": "Home", "href": "/"},
            {"text": "Insights", "href": "/insights"},
            {"text": "Demographics", "href": "/demographics"},
            {"text": "Organization", "href": "/organization"},
            {"text": "Awareness", "href": "/awareness"},
        ]
    
    # Merge custom styles with defaults
    style_vars = NAVBAR_STYLE_VARS.copy()
    if custom_style:
        style_vars.update(custom_style)
    
    # Build navigation links
    nav_links = []
    for item in nav_items:
        nav_links.append(
            dbc.NavItem(
                dbc.NavLink(
                    item["text"],
                    href=item["href"],
                    style={
                        "fontSize": style_vars["NAV_LINK_FONT_SIZE"],
                        "padding": style_vars["NAV_LINK_PADDING"],
                        "margin": style_vars["NAV_LINK_MARGIN"],
                        "fontFamily": style_vars["FONT_FAMILY"],
                    }
                )
            )
        )
    
    # Build navbar content
    navbar_content = []
    
    if show_brand:
        navbar_content.append(
            dbc.NavbarBrand(
                brand_text,
                href=brand_href,
                style={
                    "fontWeight": style_vars["BRAND_FONT_WEIGHT"],
                    "fontSize": style_vars["BRAND_FONT_SIZE"],
                    "fontFamily": style_vars["FONT_FAMILY"],
                }
            )
        )
    
    navbar_content.append(
        dbc.Nav(
            nav_links,
            navbar=True,
            className="ms-auto"  # Push nav items to the right
        )
    )
    
    # Build the navbar
    navbar = dbc.Navbar(
        dbc.Container(navbar_content),
        color=style_vars["PRIMARY_COLOR"],
        dark=dark_theme,
        sticky="top" if style_vars["STICKY_TOP"] else False,
        style={
            "marginBottom": style_vars["MARGIN_BOTTOM"],
            "fontFamily": style_vars["FONT_FAMILY"],
        }
    )
    
    return navbar

def build_simple_navbar(
    brand_text: str = "Dashboard",
    brand_href: str = "/",
    nav_items: list = None,
    custom_style: dict = None
) -> dbc.NavbarSimple:
    """
    Build a simpler navbar using dbc.NavbarSimple for basic use cases.
    
    Args:
        brand_text (str): Text to display as the brand/logo
        brand_href (str): Link for the brand (usually home page)
        nav_items (list): List of navigation items, each should be a dict with 'text' and 'href'
        custom_style (dict): Custom style overrides
    
    Returns:
        dbc.NavbarSimple: Configured simple navbar component
    """
    
    # Default navigation items if none provided
    if nav_items is None:
        nav_items = [
            {"text": "Home", "href": "/"},
            {"text": "Insights", "href": "/insights"},
            {"text": "Demographics", "href": "/demographics"},
            {"text": "Organization", "href": "/organization"},
            {"text": "Awareness", "href": "/awareness"},
        ]
    
    # Merge custom styles with defaults
    style_vars = NAVBAR_STYLE_VARS.copy()
    if custom_style:
        style_vars.update(custom_style)
    
    # Convert nav_items to the format expected by NavbarSimple
    nav_links = []
    for item in nav_items:
        nav_links.append(
            dbc.NavItem(
                dbc.NavLink(
                    item["text"],
                    href=item["href"],
                    style={
                        "fontSize": style_vars["NAV_LINK_FONT_SIZE"],
                        "fontFamily": style_vars["FONT_FAMILY"],
                    }
                )
            )
        )
    
    # Build the simple navbar
    navbar = dbc.NavbarSimple(
        children=nav_links,
        brand=brand_text,
        brand_href=brand_href,
        color=style_vars["PRIMARY_COLOR"],
        dark=True,
        sticky="top" if style_vars["STICKY_TOP"] else False,
        style={
            "marginBottom": style_vars["MARGIN_BOTTOM"],
            "fontFamily": style_vars["FONT_FAMILY"],
        }
    )
    
    return navbar

def build_sidebar_navbar(
    brand_text: str = "Dashboard",
    nav_items: list = None,
    custom_style: dict = None
) -> html.Div:
    """
    Build a sidebar-style navigation (useful for mobile or compact layouts).
    
    Args:
        brand_text (str): Text to display as the brand/logo
        nav_items (list): List of navigation items, each should be a dict with 'text' and 'href'
        custom_style (dict): Custom style overrides
    
    Returns:
        html.Div: Sidebar navigation component
    """
    
    # Default navigation items if none provided
    if nav_items is None:
        nav_items = [
            {"text": "Home", "href": "/"},
            {"text": "Insights", "href": "/insights"},
            {"text": "Demographics", "href": "/demographics"},
            {"text": "Organization", "href": "/organization"},
            {"text": "Awareness", "href": "/awareness"},
        ]
    
    # Merge custom styles with defaults
    style_vars = NAVBAR_STYLE_VARS.copy()
    if custom_style:
        style_vars.update(custom_style)
    
    # Sidebar style
    sidebar_style = {
        "position": "fixed",
        "top": 0,
        "left": 0,
        "bottom": 0,
        "width": "18rem",
        "padding": "2rem 1rem",
        "backgroundColor": style_vars["BACKGROUND_COLOR"],
        "borderRight": "1px solid #dee2e6",
        "overflowY": "auto",
        "fontFamily": style_vars["FONT_FAMILY"],
    }
    
    # Build navigation links
    nav_links = []
    for item in nav_items:
        nav_links.append(
            html.A(
                item["text"],
                href=item["href"],
                style={
                    "display": "block",
                    "padding": "0.75rem 1rem",
                    "color": style_vars["PRIMARY_COLOR"],
                    "textDecoration": "none",
                    "fontSize": style_vars["NAV_LINK_FONT_SIZE"],
                    "borderRadius": "0.375rem",
                    "marginBottom": "0.5rem",
                },
                className="nav-link"
            )
        )
    
    # Build the sidebar
    sidebar = html.Div([
        html.H4(
            brand_text,
            style={
                "color": style_vars["PRIMARY_COLOR"],
                "fontWeight": style_vars["BRAND_FONT_WEIGHT"],
                "fontSize": style_vars["BRAND_FONT_SIZE"],
                "marginBottom": "2rem",
                "textAlign": "center",
            }
        ),
        html.Div(nav_links)
    ], style=sidebar_style)
    
    return sidebar

# Example usage functions
def get_default_navbar() -> dbc.Navbar:
    """Get a default navbar with standard configuration."""
    return build_navbar()

def get_custom_navbar(
    brand_text: str,
    nav_items: list,
    primary_color: str = None
) -> dbc.Navbar:
    """Get a custom navbar with specific brand and navigation items."""
    custom_style = {}
    if primary_color:
        custom_style["PRIMARY_COLOR"] = primary_color
    
    return build_navbar(
        brand_text=brand_text,
        nav_items=nav_items,
        custom_style=custom_style
    )

# Export the style variables for external use
__all__ = [
    'build_navbar',
    'build_simple_navbar', 
    'build_sidebar_navbar',
    'get_default_navbar',
    'get_custom_navbar',
    'NAVBAR_STYLE_VARS'
] 