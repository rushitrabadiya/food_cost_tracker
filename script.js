// Initialize person select dropdown
function initializePersonSelect() {
  const personSelect = document.getElementById("personSelect");
  if (!personSelect) return; // Exit if element not found

  // Clear existing options
  personSelect.innerHTML = '<option value="">Select Person</option>';

  // Make sure APP_CONFIG is available
  if (!window.APP_CONFIG || !APP_CONFIG.MEMBERS) {
    console.error("APP_CONFIG or MEMBERS not found");
    return;
  }

  // Add all members to the dropdown
  APP_CONFIG.MEMBERS.forEach((member) => {
    const option = document.createElement("option");
    option.value = member.name;
    option.textContent = member.name;
    personSelect.appendChild(option);
  });
}

// Initialize member checkboxes
function initializeMemberCheckboxes() {
  const memberCheckboxes = document.getElementById("memberCheckboxes");
  const selectAllCheckbox = document.getElementById("selectAll");

  // Clear existing checkboxes
  memberCheckboxes.innerHTML = "";

  // Add member checkboxes
  APP_CONFIG.MEMBERS.forEach((member) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = member.name;
    checkbox.checked = false; // Make unchecked by default

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(member.name));
    memberCheckboxes.appendChild(label);
  });

  // Handle select all functionality
  selectAllCheckbox.addEventListener("change", function () {
    const checkboxes = memberCheckboxes.querySelectorAll(
      "input[type='checkbox']"
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = this.checked;
    });
  });

  // Update select all state when individual checkboxes change
  memberCheckboxes.addEventListener("change", function (e) {
    if (e.target.type === "checkbox") {
      const checkboxes = memberCheckboxes.querySelectorAll(
        "input[type='checkbox']"
      );
      const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
      selectAllCheckbox.checked = allChecked;
    }
  });
}

// Initialize everything when the document loads
document.addEventListener("DOMContentLoaded", () => {
  // Make sure APP_CONFIG is available
  if (!window.APP_CONFIG) {
    console.error("APP_CONFIG not found. Make sure config.js is loaded first.");
    return;
  }

  // Set default date to today if on expense page
  const dateInput = document.getElementById("expenseDate");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }

  // Initialize components based on current page
  if (document.getElementById("expenseCategory")) {
    // We're on the expense page
    initializeCategories();
    initializeSplitMethods();
    initializeImageUpload();
    initializeMemberCheckboxes();
  }

  // Always initialize these components
  initializePersonSelect();
  initializeBalances();
  renderBalances();
});

const balances = JSON.parse(localStorage.getItem("balances")) || {};
const historyData = JSON.parse(localStorage.getItem("historyData")) || [];

// Initialize balances for all members if needed
if (window.APP_CONFIG && APP_CONFIG.MEMBERS) {
  APP_CONFIG.MEMBERS.forEach((member) => {
    if (typeof balances[member.name] === "undefined") {
      balances[member.name] = 0;
    }
  });
  localStorage.setItem("balances", JSON.stringify(balances));
}

