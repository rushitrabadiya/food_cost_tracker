// Get history data from localStorage
const historyData = JSON.parse(localStorage.getItem("historyData")) || [];

// Function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Function to toggle expense details
function toggleExpenseDetails(index) {
  const detailsElement = document.getElementById(`expense-details-${index}`);
  const arrowIcon = document.getElementById(`arrow-icon-${index}`);

  if (
    detailsElement.style.display === "none" ||
    !detailsElement.style.display
  ) {
    detailsElement.style.display = "block";
    arrowIcon.textContent = "▼";
  } else {
    detailsElement.style.display = "none";
    arrowIcon.textContent = "▶";
  }
}

// Function to display history
function displayHistory() {
  const historyContainer = document.getElementById("historyContainer");

  if (!historyData || historyData.length === 0) {
    historyContainer.innerHTML =
      '<p class="no-history">No expense history available.</p>';
    return;
  }

  console.log("History Data:", historyData); // Debug log

  let historyHTML = '<div class="history-list">';

  historyData.forEach((item, index) => {
    const date = item.date || item.expenseDate;
    const amount = parseFloat(item.amount);
    const category = item.category || "";
    const subcategory = item.subcategory || "";
    const description = item.description || item.expenseMsg || "No description";
    const splitMethod = item.splitMethod || "Not specified";
    const note = item.note || "No note";

    // Create splits HTML
    let splitsHTML = "";
    if (item.splits) {
      splitsHTML = Object.entries(item.splits)
        .map(
          ([member, amount]) => `
          <div class="split-item">
            <span class="member-name">${member}</span>
            <span class="member-amount">${formatCurrency(amount)}</span>
          </div>
        `
        )
        .join("");
    }

    historyHTML += `
      <div class="history-item">
        <div class="history-header" onclick="toggleExpenseDetails(${index})">
          <div class="history-date">${formatDate(date)}</div>
          <div class="history-summary">
            <div class="history-description">
              <strong>${description}</strong>
              <span class="history-category">${category} ${
      subcategory ? `› ${subcategory}` : ""
    }</span>
            </div>
            <div class="history-amount">
              ${formatCurrency(amount)}
              <span class="arrow-icon" id="arrow-icon-${index}">▶</span>
            </div>
          </div>
        </div>
        <div class="expense-details" id="expense-details-${index}" style="display: none;">
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Split Method:</span>
              <span class="detail-value">${splitMethod}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Note:</span>
              <span class="detail-value">${note}</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">Selected Members:</span>
              <span class="detail-value">${
                item.selectedMembers ? item.selectedMembers.join(", ") : "None"
              }</span>
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">Split Details:</span>
              <div class="splits-container">
                ${splitsHTML}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  historyHTML += "</div>";
  historyContainer.innerHTML = historyHTML;

  // Debug log
  console.log("History HTML generated:", historyHTML);
}

// Function to export to PDF
function exportToPDF() {
  // Implementation for PDF export
  alert("PDF export functionality will be implemented soon");
}

// Function to export to Excel
function exportToExcel() {
  // Get history data
  const historyData = JSON.parse(localStorage.getItem("historyData")) || [];

  if (historyData.length === 0) {
    showNotification("No data to export", "warning");
    return;
  }

  // Prepare data for Excel
  const excelData = historyData.map((expense) => {
    // Get category name from config
    const category = APP_CONFIG.EXPENSE_CATEGORIES[expense.category];
    const categoryName = category ? category.name : expense.category;

    // Format splits for better readability
    const splitsFormatted = Object.entries(expense.splits)
      .map(([name, amount]) => `${name}: ${formatCurrency(amount)}`)
      .join(", ");

    return {
      Date: formatDate(expense.date),
      Time: new Date(expense.timestamp).toLocaleTimeString("en-IN"),
      Description: expense.description,
      Category: categoryName,
      Subcategory: expense.subcategory,
      Amount: expense.amount,
      "Split Method": expense.splitMethod,
      Members: expense.selectedMembers.join(", "),
      Splits: splitsFormatted,
      Note: expense.note || "",
    };
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // Date
    { wch: 12 }, // Time
    { wch: 30 }, // Description
    { wch: 15 }, // Category
    { wch: 15 }, // Subcategory
    { wch: 12 }, // Amount
    { wch: 15 }, // Split Method
    { wch: 30 }, // Members
    { wch: 40 }, // Splits
    { wch: 30 }, // Note
  ];
  ws["!cols"] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expense History");

  // Generate Excel file
  const fileName = `expense_history_${formatDateForFile(new Date())}.xlsx`;
  XLSX.writeFile(wb, fileName);

  showNotification("Excel file exported successfully!", "success");
}

// Helper function to format date for file name
function formatDateForFile(date) {
  return date.toISOString().split("T")[0].replace(/-/g, "");
}

// Notification function
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

// Add styles for history items
const style = document.createElement("style");
style.textContent = `
    .history-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px 0;
    }

    .history-item {
        background: var(--card-dark);
        border-radius: var(--border-radius);
        transition: var(--transition);
        border-left: 4px solid var(--primary-color);
        overflow: hidden;
    }

    .history-header {
        padding: 20px;
        cursor: pointer;
        user-select: none;
    }

    .history-header:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .history-summary {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    .history-date {
        color: var(--primary-light);
        font-size: 14px;
        margin-bottom: 8px;
    }

    .history-description {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .history-description strong {
        font-size: 18px;
        color: var(--text-dark);
    }

    .history-category {
        color: #888;
        font-size: 14px;
    }

    .history-amount {
        font-size: 20px;
        font-weight: 600;
        color: var(--primary-light);
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .arrow-icon {
        font-size: 12px;
        color: #888;
    }

    .expense-details {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px;
        background: rgba(0, 0, 0, 0.2);
    }

    .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .detail-item.full-width {
        grid-column: 1 / -1;
    }

    .detail-label {
        font-size: 14px;
        color: #888;
    }

    .detail-value {
        color: var(--text-dark);
    }

    .splits-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 8px;
        margin-top: 8px;
    }

    .split-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }

    .member-name {
        color: var(--text-dark);
    }

    .member-amount {
        color: var(--primary-light);
        font-weight: 500;
    }

    .no-history {
        text-align: center;
        color: #888;
        margin-top: 40px;
    }

    @media (max-width: 768px) {
        .details-grid {
            grid-template-columns: 1fr;
        }

        .history-summary {
            flex-direction: column;
            gap: 8px;
        }

        .history-amount {
            align-self: flex-start;
        }
    }
`;

document.head.appendChild(style);

// Initialize the display
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, displaying history..."); // Debug log
  displayHistory();
});
