const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReport = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Report email sent successfully");
  } catch (error) {
    console.error("Error sending report email:", error);
    throw error;
  }
};

const generateReportHTML = (expenses, period) => {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return `
    <h2>${period} Expense Report</h2>
    <p>Total Expenses: ₹${total.toFixed(2)}</p>
    <h3>Expense Breakdown:</h3>
    <ul>
      ${expenses
        .map(
          (expense) => `
        <li>
          ${expense.description}: ₹${expense.amount.toFixed(2)}
          <br>
          <small>Date: ${new Date(expense.date).toLocaleDateString()}</small>
        </li>
      `
        )
        .join("")}
    </ul>
  `;
};

module.exports = {
  sendReport,
  generateReportHTML,
};