function validateInput(amount, message) {
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Please enter a valid amount greater than 0");
  }
  if (!message || message.trim() === "") {
    throw new Error("Please enter a description for the expense");
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  const icon = document.createElement("span");
  icon.className = "notification-icon";

  switch (type) {
    case "success":
      icon.textContent = "✅";
      break;
    case "error":
      icon.textContent = "❌";
      break;
    case "warning":
      icon.textContent = "⚠️";
      break;
    default:
      icon.textContent = "ℹ️";
  }

  const text = document.createElement("span");
  text.textContent = message;

  notification.appendChild(icon);
  notification.appendChild(text);

  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Remove notification after delay
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function showConfirmation(message, callback) {
  const overlay = document.createElement("div");
  overlay.className = "confirmation-overlay";

  const dialog = document.createElement("div");
  dialog.className = "confirmation-dialog";

  const messageP = document.createElement("p");
  messageP.innerHTML = message;
  dialog.appendChild(messageP);

  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "confirmation-buttons";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.onclick = () => overlay.remove();

  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Confirm";
  confirmButton.onclick = () => {
    overlay.remove();
    if (typeof callback === "function") {
      callback();
    }
  };

  buttonsDiv.appendChild(cancelButton);
  buttonsDiv.appendChild(confirmButton);
  dialog.appendChild(buttonsDiv);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

function showWarningConfirmation(message, onConfirm, onCancel) {
  const overlay = document.createElement("div");
  overlay.className = "confirmation-overlay";

  const dialog = document.createElement("div");
  dialog.className = "confirmation-dialog warning-dialog";

  const warningIcon = document.createElement("div");
  warningIcon.className = "warning-icon";
  warningIcon.innerHTML = "⚠️";
  dialog.appendChild(warningIcon);

  const messageP = document.createElement("p");
  messageP.innerHTML = message;
  dialog.appendChild(messageP);

  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "confirmation-buttons";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.onclick = () => {
    overlay.remove();
    if (typeof onCancel === "function") {
      onCancel();
    }
  };

  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Proceed Anyway";
  confirmButton.className = "warning-confirm";
  confirmButton.onclick = () => {
    overlay.remove();
    if (typeof onConfirm === "function") {
      onConfirm();
    }
  };

  buttonsDiv.appendChild(cancelButton);
  buttonsDiv.appendChild(confirmButton);
  dialog.appendChild(buttonsDiv);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getCurrentDateTime() {
  return new Date().toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function addExpense() {
  const date = document.getElementById("expenseDate").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const category = document.getElementById("expenseCategory").value;
  const subcategory = document.getElementById("expenseSubcategory").value;
  const description = document.getElementById("expenseMsg").value;
  const splitMethod = document.getElementById("splitMethod").value;
  const note = document.getElementById("expenseNote").value;

  // Validate inputs
  if (!date || !amount || !category || !description) {
    showNotification("Please fill in all required fields", "error");
    return;
  }

  // Get selected members
  const selectedMembers = [];
  document
    .querySelectorAll('#memberCheckboxes input[type="checkbox"]:checked')
    .forEach((checkbox) => {
      selectedMembers.push(checkbox.value);
    });

  if (selectedMembers.length === 0) {
    showNotification("Please select at least one member", "error");
    return;
  }

  // Calculate splits based on method
  const splits = calculateSplits(amount, selectedMembers, splitMethod);

  // Update balances
  updateBalances(splits);

  // Save to history
  const historyData = JSON.parse(localStorage.getItem("historyData")) || [];
  const expenseData = {
    date,
    amount,
    category,
    subcategory,
    description,
    splitMethod,
    note,
    selectedMembers,
    splits,
    timestamp: new Date().toISOString(),
  };

  historyData.unshift(expenseData); // Add to beginning of array
  localStorage.setItem("historyData", JSON.stringify(historyData));

  // Reset form
  resetForm();

  // Show success notification and redirect to history page
  showNotification("Expense added successfully!", "success");
  setTimeout(() => {
    window.location.href = "history.html";
  }, 1000); // Redirect after 1 second so the notification is visible
}

function recordPayment() {
  try {
    const name = document.getElementById("personSelect").value;
    const amount = parseFloat(document.getElementById("paymentAmount").value);

    validateInput(amount, "Payment");

    if (!name) {
      throw new Error("Please select a person");
    }

    const currentBalance = balances[name];

    // Check if payment amount is greater than current balance
    if (amount > currentBalance) {
      showWarningConfirmation(
        `Warning: The payment amount (₹${amount.toFixed(
          2
        )}) is greater than the current balance (₹${currentBalance.toFixed(
          2
        )}) for ${name}.<br><br>Do you still want to proceed?`,
        () => {
          // If user confirms, proceed with normal confirmation
          showConfirmation(
            `Are you sure you want to record a payment of ₹${amount} for ${name}?`,
            () => {
              balances[name] -= amount;
              saveAndRender();
              document.getElementById("paymentAmount").value = "";
              showNotification("Payment recorded successfully!", "success");
            }
          );
        }
      );
    } else {
      // If amount is normal, show regular confirmation
      showConfirmation(
        `Are you sure you want to record a payment of ₹${amount} for ${name}?`,
        () => {
          balances[name] -= amount;
          saveAndRender();
          document.getElementById("paymentAmount").value = "";
          showNotification("Payment recorded successfully!", "success");
        }
      );
    }
  } catch (error) {
    showNotification(error.message, "error");
  }
}

function saveAndRender() {
  localStorage.setItem("balances", JSON.stringify(balances));
  localStorage.setItem("historyData", JSON.stringify(historyData));
  renderBalances();
}

function renderBalances() {
  const container = document.getElementById("balanceContainer");
  container.innerHTML = "";
  for (const name in balances) {
    const div = document.createElement("div");
    div.className = "person";
    const balance = balances[name];
    // Invert the logic: show positive for paid (<=0) and negative for due (>0)
    const displayBalance = balance <= 0 ? Math.abs(balance) : -balance;
    const status = balance <= 0 ? "paid" : "due";
    const sign = displayBalance >= 0 ? "+" : ""; // Add plus sign for positive balances
    div.innerHTML = `
      <span>${name}</span>
      <span class="${status}">${sign}₹${displayBalance.toFixed(2)}</span>
    `;
    container.appendChild(div);
  }
}

// Initialize categories
function initializeCategories() {
  const categorySelect = document.getElementById("expenseCategory");
  const subcategorySelect = document.getElementById("expenseSubcategory");

  // Clear existing options
  categorySelect.innerHTML = '<option value="">Select Category</option>';
  subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';

  // Add categories
  Object.entries(APP_CONFIG.EXPENSE_CATEGORIES).forEach(([key, category]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${category.icon} ${category.name}`;
    categorySelect.appendChild(option);
  });

  // Handle category change
  categorySelect.addEventListener("change", function () {
    const selectedCategory = APP_CONFIG.EXPENSE_CATEGORIES[this.value];
    subcategorySelect.innerHTML =
      '<option value="">Select Subcategory</option>';

    if (selectedCategory) {
      selectedCategory.subcategories.forEach((sub) => {
        const option = document.createElement("option");
        option.value = sub;
        option.textContent = sub;
        subcategorySelect.appendChild(option);
      });
    }
  });
}

// Initialize split methods
function initializeSplitMethods() {
  const splitMethod = document.getElementById("splitMethod");
  const splitOptionsContainer = document.getElementById(
    "splitOptionsContainer"
  );

  // Clear existing options and set only Equal and Shares options
  splitMethod.innerHTML = `
    <option value="equal">⚖️ Split Equally</option>
    <option value="shares">📋 Split by Shares</option>
  `;

  // Set default to equal
  splitMethod.value = "equal";

  // Handle split method change
  splitMethod.addEventListener("change", function () {
    const method = this.value.toLowerCase();
    const selectedMembers = Array.from(
      memberCheckboxes.querySelectorAll("input:checked")
    ).map((cb) => cb.value);

    if (selectedMembers.length === 0) {
      showNotification("Please select members first", "error");
      this.value = "equal";
      return;
    }

    if (method === "equal") {
      // Hide the split options container for equal split
      splitOptionsContainer.style.display = "none";
    } else {
      // Show and update split options for shares
      updateSplitOptions(method, selectedMembers);
    }
  });
}

// Update split options based on selected method
function updateSplitOptions(method, selectedMembers) {
  const container = document.getElementById("splitOptionsContainer");
  const amount =
    parseFloat(document.getElementById("expenseAmount").value) || 0;

  if (method === "equal") {
    container.style.display = "none";
    return;
  }

  // Show the container for shares method
  container.style.display = "block";

  let html = `
    <div class="split-options">
      <h4>
        <span class="split-method-icon">📋</span>
        Split by Shares
      </h4>
      <div class="split-columns">
        <div class="split-column">
  `;

  // Calculate the midpoint to split the members into two columns
  const midpoint = Math.ceil(selectedMembers.length / 2);
  const firstColumnMembers = selectedMembers.slice(0, midpoint);
  const secondColumnMembers = selectedMembers.slice(midpoint);

  // First column
  firstColumnMembers.forEach((member) => {
    html += `
      <div class="split-option">
        <label>${member}</label>
        <input type="number" class="shares-input" value="1" 
               data-member="${member}" min="0" step="1">
        <span class="shares-text">shares</span>
      </div>
    `;
  });

  html += `
        </div>
        <div class="split-column">
  `;

  // Second column
  secondColumnMembers.forEach((member) => {
    html += `
      <div class="split-option">
        <label>${member}</label>
        <input type="number" class="shares-input" value="1" 
               data-member="${member}" min="0" step="1">
        <span class="shares-text">shares</span>
      </div>
    `;
  });

  html += `
        </div>
      </div>
      <div id="sharesTotal">Total Shares: ${selectedMembers.length}</div>
    </div>
  `;

  container.innerHTML = html;

  // Add event listeners for shares
  const inputs = container.querySelectorAll(".shares-input");
  inputs.forEach((input) => {
    input.addEventListener("input", updateSharesTotal);
  });
}

// Calculate shares based on split method
function calculateSplits(amount, members, splitMethod) {
  const splits = {};

  switch (splitMethod) {
    case "equal":
      const equalShare = amount / members.length;
      members.forEach((member) => (splits[member] = equalShare));
      break;

    case "shares":
      const shareInputs = document.querySelectorAll(".shares-input");
      let totalShares = 0;
      const memberShares = {};

      shareInputs.forEach((input) => {
        const share = parseInt(input.value) || 0;
        memberShares[input.dataset.member] = share;
        totalShares += share;
      });

      Object.entries(memberShares).forEach(([member, share]) => {
        splits[member] = (amount * share) / totalShares;
      });
      break;
  }

  return splits;
}

// Reset form after adding expense
function resetForm() {
  document.getElementById("expenseAmount").value = "";
  document.getElementById("expenseMsg").value = "";
  document.getElementById("expenseCategory").value = "";
  document.getElementById("expenseSubcategory").innerHTML =
    '<option value="">Select Subcategory</option>';
  document.getElementById("splitMethod").value = "equal";
  document.getElementById("expenseNote").value = "";
  document.getElementById("receiptImage").value = "";
  document.getElementById("splitOptionsContainer").style.display = "none";

  const preview = document.querySelector(".receipt-preview");
  if (preview) preview.remove();
}

function updateBalances(splits) {
  const balances = JSON.parse(localStorage.getItem("balances")) || {};

  // Update balances based on splits
  Object.entries(splits).forEach(([member, amount]) => {
    balances[member] = (balances[member] || 0) + amount;
  });

  // Save updated balances
  localStorage.setItem("balances", JSON.stringify(balances));

  // Update the UI
  updateBalanceDisplay();
}

function updateBalanceDisplay() {
  const balanceContainer = document.getElementById("balanceContainer");

  // Only proceed if the balance container exists
  if (!balanceContainer) return;

  const balances = JSON.parse(localStorage.getItem("balances")) || {};

  let balanceHTML = "";
  Object.entries(balances).forEach(([member, amount]) => {
    // A negative balance means they owe money (should be red)
    // A positive balance means they are owed money (should be green)
    const isPositive = amount > 0;
    balanceHTML += `
      <div class="person">
        <span class="name">${member}</span>
        <span class="${isPositive ? "paid" : "due"}">${formatCurrency(
      amount
    )}</span>
      </div>
    `;
  });

  balanceContainer.innerHTML = balanceHTML;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Initialize balances for all members
function initializeBalances() {
  const balances = JSON.parse(localStorage.getItem("balances")) || {};
  let hasChanges = false;

  // Ensure all members have a balance entry
  if (window.APP_CONFIG && APP_CONFIG.MEMBERS) {
    APP_CONFIG.MEMBERS.forEach((member) => {
      if (typeof balances[member.name] === "undefined") {
        balances[member.name] = 0;
        hasChanges = true;
      }
    });

    // Save if any changes were made
    if (hasChanges) {
      localStorage.setItem("balances", JSON.stringify(balances));
    }
  }

  return balances;
}

// Handle receipt image upload
function initializeImageUpload() {
  const input = document.getElementById("receiptImage");
  input.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.createElement("img");
        preview.src = e.target.result;
        preview.className = "receipt-preview";
        preview.style.display = "block";

        const container = document.querySelector(".image-upload");
        const existingPreview = container.querySelector(".receipt-preview");
        if (existingPreview) {
          container.removeChild(existingPreview);
        }
        container.appendChild(preview);
      };
      reader.readAsDataURL(file);
    }
  });
}

// Update totals for different split methods
function updateSharesTotal() {
  const inputs = document.querySelectorAll(".shares-input");
  let total = 0;
  inputs.forEach((input) => {
    total += parseInt(input.value) || 0;
  });
  document.getElementById("sharesTotal").textContent = `Total Shares: ${total}`;
}
