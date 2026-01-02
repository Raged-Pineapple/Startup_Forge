import pandas as pd
import plotly.express as px
import plotly.io as pio


def load_data():
    founders = pd.read_csv("founders_cleaned.csv")
    investors = pd.read_csv("investors_cleaned.csv")
    return founders, investors


def founder_eda_plots(df):
    figs = []

    # ---------- Funding round distribution ----------
    if "funding_round" in df.columns:
        funding_df = (
            df["funding_round"]
            .value_counts()
            .reset_index()
        )
        funding_df.columns = ["funding_round", "freq"]

        fig1 = px.bar(
            funding_df,
            x="funding_round",
            y="freq",
            title="Founder Funding Round Distribution"
        )
        figs.append(fig1)

    # ---------- Top companies ----------
    if "company" in df.columns:
        company_df = (
            df["company"]
            .value_counts()
            .head(10)
            .reset_index()
        )
        company_df.columns = ["company", "freq"]

        fig2 = px.bar(
            company_df,
            x="company",
            y="freq",
            title="Top 10 Companies"
        )
        figs.append(fig2)

    return figs


def investor_eda_plots(df):
    figs = []

    # Domain preference
    if "primary_domain" in df.columns:
        fig1 = px.pie(
            df["primary_domain"].value_counts().head(8),
            values=df["primary_domain"].value_counts().head(8).values,
            names=df["primary_domain"].value_counts().head(8).index,
            title="Investor Domain Preferences"
        )
        figs.append(fig1)

    # Investment stage preference
    if "investment_stage_pref" in df.columns:
        fig2 = px.bar(
            df["investment_stage_pref"].value_counts().reset_index(),
            x="index",
            y="investment_stage_pref",
            title="Investor Stage Preference",
            labels={"index": "Stage", "investment_stage_pref": "Count"}
        )
        figs.append(fig2)

    return figs


def render_figs(figs):
    html = ""
    for fig in figs:
        html += pio.to_html(fig, full_html=False, include_plotlyjs="cdn")
    return html
