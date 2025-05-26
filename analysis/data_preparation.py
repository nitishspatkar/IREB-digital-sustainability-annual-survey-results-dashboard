import pandas as pd
import os
from rename_config import rename_mapping

def load_single_year_data(data_folder, year):
    """
    Loads a single CSV file for the specified year from data_folder,
    applies the rename_mapping from rename_config.py, and returns the final DataFrame.

    :param data_folder: Folder containing the CSV file (e.g., 'data').
    :param year: The year (int) corresponding to the CSV file name (e.g., 2025).
    :return: DataFrame with columns stripped of extra whitespace and renamed per rename_mapping.
    """
    # 1) Construct file path based on year
    file_path = os.path.join(data_folder, f"{year}.csv")

    # 2) Read CSV
    df = pd.read_csv(file_path)

    # 3) Strip any extra whitespace from columns
    df.columns = df.columns.str.strip()
    df = df.loc[:, ~df.columns.duplicated()]        

    # 4) Apply the rename mapping
    df.rename(columns=rename_mapping, inplace=True)


    # 5) Return the final DataFrame
    return df
