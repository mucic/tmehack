type = ['primary', 'info', 'success', 'warning', 'danger'];

utilities = {
  showRandomNotification: function (msg, from, align) {
    color = Math.floor(Math.random() * 4 + 1);

    $.notify(
      {
        icon: 'tim-icons icon-bell-55',
        message: msg || 'Welcome to <b>FleetIQ</b> - Hackathon2025.',
      },
      {
        type: type[color],
        timer: 8000,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  },
  showCampaignNotification: function (msg, from = 'top', align = 'right') {
    $.notify(
      {
        icon: 'tim-icons icon-volume-98',
        message: msg,
      },
      {
        type: type[2],
        timer: 5000,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  },
  showBotNotification: function (msg, from = 'top', align = 'right') {
    $.notify(
      {
        icon: 'tim-icons icon-spaceship',
        message: msg,
      },
      {
        type: type[1],
        timer: 5000,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  },
  showErrorNotification: function (msg, from = 'bottom', align = 'right') {
    $.notify(
      {
        icon: 'tim-icons icon-bell-55',
        message: msg,
      },
      {
        type: type[4],
        timer: 500,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  },
  showSuccessNotification: function (msg, from = 'bottom', align = 'right') {
    $.notify(
      {
        icon: 'tim-icons icon-bell-55',
        message: msg,
      },
      {
        type: type[2],
        timer: 500,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  },
};
