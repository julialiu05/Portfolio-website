import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from sklearn.linear_model import LinearRegression
from scipy import stats
from shared_styles import (
    inject_css, INK, ACCENT, STEEL, ICON, MUTED, MINT, ROSE, SAND,
    BRAND_DIVERGING, LAYOUT_DEFAULTS,
)

st.set_page_config(page_title="Humanity's Tech Tree — Usability Results", layout="wide")
inject_css()

# --- Load data ---
@st.cache_data
def load_data():
    return pd.read_csv("cleaned_responses.csv")

df = load_data()

# --- Header ---
st.html(
    '<div class="hero-title"><span class="flicker">Humanity\'s</span> Tech Tree</div>'
    '<div class="hero-subtitle">Usability Testing Results</div>'
)
st.markdown(f"**{len(df)} participants** · Collected July 2025")

# --- KPI row ---
col1, col2, col3 = st.columns(3)
col1.metric("Avg Experience Rating", f"{df['experience_rating'].mean():.1f} / 10")
col2.metric("Would Recommend (Yes)", f"{(df['would_recommend'] == 'Yes').sum()} / {len(df)}")
col3.metric("Understood Homepage", f"{(df['understood_homepage'] == 'Yes').sum()} / {len(df)}")

st.divider()

# --- Experience Rating Distribution ---
left, right = st.columns(2)

with left:
    st.subheader("Experience Rating Distribution")
    fig_rating = px.histogram(
        df, x="experience_rating", nbins=10, range_x=[0.5, 10.5],
        color_discrete_sequence=[STEEL],
    )
    fig_rating.update_layout(**LAYOUT_DEFAULTS, xaxis_title="Rating (1-10)", yaxis_title="Count", bargap=0.1, xaxis=dict(dtick=1))
    st.plotly_chart(fig_rating, use_container_width=True)

with right:
    st.subheader("Age Group Breakdown")
    age_counts = df["age_group"].value_counts().reset_index()
    age_counts.columns = ["Age Group", "Count"]
    fig_age = px.pie(age_counts, names="Age Group", values="Count", color_discrete_sequence=[STEEL, MINT, ROSE, ACCENT])
    fig_age.update_layout(**LAYOUT_DEFAULTS)
    st.plotly_chart(fig_age, use_container_width=True)

st.divider()

# --- Yes/No Usability Questions ---
st.subheader("Usability Question Responses")

yn_cols = {
    "understood_homepage": "Understood Homepage",
    "explore_without_instructions": "Explored Without Instructions",
    "difficulty_node_types": "Difficulty Distinguishing Nodes",
    "wanted_back_reset": "Wanted Back/Reset",
    "visual_cues_helpful": "Visual Cues Helpful",
}

yn_data = []
for col, label in yn_cols.items():
    counts = df[col].value_counts()
    for answer, count in counts.items():
        yn_data.append({"Question": label, "Answer": answer, "Count": count})

yn_df = pd.DataFrame(yn_data)
fig_yn = px.bar(yn_df, x="Question", y="Count", color="Answer", barmode="group",
                color_discrete_map={"Yes": STEEL, "No": ROSE, "Unclear": MUTED})
fig_yn.update_layout(**LAYOUT_DEFAULTS, xaxis_tickangle=-30, yaxis_dtick=1)
st.plotly_chart(fig_yn, use_container_width=True)

st.divider()

# --- Recommendation ---
left2, right2 = st.columns(2)

with left2:
    st.subheader("Would Recommend to a Friend?")
    rec_counts = df["would_recommend"].value_counts().reset_index()
    rec_counts.columns = ["Response", "Count"]
    fig_rec = px.pie(rec_counts, names="Response", values="Count", color="Response",
                     color_discrete_map={"Yes": STEEL, "No": ROSE, "Maybe": MINT, "Unclear": MUTED})
    fig_rec.update_layout(**LAYOUT_DEFAULTS)
    st.plotly_chart(fig_rec, use_container_width=True)

with right2:
    st.subheader("Rating by Recommendation")
    fig_box = px.box(df, x="would_recommend", y="experience_rating", color="would_recommend",
                     color_discrete_map={"Yes": STEEL, "No": ROSE, "Maybe": MINT, "Unclear": MUTED})
    fig_box.update_layout(**LAYOUT_DEFAULTS, xaxis_title="Would Recommend", yaxis_title="Experience Rating", showlegend=False)
    st.plotly_chart(fig_box, use_container_width=True)

