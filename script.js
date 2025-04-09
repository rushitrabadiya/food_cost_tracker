const members = [
  "Rushit",
  "Jeet",
  "Charmi",
  "Darshan",
  "Darshti",
  "Jannki",
  "Axay",
  "Raj",
  "Sujal",
];

// Set default date to today
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("expenseDate").value = today;
});

const balances = JSON.parse(localStorage.getItem("balances")) || {};
const historyData = JSON.parse(localStorage.getItem("historyData")) || [];

members.forEach((name) => {
  if (!balances[name]) balances[name] = 0;
});

const personSelect = document.getElementById("personSelect");
const memberCheckboxes = document.getElementById("memberCheckboxes");

members.forEach((name) => {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  personSelect.appendChild(option);

  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = name;
  checkbox.checked = true;
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(name));
  memberCheckboxes.appendChild(label);
});

function validateInput(amount, message) {
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Please enter a valid amount greater than 0");
  }
  if (!message || message.trim() === "") {
    throw new Error("Please enter a description for the expense");
  }
}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.textContent = message;
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 3000);
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
  try {
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const message = document.getElementById("expenseMsg").value.trim();
    const expenseDate = document.getElementById("expenseDate").value;
    const entryDateTime = getCurrentDateTime();

    if (!expenseDate) {
      throw new Error("Please select a date");
    }

    validateInput(amount, message);

    const selectedMembers = Array.from(
      memberCheckboxes.querySelectorAll("input:checked")
    ).map((cb) => cb.value);

    if (selectedMembers.length === 0) {
      throw new Error("Please select at least one member");
    }

    const share = amount / selectedMembers.length;
    selectedMembers.forEach((name) => (balances[name] += share));

    const formattedExpenseDate = formatDate(expenseDate);

    historyData.push({
      expenseDate: formattedExpenseDate,
      entryDateTime: entryDateTime,
      message: message,
      amount: amount.toFixed(2),
      share: share.toFixed(2),
      members: selectedMembers,
      timestamp: new Date(expenseDate).getTime(), // for sorting
    });

    // Sort history by expense date, most recent first
    historyData.sort((a, b) => b.timestamp - a.timestamp);

    saveAndRender();
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseMsg").value = "";
    showSuccess("Expense added successfully!");
  } catch (error) {
    showError(error.message);
  }
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
              showSuccess("Payment recorded successfully!");
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
          showSuccess("Payment recorded successfully!");
        }
      );
    }
  } catch (error) {
    showError(error.message);
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

renderBalances();
