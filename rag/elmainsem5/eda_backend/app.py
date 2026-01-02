from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from eda import load_data, founder_eda_plots, investor_eda_plots, render_figs

app = FastAPI(title="EDA Visualization Backend")

founders_df, investors_df = load_data()


@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <h1>EDA Dashboard</h1>
    <ul>
        <li><a href="/eda/founders">Founder EDA</a></li>
        <li><a href="/eda/investors">Investor EDA</a></li>
    </ul>
    """


@app.get("/eda/founders", response_class=HTMLResponse)
def founders_eda():
    figs = founder_eda_plots(founders_df)
    return "<h2>Founder EDA</h2>" + render_figs(figs)


@app.get("/eda/investors", response_class=HTMLResponse)
def investors_eda():
    figs = investor_eda_plots(investors_df)
    return "<h2>Investor EDA</h2>" + render_figs(figs)
