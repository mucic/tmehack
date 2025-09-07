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
# Get Product IDs
# ========================================================= #

@app.route('/get_product_ids')
def get_product_ids():
    # Load dataset
    mydataset = dataiku.Dataset("retail_store_inventory")
    df = mydataset.get_dataframe()
    
    # Select first 20 Product IDs
    # Adjust column name if it's 'ProductID', 'product_id', etc.
    product_ids = df["Product ID"].head(20).tolist()

    return json.dumps({"status": "ok", "data": product_ids})


# ========================================================= #
#   Get product details by Product ID
# ========================================================= #

@app.route('/get_product_details', methods=["POST"])
def get_product_details():
    req_data = request.get_json()
    if not req_data or "product_id" not in req_data:
        return jsonify(status="error", message="Missing product_id"), 400

    product_id = str(req_data["product_id"])

    # Specify only the columns we need for better performance
    ds = dataiku.Dataset("retail_store_inventory")
    try:
        # Use fast path when available, falling back automatically
        df = ds.get_fast_path_dataframe(
            auto_fallback=True,
            columns=["Product ID", "Category", "Region", "Inventory Level", "Price"]
        )
    except Exception:
        # Fallback to regular get_dataframe if fast path fails
        df = ds.get_dataframe(
            columns=["Product ID", "Category", "Region", "Inventory Level", "Price"]
        )

    # Normalize column names: strip whitespace, just in case
    df.rename(columns=lambda col: col.strip(), inplace=True)

    # Filter — compare as strings to avoid type mismatch headaches
    df["Product ID"] = df["Product ID"].astype(str)
    matched = df[df["Product ID"] == product_id]

    if matched.empty:
        return jsonify(status="error", message="Product ID not found"), 404

    row = matched.iloc[0]
    details = {
        "Category": row["Category"],
        "Region": row["Region"],
        "InventoryLevel": int(row["Inventory Level"]), # Ensure it is an int!
        "Price": row["Price"]
    }

    return jsonify(status="ok", data=details)

