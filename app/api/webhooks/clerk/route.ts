import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  const payload = await req.text();
  const h = await headers();

  const svix_id = h.get("svix-id");
  const svix_timestamp = h.get("svix-timestamp");
  const svix_signature = h.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  let evt: WebhookEvent;

  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const eventType = evt.type;

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const data = evt.data;

      const email =
        data.email_addresses?.[0]?.email_address ??
        data.primary_email_address_id ??
        "";

      const name =
        [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
        data.username ||
        "Unknown";

      await prisma.user.upsert({
        where: { id: data.id },
        update: {
          email: email || undefined,
          name,
          isActive: true,
        },
        create: {
          id: data.id,
          email: email || `${data.id}@no-email.local`, 
          name,
          roles: ["REQUESTER"], // default role
          isActive: true,
        },
      });
    }

    if (eventType === "user.deleted") {
      const data = evt.data;
      const userId = (data as any).id; // deleted payload can vary

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false },
        });
      }
    }

    return Response.json({ ok: true });
  } catch (e) {
    return new Response("Webhook handler failed", { status: 500 });
  }
}
