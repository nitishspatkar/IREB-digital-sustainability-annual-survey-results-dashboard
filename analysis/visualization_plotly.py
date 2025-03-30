import plotly.express as px

def plot_bar_single_year(df, column_name: str, year: int, title: str):
    df_year = df[df["year"] == year]
    counts = df_year[column_name].value_counts().reset_index()
    counts.columns = [column_name, "count"]

    fig = px.bar(
        counts,
        x=column_name,
        y="count",
        title=title
    )
    return fig  # <--- return the figure instead of fig.show()

def plot_bar_multi_year(df, column_name: str, title: str):
    grouped = df.groupby(["year", column_name]).size().reset_index(name="count")

    fig = px.bar(
        grouped,
        x=column_name,
        y="count",
        color="year",
        barmode="group",
        title=title
    )
    return fig  # <--- return the figure instead of fig.show()
