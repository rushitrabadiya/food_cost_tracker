const express = require("express");
const router = express.Router();
const { sendReport, generateReportHTML } = require("../services/emailService");
const Expense = require("../models/Expense");
const User = require("../models/User");

// Middleware to verify JWT token
const auth = require("../middleware/auth");

// Send report manually
router.post("/send", auth, async (req, res) => {
  try {
    const { period } = req.body; // 'weekly' or 'monthly'
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    if (period === "weekly") {
      startDate.setDate(endDate.getDate() - 7);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    // Get expenses for the period
    const expenses = await Expense.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const reportHTML = generateReportHTML(expenses, period);
    const subject = `${
      period.charAt(0).toUpperCase() + period.slice(1)
    } Expense Report`;

    await sendReport(user.email, subject, reportHTML);

    res.json({ message: "Report sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending report", error: error.message });
  }
});

// Update report preferences
router.put("/preferences", auth, async (req, res) => {
  try {
    const { frequency, day } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.preferences.reportFrequency = frequency;
    user.preferences.reportDay = day;

    await user.save();

    res.json({ message: "Preferences updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating preferences", error: error.message });
  }
});

module.exports = router;
