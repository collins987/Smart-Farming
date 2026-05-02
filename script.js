const webhookUrl = "https://nairobiaicommunity.app.n8n.cloud/webhook/farmer-intake";

const form = document.getElementById("intakeForm");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("formMessage");

const showMessage = (text, type) => {
  message.textContent = text;
  message.className = `form-message ${type}`;
};

const validateForm = (data) => {
  const errors = [];

  if (!data.name) errors.push("Name is required");
  if (!data.phoneNumber) errors.push("Phone Number is required");
  if (!data.emailAddress) errors.push("Email Address is required");
  if (!data.preferredChannel) errors.push("Preferred Communication Channel is required");
  if (!data.cropType) errors.push("Crop Type is required");
  if (!data.location) errors.push("Location is required");

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.emailAddress || "");
  if (!emailOk) errors.push("Enter a valid email address");

  const phoneOk = /^\+?[0-9]{7,15}$/.test((data.phoneNumber || "").replace(/\s+/g, ""));
  if (!phoneOk) errors.push("Enter a valid phone number");

  return errors;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    name: formData.get("name")?.trim(),
    phoneNumber: formData.get("phoneNumber")?.trim(),
    emailAddress: formData.get("emailAddress")?.trim(),
    preferredChannel: formData.get("preferredChannel"),
    cropType: formData.get("cropType")?.trim(),
    telegramChatId: formData.get("telegramChatId")?.trim(),
    location: formData.get("location")?.trim()
  };

  const errors = validateForm(payload);
  if (errors.length) {
    showMessage(errors[0], "error");
    return;
  }

  submitBtn.disabled = true;
  showMessage("Submitting...", "");

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok) {
      showMessage("Submission received. Thank you!", "success");
      form.reset();
    } else {
      const serverError = Array.isArray(result.errors) ? result.errors[0] : "";
      showMessage(serverError || result.message || "Failed to submit. Please try again.", "error");
    }
  } catch (error) {
    showMessage("Network error. Please retry in a moment.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});
