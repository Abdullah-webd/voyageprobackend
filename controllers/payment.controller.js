import Payments from "../models/Payment.model.js";
import { sendEmail } from "../utils/sendEmail.js";


export const initiatePayment = async (req, res) => {
  try {
    const {
       fullName,
      email,
      contactNumber,
      travelDate,
      numberOfGuests,
      paymentMethod,
      includeAirportPickup,
      addTravelInsurance,
      packageId,
      packageName,
      costPerPerson,
      totalAmountPaid
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !contactNumber ||
      !travelDate ||
      !numberOfGuests ||
      !paymentMethod ||
      !packageId ||
      !packageName ||
      !costPerPerson ||  !totalAmountPaid
    ) {
      return res.status(400).json({ status: "error", message: "All required fields must be provided." });
    }

    const tx_ref = `TX-${Date.now()}`;
    const totalAmounShouldBePaid = costPerPerson * numberOfGuests;
    if (totalAmountPaid !== totalAmounShouldBePaid) {
      return res.status(400).json({ status: "error", message: "Total amount paid does not match the expected amount." });
    }

    const newPayment = await Payments.create({
      fullName,
      email,
      contactNumber,
      travelDate,
      numberOfGuests,
      paymentMethod,
      includeAirportPickup: includeAirportPickup || false,
      addTravelInsurance: addTravelInsurance || false,
      packageId,
      packageName,
      costPerPerson,
      totalAmountPaid,
      tx_ref
    });

    res.status(201).json({
      status: "success",
      message: "Payment initiated successfully",
      tx_ref,
      data: newPayment
    });

  } catch (err) {
    console.error("Payment initiation failed:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};


export const simulateWebhook = async (req, res) => {
  try {
    const { tx_ref } = req.body;

    const payment = await Payments.findOne({ tx_ref });
    if (!payment) return res.status(404).json({ status: "error", message: "Payments not confirmed" });

    payment.bookingStatus = 'Confirmed';
    await payment.save();

    await sendEmail({
      to: 'webmastersmma@gmail.com',
      subject: "✅ Payment Confirmed",
      html: `
        <h2>🎉 Your payment was successful!</h2>
        <p><strong>Package:</strong> ${payment.packageName}</p>
        <p><strong>Date:</strong> ${payment.travelDate}</p>
        <p><strong>Amount:</strong> ₦${payment.totalAmountPaid}</p>
        <p><strong>Travelers:</strong> ${payment.
numberOfGuests}</p>
      `,
    });

    res.json({ status: "success", message: "Payment confirmed and email sent." });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
