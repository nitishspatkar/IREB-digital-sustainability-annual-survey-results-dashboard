import pandas as pd

def get_counts_and_percentages(df: pd.DataFrame, column_name: str, year=None):
    """
    Returns counts and percentages for a given column_name in df.
    If year is provided, filters by that year.
    """
    if year is not None:
        df = df[df["year"] == year]
    
    counts = df[column_name].value_counts(dropna=False)
    percentages = (counts / len(df)) * 100
    return counts, percentages
