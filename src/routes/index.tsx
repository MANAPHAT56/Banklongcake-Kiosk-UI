import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/HomePage";
import { th } from "@/i18n/th";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${th.brand} · เค้กสดพร้อมเสิร์ฟทุกเวลา` },
      {
        name: "description",
        content: `${th.brand} ตู้คีออสก์สั่งเค้กพรีเมียม แตะเลือก สแกนจ่าย รับเค้กสดทำใหม่ทุกวัน พร้อมให้บริการ 24 ชั่วโมง`,
      },
      { property: "og:title", content: `${th.brand} · ตู้จำหน่ายเค้กอัตโนมัติ` },
      {
        property: "og:description",
        content: "เค้กสดพร้อมเสิร์ฟทุกเวลา ทุกที่ — ประสบการณ์สั่งเค้กแบบตู้คีออสก์พรีเมียม",
      },
    ],
  }),
  component: HomePage,
});
