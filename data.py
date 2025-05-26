import pandas as pd
import re
from rename_config import rename_mapping

def parse_experience(val):
    """
    Parse years of experience from various formats:
    - Numeric (e.g., "5")
    - Range (e.g., "5-10")
    - "10+" or "10 or more"
    Returns a float or None.
    """
    if pd.isna(val):
        return None
    val = str(val).strip()
    # If already a number
    try:
        return float(val)
    except ValueError:
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

def clean_column_names(df):
    """
    Remove leading/trailing whitespace and replace non-breaking spaces in column names.
    """
    df.columns = df.columns.str.replace('\xa0', ' ').str.strip()
    return df

def load_data(csv_path):
    """
    Load and preprocess survey data from a CSV file.
    - Cleans column names
    - Renames columns using rename_mapping
    - Applies parse_experience to 'years_of_experience' if present
    Returns a pandas DataFrame.
    """
    df = pd.read_csv(csv_path)
    df = clean_column_names(df)
    df = df.rename(columns=rename_mapping)
    if "years_of_experience" in df.columns:
        df["years_of_experience"] = df["years_of_experience"].apply(parse_experience)
    return df