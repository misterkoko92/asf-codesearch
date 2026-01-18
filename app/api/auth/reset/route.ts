import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { hashResetToken } from "@/lib/passwordReset";

export const runtime = "nodejs";

const resetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const tokenHash = hashResetToken(token);
  const entry = await prisma.passwordResetToken.findUnique({
    where: { tokenHash }
  });

  if (!entry || entry.usedAt || entry.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: entry.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: entry.id },
      data: { usedAt: new Date() }
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: entry.userId,
        id: { not: entry.id }
      }
    })
  ]);

  return NextResponse.json({ message: "Password updated" });
}
