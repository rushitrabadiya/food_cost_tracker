const mongoose = require("mongoose");
const { sendReport, generateReportHTML } = require("../services/emailService");
const User = require("../models/User");
const Expense = require("../models/Expense");
require("dotenv").config();

async function sendScheduledReports() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get current date
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0-6
    const dayOfMonth = now.getDate(); // 1-31

    // Find users who should receive reports today
    const users = await User.find({
      $or: [
        {
          "preferences.reportFrequency": "weekly",
          "preferences.reportDay": dayOfWeek,
        },
        {
          "preferences.reportFrequency": "monthly",
          "preferences.reportDay": dayOfMonth,
        },
      ],
    });

    for (const user of users) {
      try {
        const period = user.preferences.reportFrequency;
        const endDate = new Date();
        const startDate = new Date();

        if (period === "weekly") {
          startDate.setDate(endDate.getDate() - 7);
        } else {
          startDate.setMonth(endDate.getMonth() - 1);
        }

        // Get expenses for the period
        const expenses = await Expense.find({
          userId: user._id,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        });

        if (expenses.length > 0) {
          const reportHTML = generateReportHTML(expenses, period);
          const subject = `${
            period.charAt(0).toUpperCase() + period.slice(1)
          } Expense Report`;

          await sendReport(user.email, subject, reportHTML);
          console.log(`Report sent to ${user.email}`);
        }
      } catch (error) {
        console.error(`Error sending report to ${user.email}:`, error);
      }
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error in sendScheduledReports:", error);
    process.exit(1);
  }
}

// Run the script
sendScheduledReports();
