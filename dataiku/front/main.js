/*****************************/
/** Initial Interface setup **/
/*****************************/
$('#contractForm').hide();

/*************************/
/** Get User Information*/
/*************************/

$.getJSON(getWebAppBackendUrl('/get_user_info'), function (data) {
  // Printout data to user info page
  let userData = data.data;
  $('#bedge-user_profile').text(userData.userProfile);
  $('#username').text(userData.authIdentifier);
  $('#user_profiles').text(userData.groups);
});

/*************************/
/** Get Contracts ID's  **/
/*************************/

$.getJSON(getWebAppBackendUrl('/get_contract_ids'), function (data) {
  // Printout data to user info page
  let userData = data.data;
  // Clear any existing options
  $('#cfrm-select-contract_id').empty();

  // Populate with Contract IDs
  $.each(userData, function (index, value) {
    $('#cfrm-select-contract_id').append(
      $('<option>', {
        value: value,
        text: value,
      })
    );
  });

  console.log('Contract IDs loaded:', userData);
});

/******************************/
/** On Contract ID Selection **/
/******************************/

$('#cfrm-select-contract_id').on('change', function () {
  let selectedId = $(this).val();

  $.ajax({
    url: getWebAppBackendUrl('/get_contract_details'),
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ contract_id: selectedId }),
    success: function (response) {
      let res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.status === 'ok') {
        // console.log(res.data);
        setContractFormData(res.data);
        $('#contractForm').show();
      } else {
        $('#contractForm').hide();
        $('#contractForm').reset();
        console.error('Error:', res.message);
        utilities.showErrorNotification(
          'Error fetching contract details: ' + res.message,
          'bottom',
          'right'
        );
      }
    },
    error: function (xhr, status, error) {
      $('#contractForm').hide();
      $('#contractForm').reset();
      utilities.showErrorNotification('Request failed: ' + error, 'bottom', 'right');
      console.error('Request failed:', error);
    },
  });
});

/**************************************************/
/** On Predict Optimal Trade-in Time Button Click**/
/**************************************************/
$('#predictResultsBtn').on('click', function (e) {
  e.preventDefault(); // stop page reload

  // Collect form data
  let formData = {};
  $('#contractForm')
    .serializeArray()
    .forEach(function (item) {
      formData[item.name] = item.value;
    });

  // Build request payload
  let payload = {
    contract_id: $('#cfrm-select-contract_id').val(), // top-level contract_id
    contract_data: formData, // full form data nested
  };

  $.ajax({
    url: getWebAppBackendUrl('/predict_internal'),
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(payload),
    beforeSend: function () {
      console.log('Sending query...', payload);
    },
    success: function (response) {
      let res = typeof response === 'string' ? JSON.parse(response) : response;

      if (res.status === 'ok') {
        console.log('Query success:', res.data);
        utilities.showSuccessNotification('Query successful!', 'bottom', 'right');
      } else {
        console.error('Error:', res.message);
        utilities.showErrorNotification(
          'Error during query: ' + res.message,
          'bottom',
          'right'
        );
      }
    },
    error: function (xhr, status, err) {
      console.error('AJAX error:', err);
      utilities.showErrorNotification(
        'Unexpected error while sending query.',
        'bottom',
        'right'
      );
    },
  });
});

/**********************/
/** Helper functions **/
/**********************/

// Contract form - Write data to form fiields
function setContractFormData(data) {
  $.each(data, function (key, value) {
    // normalize key: lower case, replace spaces with underscores
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
    const fieldId = '#cfrm-' + normalizedKey;

    if ($(fieldId).length) {
      $(fieldId).val(value);
    } else {
      console.log('No matching field in contactForm for key:', key);
    }
  });
}
