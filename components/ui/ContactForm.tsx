"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

export function ContactForm() {
  const { locale, ui } = useLocale();
  const c = ui.pages.contact;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("feedback");
  const [message, setMessage] = useState("");
  const [botField, setBotField] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactEmail =
    (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "").trim() ||
    "contact@dailycalcwell.com";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(c.errors.name);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(c.errors.email);
      return;
    }
    if (message.trim().length < 10) {
      setError(c.errors.message);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const payload = new URLSearchParams({
        "form-name": "contact",
        "bot-field": botField,
        name: name.trim(),
        email: email.trim(),
        topic,
        message: message.trim(),
        locale,
      });

      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setSubmitted(true);
    } catch {
      setError(c.errors.submit);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-slate-900"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
            aria-hidden="true"
          />
          <div>
            <h3 className="font-bold text-slate-900">{c.formSuccessTitle}</h3>
            <p className="mt-1 text-sm text-slate-700 leading-relaxed">
              {c.formSuccessBody}{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="font-mono font-medium text-sky-800 underline hover:text-sky-950"
              >
                {contactEmail}
              </a>
              .
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setName("");
                setEmail("");
                setMessage("");
                setBotField("");
              }}
              className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              {c.formReset}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      name="contact"
      method="POST"
      action="/__forms.html"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <input type="hidden" name="form-name" value="contact" />
      <input type="hidden" name="locale" value={locale} />
      <p className="hidden" aria-hidden="true">
        <label>
          Do not fill this out:
          <input
            type="text"
            name="bot-field"
            value={botField}
            onChange={(e) => setBotField(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </p>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-sm font-semibold text-slate-800"
          >
            {c.formName}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-2 focus:outline-sky-500"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="block text-sm font-semibold text-slate-800"
          >
            {c.formEmail}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-2 focus:outline-sky-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-topic"
          className="block text-sm font-semibold text-slate-800"
        >
          {c.formTopic}
        </label>
        <select
          id="contact-topic"
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
        >
          <option value="feedback">{c.topics.feedback}</option>
          <option value="correction">{c.topics.correction}</option>
          <option value="privacy">{c.topics.privacy}</option>
          <option value="business">{c.topics.business}</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-semibold text-slate-800"
        >
          {c.formMessage}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-2 focus:outline-sky-500"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-[#38BDF8] px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-[#0EA5E9] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        {submitting ? c.formSubmitting : c.formSubmit}
      </button>
    </form>
  );
}