st.divider()

# --- Qualitative Feedback ---
st.subheader("Qualitative Feedback")
feedback_df = df[["name", "describe_experience", "additional_feedback"]].copy()
feedback_df.columns = ["Participant", "How They Described the Experience", "Additional Feedback"]
feedback_df = feedback_df[(feedback_df["How They Described the Experience"] != "") | (feedback_df["Additional Feedback"] != "")]
st.dataframe(feedback_df, use_container_width=True, hide_index=True)

st.divider()

# =====================================================================
# REGRESSION & DEEPER ANALYSIS
# =====================================================================
st.markdown('<h2><span class="flicker-slow">Regression</span> & Statistical Analysis</h2>', unsafe_allow_html=True)
st.caption("Note: n = 7 — treat these as exploratory findings, not statistically conclusive.")

encode_map = {"Yes": 1, "No": 0, "Maybe": 0.5, "Unclear": np.nan}
analysis_df = df.copy()
binary_cols = ["understood_homepage", "explore_without_instructions", "difficulty_node_types", "wanted_back_reset", "visual_cues_helpful"]
for col in binary_cols:
    analysis_df[col + "_num"] = analysis_df[col].map(encode_map)
analysis_df["would_recommend_num"] = analysis_df["would_recommend"].map(encode_map)

feature_labels = {
    "understood_homepage_num": "Understood Homepage",
    "explore_without_instructions_num": "Explored Without Instructions",
    "difficulty_node_types_num": "Difficulty Distinguishing Nodes",
    "wanted_back_reset_num": "Wanted Back/Reset",
    "visual_cues_helpful_num": "Visual Cues Helpful",
}
feature_cols = list(feature_labels.keys())

# Correlation Heatmap
left_corr, right_corr = st.columns(2)

with left_corr:
    st.subheader("Correlation Heatmap")
    corr_cols = feature_cols + ["experience_rating", "would_recommend_num"]
    corr_labels = list(feature_labels.values()) + ["Experience Rating", "Would Recommend"]
    corr_matrix = analysis_df[corr_cols].corr()
    fig_corr = go.Figure(data=go.Heatmap(
        z=corr_matrix.values, x=corr_labels, y=corr_labels,
        colorscale=BRAND_DIVERGING, zmin=-1, zmax=1,
        text=np.round(corr_matrix.values, 2), texttemplate="%{text}", textfont={"size": 11, "color": INK},
    ))
    fig_corr.update_layout(**LAYOUT_DEFAULTS, height=450, xaxis_tickangle=-35)
    st.plotly_chart(fig_corr, use_container_width=True)

with right_corr:
    st.subheader("What Predicts Experience Rating?")
    st.markdown("*Linear regression: usability factors -> experience rating*")
    reg_df = analysis_df[feature_cols + ["experience_rating"]].dropna()
    if len(reg_df) >= 3:
        X = reg_df[feature_cols].values
        y = reg_df["experience_rating"].values
        model = LinearRegression().fit(X, y)
        coef_df = pd.DataFrame({"Feature": list(feature_labels.values()), "Coefficient": model.coef_}).sort_values("Coefficient", key=abs, ascending=True)
        fig_coef = px.bar(coef_df, x="Coefficient", y="Feature", orientation="h", color="Coefficient",
                          color_continuous_scale=BRAND_DIVERGING, color_continuous_midpoint=0)
        fig_coef.update_layout(**LAYOUT_DEFAULTS, height=350, showlegend=False, coloraxis_showscale=False)
        st.plotly_chart(fig_coef, use_container_width=True)
        st.markdown(f"**R² = {model.score(X, y):.2f}** · Intercept = {model.intercept_:.1f}")

st.divider()

# Pairwise correlations
left_pair, right_pair = st.columns(2)

