import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { generateResetToken, getResetBaseUrl, getResetExpiry, hashResetToken } from "@/lib/passwordReset";

export const runtime = "nodejs";

const forgotSchema = z.object({
  email: z.string().email()
});

const DEFAULT_MESSAGE =
  "Si un compte correspond a cet email, un lien de reinitialisation a ete envoye.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = forgotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  const email = parsed.data.email.trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ message: DEFAULT_MESSAGE });
  }

  const token = generateResetToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = getResetExpiry();

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id }
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt
    }
  });

  const baseUrl = getResetBaseUrl(request.url);
  const resetUrl = `${baseUrl}/reset?token=${encodeURIComponent(token)}`;
  const ttlMinutes = Math.max(1, Math.round((expiresAt.getTime() - Date.now()) / 60000));

  try {
    await sendEmail({
      to: user.email,
      subject: "Reinitialisation du mot de passe ASF Codesearch",
      text: `Vous avez demande la reinitialisation de votre mot de passe.\n\nLien: ${resetUrl}\n\nCe lien expire dans ${ttlMinutes} minutes.`,
      html: `<p>Vous avez demande la reinitialisation de votre mot de passe.</p><p><a href="${resetUrl}">Reinitialiser mon mot de passe</a></p><p>Ce lien expire dans ${ttlMinutes} minutes.</p>`
    });
  } catch (error) {
    return NextResponse.json({ error: "Email send failed" }, { status: 502 });
  }

  return NextResponse.json({ message: DEFAULT_MESSAGE });
}
