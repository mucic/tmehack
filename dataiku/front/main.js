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


$.getJSON(getWebAppBackendUrl('/get_product_ids'), function(data) {
     // Printout data to user info page
    let userData = data.data;
 // Clear any existing options
    $("#cfrm-select-contract_id").empty();

    // Populate with product IDs
    $.each(userData, function(index, value) {
        $("#cfrm-select-contract_id").append(
            $("<option>", {
                value: value,
                text: value
            })
        );
    });

    console.log("Product IDs loaded:", userData);

});


$("#cfrm-select-contract_id").on("change", function() {
      let selectedId = $(this).val();

      $.ajax({
          url: getWebAppBackendUrl('/get_product_details'),
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ product_id: selectedId }),
          success: function(response) {
              let res = typeof response === "string" ? JSON.parse(response) : response;
              if (res.status === "ok") {
                  console.log(res.data);
                  $("#detailCategory").text(res.data.Category);
                  $("#detailRegion").text(res.data.Region);
                  $("#detailInventory").text(res.data["InventoryLevel"]);
                  $("#productDetails").show();
              } else {
                  $("#productDetails").hide();
                  console.error("Error:", res.message);
              }
          },
          error: function(xhr, status, error) {
              $("#productDetails").hide();
              console.error("Request failed:", error);
          }
      });
  });