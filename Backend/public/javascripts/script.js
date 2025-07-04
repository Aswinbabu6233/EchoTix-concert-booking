// Mobile Menu Toggle
function toggleMobileMenu() {
  const nav = document.querySelector(".nav-menu");
  if (nav) {
    nav.classList.toggle("show");
  }
}

// Profile Dropdown Toggle
function toggleProfile() {
  const dropdown = document.querySelector(".dropdown.submenu");
  if (dropdown) {
    dropdown.classList.toggle("show");
  }
}

// Close dropdowns and menus on outside click
document.addEventListener("click", function (e) {
  // Close mobile menu if open and click is outside
  const navMenu = document.querySelector(".nav-menu");
  const hamburger = document.querySelector(".hamburger");
  if (
    navMenu &&
    navMenu.classList.contains("show") &&
    !navMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    navMenu.classList.remove("show");
  }

  // Close profile dropdown if open and click is outside
  const profileDropdown = document.querySelector(".dropdown.submenu");
  if (
    profileDropdown &&
    profileDropdown.classList.contains("show") &&
    !profileDropdown.contains(e.target) &&
    !e.target.classList.contains("profilepic")
  ) {
    profileDropdown.classList.remove("show");
  }

  // Close admin dropdowns if open and click is outside
  const adminDropdowns = document.querySelectorAll(".admin-nav .dropdown");
  adminDropdowns.forEach((dropdown) => {
    if (
      dropdown.classList.contains("show") &&
      !dropdown.contains(e.target) &&
      !e.target.closest(".dropdown-parent")
    ) {
      dropdown.classList.remove("show");
    }
  });
});

// Dropdown toggle for admin/user mobile menu
document.addEventListener("DOMContentLoaded", function () {
  // Mobile dropdown toggle
  document.querySelectorAll(".dropdown-parent > a").forEach((link) => {
    link.addEventListener("click", function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const parent = this.closest(".dropdown-parent");
        parent.classList.toggle("open");

        // Toggle dropdown visibility
        const dropdown = parent.querySelector(".dropdown");
        if (dropdown) {
          dropdown.classList.toggle("show");
        }
      }
    });
  });
});
// Add Artist dynamic button
function addArtist() {
  const container = document.getElementById("artistInputs");
  const newGroup = document.createElement("div");
  newGroup.classList.add("artistGroup");
  newGroup.innerHTML = `
      <input type="text" name="name[]" placeholder="Artist name" required>
      <input type="text" name="role[]" placeholder="Role" required>
      <textarea name="description[]" id="description" rows="5" placeholder="Artist Description.."></textarea>

      <input type="file" name="photos"         accept="image/*"
 required>
      <button type="button" class="remove-btn" onclick="removeArtist(this)">
            ×
          </button>
    `;
  container.appendChild(newGroup);
}
// artist section remove
function removeArtist(button) {
  const group = button.parentElement;
  group.remove();
}

// booking
document.addEventListener("DOMContentLoaded", function () {
  const countSpan = document.getElementById("ticketCount");
  const priceSpan = document.getElementById("totalPrice");
  const quantityInput = document.getElementById("ticketQuantityInput");
  const totalPriceInput = document.getElementById("totalPriceInput");

  const ticketPrice = parseFloat(priceSpan.dataset.price);
  const maxTickets = parseInt(countSpan.dataset.max, 10);

  let ticketCount = 1;

  document.getElementById("increment").addEventListener("click", () => {
    if (ticketCount < maxTickets) {
      ticketCount++;
      updateDisplay();
    }
  });

  document.getElementById("decrement").addEventListener("click", () => {
    if (ticketCount > 1) {
      ticketCount--;
      updateDisplay();
    }
  });

  function updateDisplay() {
    countSpan.textContent = ticketCount;
    priceSpan.textContent = (ticketCount * ticketPrice).toFixed(2);
    quantityInput.value = ticketCount;
    totalPriceInput.value = (ticketCount * ticketPrice).toFixed(2);
  }
});

// toast
window.addEventListener("DOMContentLoaded", () => {
  const toast = document.getElementById("sharedToast");
  if (toast) {
    setTimeout(() => {
      toast.style.display = "none";
    }, 3000); // 3 seconds
  }
});
setTimeout(() => {
  toast.classList.add("hide");
  setTimeout(() => {
    toast.style.display = "none";
  }, 500); // Wait for fade-out
}, 3000);

// Auto-hide flash messages after 3 seconds
setTimeout(() => {
  const flashMessages = document.querySelectorAll(".flash-message");
  flashMessages.forEach((msg) => {
    msg.style.transition = "opacity 0.5s ease-out";
    msg.style.opacity = "0";
    setTimeout(() => msg.remove(), 500);
  });
}, 3000);

// review section
function toggleComment(index) {
  const comment = document.getElementById(`comment-${index}`);
  const button = comment.nextElementSibling;

  if (comment.classList.contains("short-comment")) {
    comment.classList.remove("short-comment");
    button.textContent = "See less";
  } else {
    comment.classList.add("short-comment");
    button.textContent = "See more";
  }
}
