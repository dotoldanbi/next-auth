import { headers } from "next/headers";
import { Webhook } from "svix";
import { createOrUpdateUser, deleteUser } from "@/lib/actions/user";
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET; // Clerk 대시보드에서 확인

export async function POST(req) {
  const payload = await req.json(); // raw body
  const body = JSON.stringify(payload); // JSON으로 변환
  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");
  if (!WEBHOOK_SECRET || !svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing required headers or secret");
    return new Response("Missing headers or secret", { status: 400 });
  }

  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(body, svixHeaders); // 서명 검증
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const { id } = evt?.data;
  const eventType = evt?.type;
  // const eventData = evt?.data;

  // console.log("✅ Clerk Webhook 수신됨:");
  // console.log("Event type:", eventType);
  // console.log("Event data:", eventData);

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, first_name, last_name, image_url, email_addresses, username } =
      evt?.data;
    try {
      await createOrUpdateUser(
        id,
        first_name,
        last_name,
        image_url,
        email_addresses,
        username
      );
      return new Response("User created or updated successfully", {
        status: 200,
      });
    } catch (error) {
      console.error("Error creating or updating user:", error);
      return new Response("Failed to create or update user", { status: 500 });
    }
  }
  if (eventType === "user.deleted") {
    const { id } = evt?.data;
    try {
      await deleteUser(id);
      return new Response("User deleted successfully", { status: 200 });
    } catch (error) {
      console.error("Error deleting user:", error);
      return new Response("Failed to delete user", { status: 500 });
    }
  }
  // TODO: 이벤트 타입에 따라 원하는 작업 처리
  // 예: 사용자 생성시 DB에 기록 등

  return new Response("Webhook received", { status: 200 });
}
