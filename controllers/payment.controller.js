import Payments from "../models/Payment.model.js";
import { sendEmail } from "../utils/sendEmail.js";

export const initiatePayment = async (req, res) => {
  try {
    const { email, packageName, travelDate, amount, travelers, redirect_url } = req.body;
    const tx_ref = Date.now().toString();

    const payment = await Payments.create({
      email,
      packageName,
      travelDate,
      amount,
      travelers,
      tx_ref,
    });

    res.json({ status: "success", tx_ref, redirect_url });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const simulateWebhook = async (req, res) => {
  try {
    const { tx_ref } = req.body;

    const payment = await Payments.findOne({ tx_ref });
    if (!payment) return res.status(404).json({ status: "error", message: "Payments not confirmed" });

    payment.confirmed = true;
    await payment.save();

    await sendEmail({
      to: 'webmastersmma@gmail.com',
      subject: "✅ Payment Confirmed",
      html: `
        <h2>🎉 Your payment was successful!</h2>
        <p><strong>Package:</strong> ${payment.packageName}</p>
        <p><strong>Date:</strong> ${payment.travelDate}</p>
        <p><strong>Amount:</strong> ₦${payment.amount}</p>
        <p><strong>Travelers:</strong> ${payment.travelers}</p>
      `,
    });

    res.json({ status: "success", message: "Payment confirmed and email sent." });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
