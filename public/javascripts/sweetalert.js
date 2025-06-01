document.addEventListener("DOMContentLoaded", function () {
  const selects = document.querySelectorAll(".cancel-booking-form select");

  selects.forEach((select) => {
    select.addEventListener("change", function () {
      const bookingId = this.getAttribute("data-booking-id");
      const selectedValue = this.value;

      if (selectedValue === "cancelled_by_admin") {
        Swal.fire({
          title: "Are you sure?",
          text: "This booking will be cancelled. This action cannot be undone.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, cancel it!",
        }).then((result) => {
          if (result.isConfirmed) {
            document.getElementById("cancel-form-" + bookingId).submit();
          } else {
            this.selectedIndex = 0; // Reset the dropdown
          }
        });
      }
    });
  });
});

// user alert

document.addEventListener("DOMContentLoaded", function () {
  const userCancelButtons = document.querySelectorAll(".cancel-btn");

  userCancelButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const bookingId = this.getAttribute("data-booking-id");

      Swal.fire({
        title: "Cancel your ticket?",
        text: "This action cannot be undone. Only 70% of the ticket amount will be refunded. Are You sure? ",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, cancel it!",
      }).then((result) => {
        if (result.isConfirmed) {
          document.getElementById("cancel-form-" + bookingId).submit();
        }
      });
    });
  });
});