with left_pair:
    st.subheader("Feature vs. Experience Rating")
    st.markdown("*Pearson correlation of each usability factor with experience rating*")
    corr_rows = []
    for col, label in feature_labels.items():
        pair = analysis_df[[col, "experience_rating"]].dropna()
        if len(pair) >= 3 and pair[col].nunique() > 1:
            r, p = stats.pearsonr(pair[col], pair["experience_rating"])
            corr_rows.append({"Feature": label, "r": r, "p-value": p})
        elif len(pair) >= 3:
            corr_rows.append({"Feature": label + " (constant)", "r": 0.0, "p-value": 1.0})
    if corr_rows:
        corr_detail = pd.DataFrame(corr_rows).sort_values("r", key=abs, ascending=False)
        fig_pearson = px.bar(corr_detail, x="r", y="Feature", orientation="h", color="r",
                             color_continuous_scale=BRAND_DIVERGING, color_continuous_midpoint=0, hover_data={"p-value": ":.3f"})
        fig_pearson.update_layout(**LAYOUT_DEFAULTS, height=350, xaxis_title="Pearson r", coloraxis_showscale=False)
        st.plotly_chart(fig_pearson, use_container_width=True)
        corr_detail_display = corr_detail.copy()
        corr_detail_display["r"] = corr_detail_display["r"].round(3)
        corr_detail_display["p-value"] = corr_detail_display["p-value"].round(3)
        st.dataframe(corr_detail_display, use_container_width=True, hide_index=True)

with right_pair:
    st.subheader("Experience Rating -> Recommendation")
    st.markdown("*Do higher ratings predict willingness to recommend?*")
    scatter_df = analysis_df[["experience_rating", "would_recommend_num", "name", "would_recommend"]].dropna()
    if len(scatter_df) >= 3:
        fig_scatter = px.scatter(scatter_df, x="experience_rating", y="would_recommend_num", text="name",
                                 color="would_recommend", color_discrete_map={"Yes": STEEL, "No": ROSE, "Maybe": MINT}, size_max=12)
        slope, intercept_val, r_val, p_val, _ = stats.linregress(scatter_df["experience_rating"], scatter_df["would_recommend_num"])
        x_line = np.linspace(scatter_df["experience_rating"].min(), scatter_df["experience_rating"].max(), 50)
        y_line = slope * x_line + intercept_val
        fig_scatter.add_trace(go.Scatter(x=x_line, y=y_line, mode="lines", line=dict(dash="dash", color=MUTED), name=f"r={r_val:.2f}, p={p_val:.3f}"))
        fig_scatter.update_traces(textposition="top center", selector=dict(mode="markers+text"))
        fig_scatter.update_layout(**LAYOUT_DEFAULTS, xaxis_title="Experience Rating", yaxis_title="Would Recommend (1=Yes, 0.5=Maybe, 0=No)", height=400)
        st.plotly_chart(fig_scatter, use_container_width=True)
        st.markdown(f"**Pearson r = {r_val:.2f}**, p = {p_val:.3f}")

st.divider()

# =====================================================================
# SATISFIED vs. UNSATISFIED
# =====================================================================
st.markdown('<h2>Who <span class="flicker-slow">Struggled</span> vs. Who Thrived?</h2>', unsafe_allow_html=True)

satisfied = df[df["experience_rating"] >= 7].copy()
unsatisfied = df[df["experience_rating"] < 7].copy()

compare_left, compare_right = st.columns(2)
with compare_left:
    st.subheader(f"Satisfied (rated 7-10) · n={len(satisfied)}")
    sat_stats = {
        "Explored Without Instructions": f"{(satisfied['explore_without_instructions'] == 'Yes').sum()}/{len(satisfied)}",
        "Visual Cues Helpful": f"{(satisfied['visual_cues_helpful'] == 'Yes').sum()}/{len(satisfied)}",
        "Difficulty with Node Types": f"{(satisfied['difficulty_node_types'] == 'Yes').sum()}/{len(satisfied)}",
        "Would Recommend (Yes)": f"{(satisfied['would_recommend'] == 'Yes').sum()}/{len(satisfied)}",
        "Avg Rating": f"{satisfied['experience_rating'].mean():.1f}",
    }
    st.dataframe(pd.DataFrame({"Metric": sat_stats.keys(), "Value": sat_stats.values()}), use_container_width=True, hide_index=True)

