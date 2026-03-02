"""Shared brand palette, CSS, and layout defaults for all pages."""
import streamlit as st

# --- Brand palette (from portfolio CSS vars) ---
INK = "#1E293B"
ACCENT = "#3B82F6"
STEEL = "#4A6D91"
ICON = "#36597D"
MUTED = "#475569"
MINT = "#c7e4da"
ROSE = "#e8d5c8"
SAND = "#F3F6FA"
MINT_DARK = "#bdddd2"
DEEP_BLUE = "#2C4A66"

BRAND_SEQ = [ACCENT, STEEL, MINT, ROSE, ICON, MUTED, DEEP_BLUE]

BRAND_DIVERGING = [
    [0.0, ROSE],
    [0.25, "#f0e4db"],
    [0.5, "#F3F6FA"],
    [0.75, "#a3c4e0"],
    [1.0, ACCENT],
]

LAYOUT_DEFAULTS = dict(
    font_family="Manrope, Helvetica Neue, sans-serif",
    font_color=INK,
    plot_bgcolor="rgba(0,0,0,0)",
    paper_bgcolor="rgba(0,0,0,0)",
)


def inject_css():
    """Inject the shared CSS into the current Streamlit page."""
    st.html("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Manrope:wght@400;500;600;700&display=swap');

/* Global font bump */
html, body, [class*="css"] {
    font-family: 'Manrope', 'Helvetica Neue', sans-serif;
    font-size: 1.05rem;
}

/* Title area */
.hero-title {
    font-family: 'Instrument Serif', 'Times New Roman', serif;
    font-size: 3.2rem;
    font-weight: 600;
    color: #1E293B;
    margin-bottom: 0.2rem;
    line-height: 1.2;
}
.hero-subtitle {
    font-size: 1.2rem;
    color: #475569;
    margin-top: 0;
}

/* Flicker animation — main title */
@keyframes flicker {
    0%, 100% { opacity: 1; }
    4% { opacity: 0.9; }
    6% { opacity: 0.4; }
    8% { opacity: 0.8; }
    10% { opacity: 1; }
    42% { opacity: 1; }
    44% { opacity: 0.6; }
    46% { opacity: 0.9; }
    48% { opacity: 1; }
    82% { opacity: 1; }
    83% { opacity: 0.3; }
    84% { opacity: 0.8; }
    85% { opacity: 0.1; }
    86% { opacity: 0.9; }
    87% { opacity: 1; }
}
.flicker {
    animation: flicker 4s infinite;
    display: inline-block;
    color: #3B82F6;
}

/* Slower flicker for section accents */
@keyframes flicker-slow {
    0%, 100% { opacity: 1; }
    15% { opacity: 1; }
    16% { opacity: 0.6; }
    17% { opacity: 1; }
    55% { opacity: 1; }
    56% { opacity: 0.4; }
    57% { opacity: 0.85; }
    58% { opacity: 0.3; }
    59% { opacity: 1; }
}
.flicker-slow {
    animation: flicker-slow 6s infinite;
    display: inline;
}

/* Glow pulse for emojis */
@keyframes glow-pulse {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
}

/* Bigger section headers */
h2 {
    font-family: 'Instrument Serif', 'Times New Roman', serif !important;
    font-size: 2.4rem !important;
}
h3 {
    font-family: 'Instrument Serif', 'Times New Roman', serif !important;
    font-size: 1.8rem !important;
}

/* Big emojis */
.big-emoji {
    font-size: 3.5rem;
    line-height: 1;
    vertical-align: middle;
    margin-right: 0.4rem;
    animation: glow-pulse 3s ease-in-out infinite;
}

/* Priority labels */
.priority-label {
    font-family: 'Instrument Serif', 'Times New Roman', serif;
    font-size: 1.8rem;
    font-weight: 600;
    color: #1E293B;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

/* Global emoji rendering */
[data-testid="stMarkdownContainer"] p,
[data-testid="stExpander"] summary span {
    font-variant-emoji: emoji;
}

/* Expander emojis */
[data-testid="stExpander"] summary {
    font-size: 1.3rem !important;
}

/* Metric cards */
[data-testid="stMetric"] {
    font-size: 1.1rem;
}
[data-testid="stMetricValue"] {
    font-size: 2rem !important;
    font-family: 'Instrument Serif', serif !important;
}

/* Expander labels */
[data-testid="stExpander"] summary span {
    font-size: 1.15rem !important;
}

/* ---- Landing page specific ---- */

.landing-hero {
    text-align: center;
    padding: 4rem 2rem 2rem;
}
.landing-hero .hero-title {
    font-size: 4.2rem;
    margin-bottom: 0.6rem;
}
.landing-tagline {
    font-family: 'Manrope', sans-serif;
    font-size: 1.35rem;
    color: #475569;
    max-width: 600px;
    margin: 0 auto 2.5rem;
    line-height: 1.6;
}

/* CTA button */
.cta-btn {
    display: inline-block;
    background: linear-gradient(145deg, #4A6D91, #2C4A66);
    color: #FDFDFE !important;
    padding: 18px 48px;
    border-radius: 999px;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: 1.25rem;
    text-decoration: none;
    box-shadow: 10px 10px 28px rgba(54, 89, 125, 0.3),
                -6px -6px 14px #FFFFFF,
                inset 0 2px 0 rgba(255,255,255,0.15);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    letter-spacing: 0.02em;
}
.cta-btn:hover {
    transform: translateY(-3px);
    box-shadow: 14px 14px 40px rgba(54, 89, 125, 0.45),
                -8px -8px 16px #FFFFFF,
                inset 0 2px 0 rgba(255,255,255,0.15);
}

/* Stat cards on landing */
.stat-card {
    text-align: center;
    padding: 1.5rem;
}
.stat-number {
    font-family: 'Instrument Serif', serif;
    font-size: 3rem;
    font-weight: 600;
    color: #3B82F6;
    line-height: 1.1;
}
.stat-label {
    font-size: 1rem;
    color: #475569;
    margin-top: 0.3rem;
}

/* Divider with spacing */
.landing-divider {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 3rem auto;
    max-width: 200px;
}
</style>
""")
