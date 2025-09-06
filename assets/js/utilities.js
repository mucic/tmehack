type = ["primary", "info", "success", "warning", "danger"];

utilities = {
  showRandomNotification: function (from, align) {
    color = Math.floor(Math.random() * 4 + 1);

    $.notify(
      {
        icon: "tim-icons icon-bell-55",
        message:
          "Welcome to <b>Black Dashboard</b> - a beautiful freebie for every web developer.",
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
  showErrorNotification: function (from, align, msg) {
    $.notify(
      {
        icon: "tim-icons icon-bell-55",
        message: msg,
      },
      {
        type: type[4],
        timer: 5000,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  },
  showSuccessNotification: function (from, align, msg) {
    $.notify(
      {
        icon: "tim-icons icon-bell-55",
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
};
