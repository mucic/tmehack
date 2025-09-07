/*************************/
/** Get User Information*/
/*************************/

$.getJSON(getWebAppBackendUrl('/get_user_info'), function(data) {
     // Printout data to user info page
    let userData = data.data;
    $("#bedge-user_profile").text(userData.userProfile);
    $("#username").text(userData.authIdentifier);
    $("#user_profiles").text(userData.groups);
});


$.getJSON(getWebAppBackendUrl('/get_contract_ids'), function(data) {
     // Printout data to user info page
    let userData = data.data;
 // Clear any existing options
    $("#cfrm-select-contract_id").empty();

    // Populate with Contract IDs
    $.each(userData, function(index, value) {
        $("#cfrm-select-contract_id").append(
            $("<option>", {
                value: value,
                text: value
            })
        );
    });

    console.log("Contract IDs loaded:", userData);

});

/******************************/
/** On Contract ID Selection **/
/******************************/

$("#cfrm-select-contract_id").on("change", function() {
      let selectedId = $(this).val();

      $.ajax({
          url: getWebAppBackendUrl('/get_contract_details'),
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ contract_id: selectedId }),
          success: function(response) {
              let res = typeof response === "string" ? JSON.parse(response) : response;
              if (res.status === "ok") {
                    // console.log(res.data);
                    setContractFormData(res.data);
                    $("#contractForm").show();
              } else {
                  $("#contractForm").hide();
                  $("#contractForm").reset();
                  console.error("Error:", res.message);
                  utilities.showErrorNotification("Error fetching contract details: " + res.message, "bottom", "right");
              }
          },
          error: function(xhr, status, error) {
              $("#contractForm").hide();
              $("#contractForm").reset();
                utilities.showErrorNotification("Request failed: " + error, "bottom", "right");
              console.error("Request failed:", error);
          }
      });
  });

// Set intreface to hidden initially
$("#contractForm").hide();

/******************************/
/** Set Contract Information **/
/******************************/

function setContractFormData(data) {
    $.each(data, function(key, value) {
        // normalize key: lower case, replace spaces with underscores
        const normalizedKey = key.toLowerCase().replace(/\s+/g, "_");
        const fieldId = "#cfrm-" + normalizedKey;

        if ($(fieldId).length) {
            $(fieldId).val(value);
        }
        else {
            console.log("No matching field in contactForm for key:", key);
        }
    });
}
