import { headers } from "next/headers";
import { Webhook } from "svix";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET; // Clerk 대시보드에서 확인

export async function POST(req) {
  const payload = await req.text(); // raw body
  const headerPayload = await headers();

  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(payload, svixHeaders); // 서명 검증
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;
  const eventData = evt.data;

  console.error("✅ Clerk Webhook 수신됨:");
  console.error("Event type:", eventType);
  console.error("Event data:", eventData);

  // TODO: 이벤트 타입에 따라 원하는 작업 처리
  // 예: 사용자 생성시 DB에 기록 등

  return new Response("Webhook received", { status: 200 });
}
