import Payments from "../models/Payment.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import axios from "axios";
const FLW_SECRET_KEY = 'FLWSECK_TEST-769e9db540aef513a9973427f66f4daf-X'; // make sure this is set in your env

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
      totalAmountPaid,
      redirectUrl
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
      !costPerPerson ||  
      !totalAmountPaid ||
      !redirectUrl
    ) {
      return res.status(400).json({ status: "error", message: "All required fields must be provided." });
    }

    // Confirm total amount is correct
    const totalAmountShouldBePaid = costPerPerson * numberOfGuests;
    if (totalAmountPaid !== totalAmountShouldBePaid) {
      return res.status(400).json({ status: "error", message: "Total amount paid does not match the expected amount." });
    }

    const tx_ref = `TX-${Date.now()}`;

    // Save payment record in DB first
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
      tx_ref,
      status: "pending"
    });

    // Prepare data to send to Flutterwave to initiate payment
    const payload = {
      tx_ref, // unique transaction ref
      amount: totalAmountPaid,
      currency: "NGN", // or your currency
      redirect_url: redirectUrl, // update to your callback URL
      customer: {
        email,
        phonenumber: contactNumber,
        name: fullName,
      },
      meta: {
        travelDate,
        numberOfGuests,
        packageId,
        packageName
      },
      customizations: {
        title: "Travel Package Payment",
        description: `Payment for package ${packageName}`
      }
    };

    // Call Flutterwave initiate payment endpoint
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data.status === "success") {
      // Return payment link to frontend
      const paymentLink = response.data.data.link;
      return res.status(201).json({
        status: "success",
        message: "Payment initiated successfully",
        tx_ref,
        paymentLink,
        data: newPayment
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "Failed to initiate payment with Flutterwave"
      });
    }

  } catch (err) {
    console.error("Payment initiation failed:", err.response?.data || err.message || err);
    res.status(500).json({ status: "error", message: "Server error initiating payment" });
  }
};


export const simulateWebhook = async (req, res) => {
  try {
    const { tx_ref } = req.body;

    if (!tx_ref) {
      return res.status(400).json({ status: "error", message: "tx_ref is required" });
    }

    // Find payment record in DB
    const payment = await Payments.findOne({ tx_ref });
    if (!payment) {
      return res.status(404).json({ status: "error", message: "Payment record not found" });
    }

    // Verify payment with Flutterwave using tx_ref
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`;
    const response = await axios.get(verifyUrl, {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`
      }
    });

    const data = response.data;

    if (data.status === "success" && data.data.status === "successful") {
      // Update payment record
      payment.bookingStatus = "Confirmed";
      payment.transactionId = data.data.id; // Flutterwave transaction ID
      payment.paymentStatus = "successful";
      payment.paymentDate = data.data.created_at;
      await payment.save();

      // Send confirmation email
      await sendEmail({
        to: payment.email,
        subject: "✅ Payment Confirmed",
        html: `
          <h2>🎉 Your payment was successful!</h2>
          <p><strong>Package:</strong> ${payment.packageName}</p>
          <p><strong>Date:</strong> ${payment.travelDate}</p>
          <p><strong>Amount:</strong> ₦${payment.totalAmountPaid}</p>
          <p><strong>Travelers:</strong> ${payment.numberOfGuests}</p>
        `
      });

      return res.json({
        status: "success",
        message: "Payment confirmed and email sent."
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "Payment verification failed or is not successful"
      });
    }

  } catch (err) {
    console.error("Error confirming payment:", err.response?.data || err.message || err);
    res.status(500).json({
      status: "error",
      message: "Server error confirming payment"
    });
  }
};