with compare_right:
    st.subheader(f"Unsatisfied (rated 1-3) · n={len(unsatisfied)}")
    unsat_stats = {
        "Explored Without Instructions": f"{(unsatisfied['explore_without_instructions'] == 'Yes').sum()}/{len(unsatisfied)}",
        "Visual Cues Helpful": f"{(unsatisfied['visual_cues_helpful'] == 'Yes').sum()}/{len(unsatisfied)}",
        "Difficulty with Node Types": f"{(unsatisfied['difficulty_node_types'] == 'Yes').sum()}/{len(unsatisfied)}",
        "Would Recommend (Yes)": f"{(unsatisfied['would_recommend'] == 'Yes').sum()}/{len(unsatisfied)}",
        "Avg Rating": f"{unsatisfied['experience_rating'].mean():.1f}",
    }
    st.dataframe(pd.DataFrame({"Metric": unsat_stats.keys(), "Value": unsat_stats.values()}), use_container_width=True, hide_index=True)

compare_data = []
for label_col, nice_name in [("explore_without_instructions", "Explored Without Instructions"), ("visual_cues_helpful", "Visual Cues Helpful"), ("difficulty_node_types", "Difficulty with Nodes")]:
    sat_yes = (satisfied[label_col] == "Yes").mean() * 100
    unsat_yes = (unsatisfied[label_col] == "Yes").mean() * 100
    compare_data.append({"Factor": nice_name, "Group": "Satisfied (7-10)", "% Yes": sat_yes})
    compare_data.append({"Factor": nice_name, "Group": "Unsatisfied (1-3)", "% Yes": unsat_yes})

fig_compare = px.bar(pd.DataFrame(compare_data), x="Factor", y="% Yes", color="Group", barmode="group",
                     color_discrete_map={"Satisfied (7-10)": STEEL, "Unsatisfied (1-3)": ROSE}, text="% Yes")
fig_compare.update_traces(texttemplate="%{text:.0f}%", textposition="outside")
fig_compare.update_layout(**LAYOUT_DEFAULTS, yaxis_range=[0, 110], yaxis_title="% Who Answered Yes")
st.plotly_chart(fig_compare, use_container_width=True)

st.divider()

# =====================================================================
# PARTICIPANT PROFILES
# =====================================================================
st.markdown('<h2>Individual <span class="flicker-slow">Participant</span> Profiles</h2>', unsafe_allow_html=True)

profile_df = df[["name", "age_group", "background", "experience_rating",
                 "explore_without_instructions", "difficulty_node_types",
                 "visual_cues_helpful", "would_recommend",
                 "describe_experience", "additional_feedback"]].copy()
profile_df = profile_df.sort_values("experience_rating", ascending=False)
profile_df.columns = ["Name", "Age", "Background", "Rating", "Explored w/o Help", "Node Difficulty",
                       "Visual Cues Helped", "Would Recommend", "Experience Description", "Additional Feedback"]

for _, row in profile_df.iterrows():
    rating = row["Rating"]
    emoji = "🟢" if rating >= 7 else ("🟡" if rating >= 4 else "🔴")
    label = f"{emoji}  {row['Name']}  —  Rating: {rating}/10  ·  {row['Would Recommend']}"
    with st.expander(label):
        col_a, col_b = st.columns(2)
        with col_a:
            st.markdown(f"**Age Group:** {row['Age']}")
            st.markdown(f"**Background:** {row['Background'] if row['Background'] else 'Not provided'}")
            st.markdown(f"**Explored without instructions:** {row['Explored w/o Help']}")
            st.markdown(f"**Node type difficulty:** {row['Node Difficulty']}")
        with col_b:
            st.markdown(f"**Visual cues helpful:** {row['Visual Cues Helped']}")
            st.markdown(f"**Would recommend:** {row['Would Recommend']}")
            if row["Experience Description"]:
                st.markdown(f"**In their words:** *\"{row['Experience Description']}\"*")
            if row["Additional Feedback"]:
                st.markdown(f"**Extra feedback:** *\"{row['Additional Feedback']}\"*")

st.divider()

# =====================================================================
# ACTIONABLE RECOMMENDATIONS
# =====================================================================
st.markdown('<h2><span class="flicker-slow">Actionable</span> Recommendations</h2>', unsafe_allow_html=True)

avg_rating = df["experience_rating"].mean()
explore_yes_pct = (df["explore_without_instructions"] == "Yes").mean() * 100
visual_yes_pct = (df["visual_cues_helpful"] == "Yes").mean() * 100

