#!/usr/bin/env python3
"""
Credit Risk Model - Logistic Regression
Predicts probability of loan default using financial features.
"""

import sys
import json
import numpy as np
import warnings
warnings.filterwarnings('ignore')

from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score


def generate_training_data(n=5000, seed=42):
    """Generate synthetic loan data for training."""
    rng = np.random.RandomState(seed)

    credit_score = rng.normal(680, 80, n).clip(300, 850)
    income = rng.lognormal(11, 0.5, n).clip(20000, 500000)
    loan_amount = rng.lognormal(10.3, 0.6, n).clip(1000, 100000)
    loan_term = rng.choice([12, 24, 36, 48, 60, 72], n)
    debt_to_income = rng.beta(2, 5, n)
    employment_years = rng.exponential(5, n).clip(0, 40)
    num_credit_lines = rng.poisson(4, n).clip(0, 20)
    num_late_payments = rng.poisson(0.5, n).clip(0, 10)
    age = rng.normal(38, 10, n).clip(18, 75)
    home_own = rng.choice([0, 1, 2], n)  # rent=0, own=1, mortgage=2
    purpose = rng.choice([0, 1, 2, 3, 4, 5], n)

    # Compute default probability based on features
    log_odds = (
        -3.5
        + (600 - credit_score) * 0.015
        + (debt_to_income - 0.2) * 4.0
        + (loan_amount / income) * 1.5
        - employment_years * 0.06
        + num_late_payments * 0.5
        - (age - 25) * 0.015
        - (num_credit_lines - 2) * 0.05
        + (home_own == 0) * 0.3
        + (purpose == 4) * 0.25  # business loans higher risk
    )
    prob = 1 / (1 + np.exp(-log_odds))
    default = (rng.uniform(0, 1, n) < prob).astype(int)

    X = np.column_stack([
        credit_score,
        income / 1000,       # scale
        loan_amount / 1000,  # scale
        loan_term,
        debt_to_income,
        employment_years,
        num_credit_lines,
        num_late_payments,
        age,
        (home_own == 0).astype(float),   # rent
        (home_own == 2).astype(float),   # mortgage
        (purpose == 1).astype(float),    # home_improvement
        (purpose == 2).astype(float),    # major_purchase
        (purpose == 3).astype(float),    # medical
        (purpose == 4).astype(float),    # business
        (purpose == 5).astype(float),    # other
    ])

    return X, default


FEATURE_NAMES = [
    "credit_score",
    "income_k",
    "loan_amount_k",
    "loan_term",
    "debt_to_income_ratio",
    "employment_years",
    "num_credit_lines",
    "num_late_payments",
    "age",
    "home_rent",
    "home_mortgage",
    "purpose_home_improvement",
    "purpose_major_purchase",
    "purpose_medical",
    "purpose_business",
    "purpose_other",
]

FEATURE_DISPLAY_NAMES = {
    "credit_score": "Credit Score",
    "income_k": "Annual Income",
    "loan_amount_k": "Loan Amount",
    "loan_term": "Loan Term",
    "debt_to_income_ratio": "Debt-to-Income Ratio",
    "employment_years": "Employment Years",
    "num_credit_lines": "Number of Credit Lines",
    "num_late_payments": "Late Payments (2yr)",
    "age": "Applicant Age",
    "home_rent": "Rents Home",
    "home_mortgage": "Has Mortgage",
    "purpose_home_improvement": "Purpose: Home Improvement",
    "purpose_major_purchase": "Purpose: Major Purchase",
    "purpose_medical": "Purpose: Medical",
    "purpose_business": "Purpose: Business",
    "purpose_other": "Purpose: Other",
}

FEATURE_DESCRIPTIONS = {
    "credit_score": "Credit score ranging from 300 to 850; higher scores indicate lower risk",
    "income_k": "Annual income in thousands of USD",
    "loan_amount_k": "Requested loan amount in thousands of USD",
    "loan_term": "Loan repayment term in months",
    "debt_to_income_ratio": "Ratio of existing debt to annual income (0-1)",
    "employment_years": "Number of years at current employer",
    "num_credit_lines": "Total number of open credit accounts",
    "num_late_payments": "Number of late payments in the past 2 years",
    "age": "Age of the applicant in years",
    "home_rent": "Whether the applicant rents their home",
    "home_mortgage": "Whether the applicant has a mortgage",
    "purpose_home_improvement": "Loan purpose is home improvement",
    "purpose_major_purchase": "Loan purpose is a major purchase",
    "purpose_medical": "Loan purpose is medical expenses",
    "purpose_business": "Loan purpose is business",
    "purpose_other": "Loan purpose is other/unspecified",
}


