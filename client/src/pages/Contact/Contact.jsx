import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock3,
  Send,
  MessageSquare,
} from "lucide-react";

import "../../styles/Contact.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Validation rules matching server requirements
  const validationRules = {
    name: { min: 2, label: "Name" },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: "Email" },
    subject: { min: 3, label: "Subject" },
    message: { min: 10, label: "Message" },
  };

  // Check if a field passes validation
  const isFieldValid = (fieldName, value) => {
    const rule = validationRules[fieldName];
    if (!value.trim()) return false;
    if (rule.min && value.trim().length < rule.min) return false;
    if (rule.pattern && !rule.pattern.test(value.trim())) return false;
    return true;
  };

  // Get validation message for a field
  const getValidationMessage = (fieldName) => {
    const value = formData[fieldName];
    const rule = validationRules[fieldName];
    if (!value.trim()) return `${rule.label} is required`;
    if (rule.min && value.trim().length < rule.min) {
      return `${rule.label} must be at least ${rule.min} characters (${value.trim().length}/${rule.min})`;
    }
    if (rule.pattern && !rule.pattern.test(value.trim())) {
      return `Please enter a valid ${rule.label.toLowerCase()}`;
    }
    return null;
  };

  // Check if entire form is valid
  const isFormValid = () => {
    return (
      isFieldValid("name", formData.name) &&
      isFieldValid("email", formData.email) &&
      isFieldValid("subject", formData.subject) &&
      isFieldValid("message", formData.message)
    );
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const getContactEndpoint = () => {
    const base = API_URL.replace(/\/+$/, "");
    if (base.endsWith("/api")) {
      return `${base}/contact`;
    }
    return `${base}/api/contact`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    console.log("Sending formData:", formData);
    console.log("Field lengths:", {
      name: formData.name.length,
      email: formData.email.length,
      subject: formData.subject.length,
      message: formData.message.length,
    });
    console.log("API_URL:", API_URL);
    console.log("Contact endpoint:", getContactEndpoint());

    try {
      const response = await fetch(getContactEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error response:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuccessMessage("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Error:", err);
      setErrorMessage(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="contact-page">
      <div className="contact-glow contact-glow-1"></div>
      <div className="contact-glow contact-glow-2"></div>

      <div className="contact-container">
        {/* HEADER */}
        <div className="contact-header">
          <div className="contact-badge">
            
            Contact us
          </div>

          <h1>We’d love to hear from you</h1>

          <p>
            Need help, support, or partnership information? Reach out to our
            team and we’ll respond as quickly as possible.
          </p>
        </div>

        {/* GRID */}
        <div className="contact-grid">
          {/* LEFT FORM */}
          <div className="contact-card">
            <div className="card-title-row">
              <h2>Send a message</h2>
              <p>Our team usually replies within 24 hours.</p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <div
                  className="validation-hint"
                  style={{
                    color: isFieldValid("name", formData.name) ? "#10b981" : "#ef4444",
                    fontSize: "0.875rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {getValidationMessage("name") || "✓ Valid name"}
                </div>
              </div>

              <div className="contact-form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <div
                  className="validation-hint"
                  style={{
                    color: isFieldValid("email", formData.email) ? "#10b981" : "#ef4444",
                    fontSize: "0.875rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {getValidationMessage("email") || "✓ Valid email"}
                </div>
              </div>

              <div className="contact-form-group">
                <label>Subject</label>

                <input
                  type="text"
                  name="subject"
                  placeholder="Enter subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
                <div
                  className="validation-hint"
                  style={{
                    color: isFieldValid("subject", formData.subject) ? "#10b981" : "#ef4444",
                    fontSize: "0.875rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {getValidationMessage("subject") || "✓ Valid subject"}
                </div>
              </div>

              <div className="contact-form-group">
                <label>Message/Feedback</label>

                <textarea
                  rows="6"
                  name="message"
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
                <div
                  className="validation-hint"
                  style={{
                    color: isFieldValid("message", formData.message) ? "#10b981" : "#ef4444",
                    fontSize: "0.875rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {getValidationMessage("message") || "✓ Valid message"}
                </div>
              </div>

              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}

              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}

              <button
                type="submit"
                className="contact-btn"
                disabled={isSubmitting || !isFormValid()}
              >
                {isSubmitting ? (
                  <div className="btn-loader"></div>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT INFO */}
          <div className="contact-card contact-info-card">
            <div className="card-title-row">
              <h2>Contact information</h2>
              <p>Reach out through any of the following channels.</p>
            </div>

            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Mail size={18} />
                </div>

                <div>
                  <h4>Email</h4>
                  <p>dadireshma934@gmail.com</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Phone size={18} />
                </div>

                <div>
                  <h4>Phone</h4>
                  <p>+91 9885664320</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <MapPin size={18} />
                </div>

                <div>
                  <h4>Location</h4>
                  <p>Vizag, Andhra Pradesh, India</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Clock3 size={18} />
                </div>

                <div>
                  <h4>Support Hours</h4>
                  <p>Monday - Friday • 9:00 AM to 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;