st.markdown('<p class="priority-label"><span class="big-emoji">🔴</span> Priority 1: Onboarding & Discoverability</p>', unsafe_allow_html=True)
st.error(
    f"**Problem:** Only {explore_yes_pct:.0f}% of users could figure out how to explore/expand nodes without instructions. "
    f"This is the **#1 predictor of satisfaction** (r = 0.94, p = 0.005). "
    f"Every user who couldn't explore on their own rated the experience ≤ 3."
)
st.markdown("""
**What to do:**
- Add a short onboarding tooltip or animation on first visit showing users how to click/expand nodes
- Consider a "Start here" pulsing indicator on an entry-point node
- Add a persistent help icon (?) with a quick guide
- John noted: *"When I clicked on a node, the only thing that was changing was the content in the floating window"* — make node expansion visually obvious (animate children appearing, zoom into cluster)
""")

st.markdown('<p class="priority-label"><span class="big-emoji">🟠</span> Priority 2: Node Layout & Scalability</p>', unsafe_allow_html=True)
st.warning(
    "**Problem:** The most technically experienced user (John, biostatistician) raised concerns about "
    "overlapping unrelated nodes and future scalability. He rated the experience 3/10 and was the only "
    "participant who would **not** recommend the product."
)
st.markdown("""
**What to do:**
- Separate unrelated nodes spatially — John flagged *"Steam engine overlapping with vaccination"*
- Implement hierarchical or force-directed layout that groups related concepts
- Add zoom levels: high-level eras -> drill into specific domains
- Reference: John suggested looking at the **Civilization game tech tree** for layout inspiration
""")

st.markdown('<p class="priority-label"><span class="big-emoji">🟡</span> Priority 3: Info Panel Positioning</p>', unsafe_allow_html=True)
st.info(
    "**Problem:** The floating info panel sits at a fixed position (top of screen). "
    "Wendy suggested it should follow the selected node."
)
st.markdown("""
**What to do:**
- Move the info panel near the selected node (tooltip-style) or make it a sidebar that scrolls with the graph
- Wendy: *"Probably it is helpful to have the inf. box moving along with the selected item"*
""")

st.markdown('<p class="priority-label"><span class="big-emoji">🟢</span> Priority 4: Node Type Differentiation</p>', unsafe_allow_html=True)
st.markdown(
    f"**Mostly fine today** — only 1 of 7 users had difficulty distinguishing node types. "
    f"However, John specifically noted: *\"I didn't see any companies in the nodes.\"* "
    f"As you add more node types, consider using distinct shapes (not just colors) to differentiate categories."
)

st.divider()

st.markdown('<p class="priority-label"><span class="big-emoji">✅</span> What\'s Working Well</p>', unsafe_allow_html=True)
st.success("**Homepage clarity is perfect:** 100% of participants immediately understood what the site was about. Don't change the landing page messaging.")
st.success(f"**Visual cues resonate:** {visual_yes_pct:.0f}% found the colors, shapes, and sizes helpful for understanding relationships. The visual language is working for most users.")
st.success(f"**Strong concept appeal:** Even the lowest raters acknowledged the idea's potential. John (3/10): *\"Great idea, has a lot of potential, needs a lot of work.\"* The core concept connects — the gap is execution, not vision.")

st.divider()

with st.expander("Summary Statistics"):
    median_rating = df["experience_rating"].median()
    std_rating = df["experience_rating"].std()
    recommend_yes_pct = (df["would_recommend"] == "Yes").mean() * 100
    homepage_clear_pct = (df["understood_homepage"] == "Yes").mean() * 100
    findings = f"""
| Metric | Value |
|---|---|
| **Participants** | {len(df)} |
| **Experience Rating** | Mean {avg_rating:.1f}, Median {median_rating:.0f}, Std Dev {std_rating:.1f} |
| **Homepage Clarity** | {homepage_clear_pct:.0f}% understood immediately |
| **Discoverability** | {explore_yes_pct:.0f}% could explore nodes without instructions |
| **Visual Cues** | {visual_yes_pct:.0f}% found colors/shapes helpful |
| **Recommendation** | {recommend_yes_pct:.0f}% would recommend (Yes), {((df['would_recommend'] == 'Maybe').mean() * 100):.0f}% Maybe |
"""
    st.markdown(findings)

with st.expander("View Raw Cleaned Data"):
    st.dataframe(df, use_container_width=True, hide_index=True)
