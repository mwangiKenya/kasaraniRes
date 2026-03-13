import { useState } from "react";

function SendBillingSMS() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendSMS = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        //"http://localhost:8000/api/send-billing-sms/",
        "https://kasarani-1.onrender.com/api/send-billing-sms/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            send_to_all: true,
          }),
        }
      );

      const data = await response.json();

      setMessage(
        `SMS process completed. Sent: ${data.sent_count}, Failed: ${data.failed_count}`
      );

      // Optional: log detailed info to console
      console.log("Sent messages:", data.sent);
      console.log("Failed messages:", data.failed);
    } catch (error) {
      setMessage("Error sending SMS. Check server.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div>
      <button onClick={sendSMS} disabled={loading} className="smsButton">
        {loading ? "Sending SMS..." : "Send Billing SMS"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default SendBillingSMS;
