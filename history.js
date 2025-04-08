const historyData = JSON.parse(localStorage.getItem('historyData')) || [];
const container = document.getElementById('historyList');

if (historyData.length === 0) {
  container.innerHTML = '<p>No expense history available.</p>';
} else {
  historyData.reverse().forEach(entry => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <p><strong>📅 Date:</strong> ${entry.date}</p>
      <p><strong>📝 Message:</strong> ${entry.message}</p>
      <p><strong>💸 Amount:</strong> ₹${entry.amount}</p>
      <p><strong>👥 Members:</strong> ${entry.members.join(', ')}</p>
      <p><strong>📊 Share Per Person:</strong> ₹${entry.share}</p>
      <hr/>
    `;
    container.appendChild(div);
  });
}

// Export to PDF
function exportPDF() {
  const element = document.getElementById('historyList');
  const opt = {
    margin: 0.5,
    filename: 'Expense_History.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

// Export to Excel
function exportExcel() {
  const rows = [["Date", "Message", "Amount", "Share Per Person", "Members"]];
  historyData.forEach(entry => {
    rows.push([
      entry.date,
      entry.message,
      `₹${entry.amount}`,
      `₹${entry.share}`,
      entry.members.join(', ')
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expense History");
  XLSX.writeFile(workbook, "Expense_History.xlsx");
}
