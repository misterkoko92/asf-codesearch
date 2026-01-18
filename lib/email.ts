import { Resend } from "resend";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type SendResult = {
  delivered: boolean;
};

function getResendClient() {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function isEmailConfigured() {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const from = (process.env.EMAIL_FROM || "").trim();
  return Boolean(apiKey && from);
}

export async function sendEmail(payload: EmailPayload): Promise<SendResult> {
  const client = getResendClient();
  const from = (process.env.EMAIL_FROM || "").trim();
  if (!client || !from) {
    return { delivered: false };
  }

  await client.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  });

  return { delivered: true };
}