def build_model():
    """Train and return the logistic regression model."""
    X, y = generate_training_data(5000)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = LogisticRegression(max_iter=1000, random_state=42, C=1.0)
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]

    accuracy = float(accuracy_score(y_test, y_pred))
    auc = float(roc_auc_score(y_test, y_prob))

    return model, scaler, accuracy, auc


def prepare_input(data: dict) -> np.ndarray:
    """Convert API input dict to feature vector."""
    home = data.get("home_ownership", "rent")
    purpose = data.get("loan_purpose", "other")

    x = [
        float(data.get("credit_score", 650)),
        float(data.get("income", 50000)) / 1000,
        float(data.get("loan_amount", 10000)) / 1000,
        float(data.get("loan_term", 36)),
        float(data.get("debt_to_income_ratio", 0.3)),
        float(data.get("employment_years", 3)),
        float(data.get("num_credit_lines", 4)),
        float(data.get("num_late_payments", 0)),
        float(data.get("age", 35)),
        1.0 if home == "rent" else 0.0,
        1.0 if home == "mortgage" else 0.0,
        1.0 if purpose == "home_improvement" else 0.0,
        1.0 if purpose == "major_purchase" else 0.0,
        1.0 if purpose == "medical" else 0.0,
        1.0 if purpose == "business" else 0.0,
        1.0 if purpose == "other" else 0.0,
    ]
    return np.array(x).reshape(1, -1)


def compute_feature_contributions(model, scaler, x_raw: np.ndarray):
    """Compute per-feature log-odds contributions."""
    x_scaled = scaler.transform(x_raw)
    coefs = model.coef_[0]
    contributions = []
    for i, (name, coef, val_scaled) in enumerate(zip(FEATURE_NAMES, coefs, x_scaled[0])):
        contrib = float(coef * val_scaled)
        contributions.append({
            "feature": name,
            "displayName": FEATURE_DISPLAY_NAMES[name],
            "value": float(x_raw[0][i]),
            "contribution": round(contrib, 4),
        })
    # Sort by absolute contribution descending
    contributions.sort(key=lambda c: abs(c["contribution"]), reverse=True)
    return contributions


def get_model_info(model, scaler, accuracy, auc):
    """Return model metadata with feature importances."""
    coefs = model.coef_[0]
    scale = scaler.scale_
    # Importance = absolute coef * std dev (un-scaled)
    importances = np.abs(coefs) / (scale + 1e-9)
    importances = importances / importances.sum()  # normalize

    features = []
    for name, imp in zip(FEATURE_NAMES, importances):
        features.append({
            "name": name,
            "displayName": FEATURE_DISPLAY_NAMES[name],
            "importance": round(float(imp), 4),
            "description": FEATURE_DESCRIPTIONS[name],
        })
    features.sort(key=lambda f: f["importance"], reverse=True)

    return {
        "modelType": "Logistic Regression",
        "accuracy": round(accuracy, 4),
        "auc": round(auc, 4),
        "features": features,
        "trainingSamples": 4000,
        "lastTrained": "2026-03-15",
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input provided"}))
        sys.exit(1)

    data = json.loads(sys.argv[1])
    model, scaler, accuracy, auc = build_model()
    model_info = get_model_info(model, scaler, accuracy, auc)

    if data.get("__info_only__"):
        print(json.dumps({"modelInfo": model_info}))
        return

    x_raw = prepare_input(data)
    x_scaled = scaler.transform(x_raw)
    default_prob = float(model.predict_proba(x_scaled)[0][1])
    contributions = compute_feature_contributions(model, scaler, x_raw)

    result = {
        "defaultProbability": round(default_prob, 4),
        "featureContributions": contributions,
        "modelInfo": model_info,
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
