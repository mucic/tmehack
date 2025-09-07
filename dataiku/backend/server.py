import dataiku
import pandas as pd
from flask import request, jsonify
import requests
import json


# ========================================================= #
# Get User information
# ========================================================= #

@app.route('/get_user_info')
def get_user_info():
    client = dataiku.api_client()
    request_headers = dict(request.headers)
    auth_info_reader = client.get_auth_info_from_browser_headers(request_headers)

    # Pandas dataFrames are not directly JSON serializable, use to_json()
#     data = mydataset_df.to_json()
    return json.dumps({"status": "ok", "data": auth_info_reader})


# ========================================================= #
# Get Projects list
# ========================================================= #

@app.route('/get_projects')
def get_projects():
    my_project_datasets =  dataiku.Dataset.list("HACKATHON2025TEAM02")
    return json.dumps({"status": "ok", "data": my_project_datasets})


# ========================================================= #
# Get Contract IDs
# ========================================================= #

@app.route('/get_contract_ids')
def get_contract_ids():
    # Load dataset
    mydataset = dataiku.Dataset("Contracts")
    df = mydataset.get_dataframe()
    
    # Select first 20 Contract IDs
    contract_ids = df["Contract ID"].head(20).tolist()

    return json.dumps({"status": "ok", "data": contract_ids})


# ========================================================= #
#   Get product details by Contract ID
# ========================================================= #

# Get all from dataset and filter in pandas for simplicity
@app.route('/get_contract_details', methods=["POST"])
def get_contract_details():
    req_data = request.get_json()
    if not req_data or "contract_id" not in req_data:
        return jsonify(status="error", message="Missing contract_id"), 400

    contract_id = str(req_data["contract_id"])
    ds = dataiku.Dataset("Contracts")

    # Load full dataset (safer than specifying columns until schema is verified)
    df = ds.get_dataframe()
    df.rename(columns=lambda col: col.strip(), inplace=True)

    # Ensure consistent types for comparison
    df["Contract ID"] = df["Contract ID"].astype(str)
    matched = df[df["Contract ID"] == contract_id]

    if matched.empty:
        return jsonify(status="error", message="Contract ID not found"), 404

    # Convert the first row into JSON-safe Python types
    row = matched.iloc[0].to_dict()
    details = {
        k: (v.item() if hasattr(v, "item") else v)
        for k, v in row.items()
        if k != "Contract ID"   # exclude ID from details payload
    }

    return jsonify(status="ok", data=details)
