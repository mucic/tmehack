import dataiku
import pandas as pd
from flask import request, make_response, jsonify
import requests
import json
import re
import logging


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
    mydataset = dataiku.Dataset("Contracts_prepared")
    df = mydataset.get_dataframe()
    
    # Select first 20 Contract IDs
    contract_ids = df["Contract_ID"].head(20).tolist()

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
    ds = dataiku.Dataset("Contracts_prepared")

    # Load full dataset (safer than specifying columns until schema is verified)
    df = ds.get_dataframe()
    df.rename(columns=lambda col: col.strip(), inplace=True)

    # Ensure consistent types for comparison
    df["Contract ID"] = df["Contract_ID"].astype(str)
    matched = df[df["Contract_ID"] == contract_id]

    if matched.empty:
        return jsonify(status="error", message="Contract ID not found"), 404

    # Convert the first row into JSON-safe Python types
    row = matched.iloc[0].to_dict()
    details = {
        k: (v.item() if hasattr(v, "item") else v)
        for k, v in row.items()
        if k != "Contract_ID"   # exclude ID from details payload
    }

    return jsonify(status="ok", data=details)


# ========================================================= #
#   Get LLM Predictions
# ========================================================= #

# Set the LLM to use
LLM_ID = "agent:BlTNLS18" # Check Nemanjas Jupiter nottebok to be sure.
llm = dataiku.api_client().get_default_project().get_llm(LLM_ID)


@app.route('/query', methods=['POST'])
def query():
    content_type = request.headers.get('Content-Type')
    if content_type == 'application/json':
        json = request.json
        user_message = json.get('message', None)
        print(user_message)
        if user_message:
            completion = llm.new_completion()
            completion.with_message(user_message)
            resp = completion.execute()

            if resp.success:
                msg = resp.text
            else:
                msg = "Something went wrong"
        else:
            msg = "No message was found"

        # response = make_response(msg)
        # response.headers['Content-type'] = 'application/json'
        # return response
        return jsonify(status="ok", data=msg)
    else:
        return 'Content-Type is not supported!'
    
    
    
    
@app.route('/predict_internal', methods=['POST'])
def predict_internal():
    content_type = request.headers.get('Content-Type')
    if content_type == 'application/json':
        body = request.json
        contract_data = body.get('contract_data', None)
        user_message = json.dumps(contract_data, indent=2)
        
        # STEP 1: Get the data from LLM
        
        completion = llm.new_completion()
        completion.with_message(user_message)
        resp = completion.execute()
        raw_message = resp.text
        
        print(raw_message)
        
        # STEP 2: Extract JSON inside ```json ... ``` block
        match = re.search(r"```json\s*(\{.*?\})\s*```", raw_message, re.DOTALL)
        if match:
            inner_json_str = match.group(1)
            print(inner_json_str)
        else:
            inner_json_str = raw_message
            print("No JSON block found in GPT response.")
            
        # STEP 3: Parse the inner JSON
        try:
            parsed_data = json.loads(inner_json_str)
        except json.JSONDecodeError:
            logging.error("Failed to decode JSON from GPT output.")
            parsed_data = {}

        # STEP 4: Build the clean result
        result = {
            "contract_id": parsed_data.get("contract_id"),
            "upgrade_readiness_score": parsed_data.get("upgrade_readiness_score"),
            "justification": parsed_data.get("justification"),
            "user_explanation": parsed_data.get("user_explanation"),
            "recommended_model": parsed_data.get("recommended_model"),
            "estimated_business_value": parsed_data.get("estimated_business_value"),
            "business_value_calculation": parsed_data.get("business_value_calculation")
        }
            
        print(result)
        
        return json.dumps(result, indent=2)
    else:
        return 'Content-Type is not supported!'