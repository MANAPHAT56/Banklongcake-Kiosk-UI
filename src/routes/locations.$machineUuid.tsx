import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  Loader2,
  MapPin,
  Navigation,
  Package,
  PackageX,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MachineSlotRow } from "@/components/MachineSlotRow";
import { fetchMachineSlots } from "@/lib/api/client";
import { machineStockLabel, summarizeSlotInventory } from "@/lib/machineSlots";
import { useMachineSlots } from "@/hooks/useMachineSlots";

export const Route = createFileRoute("/locations/$machineUuid")({
  loader: async ({ params }) => {
    const machineUuid = params.machineUuid?.trim();
    if (!machineUuid) throw notFound();

    const slotsData = await fetchMachineSlots(machineUuid);
    if (!slotsData?.machine?.machine_uuid) throw notFound();

    return { slotsData };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.slotsData.machine.name} — สต็อกตู้ บ้านกล่องเค้ก` },
          {
            name: "description",
            content: `ดูสินค้าและสต็อกในตู้ ${loaderData.slotsData.machine.name} · ${loaderData.slotsData.machine.location}`,
          },
        ]
      : [],
  }),
  component: MachineDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <h1 className="font-display font-bold text-3xl">ไม่พบตู้นี้</h1>
      <Link to="/locations" className="bubble-btn mt-6">
        กลับไปรายการตู้
      </Link>
    </div>
  ),
});

function MachineDetailPage() {
  const { machineUuid } = Route.useParams();
  const { slotsData } = Route.useLoaderData();
  const { data, loading, error, reload } = useMachineSlots(machineUuid);

  const machine = data?.machine ?? slotsData.machine;

  const slots = data?.slots ?? [];
  const summary = useMemo(() => summarizeSlotInventory(slots), [slots]);
  const stockLabel = machineStockLabel(summary);

  const isAvailable = machine.is_online && machine.status === "ACTIVE";

  return (
    <>
      <SiteHeader />

      <section className="px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-16">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/locations"
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent font-semibold text-sm"
          >
            <ArrowLeft className="size-4" /> รายการตู้ทั้งหมด
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-3xl border-2 border-secondary/50 bg-card p-6 sm:p-8 shadow-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display font-bold text-3xl sm:text-4xl">{machine.name}</h1>
                <p className="mt-2 flex items-start gap-2 text-foreground/70">
                  <MapPin className="size-4 shrink-0 mt-0.5" />
                  {machine.location}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                  isAvailable ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {isAvailable ? <CircleCheck className="size-3" /> : <CircleX className="size-3" />}
                {isAvailable ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน"}
              </span>
            </div>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(machine.location)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-accent font-bold text-sm hover:underline"
            >
              <Navigation className="size-4" /> นำทางไปตู้นี้
            </a>

            <div
              className={`mt-6 rounded-2xl p-4 ${
                summary.hasAnyStock ? "bg-success/10" : "bg-destructive/10"
              }`}
            >
              <p className="font-display font-bold text-lg flex items-center gap-2">
                {summary.hasAnyStock ? (
                  <Package className="size-5 text-success" />
                ) : (
                  <PackageX className="size-5 text-destructive" />
                )}
                {stockLabel}
              </p>
              <p className="mt-2 text-sm text-foreground/70">
                {summary.inStockSlots} ช่องมีสินค้า · {summary.outOfStockSlots} ช่องหมด ·{" "}
                {summary.emptySlots} ช่องว่าง
              </p>
            </div>

            <p className="mt-4 text-sm text-foreground/60 flex items-center gap-2">
              <ShoppingBag className="size-4" />
                   ซื้อได้ที่หน้าจอตู้เท่านั้น — เลือกสินค้าที่หน้าจอตู้เเละสแกน QR เพื่อชำระเงิน หรือเเสกนคิวอาร์โค้ดที่ตู้ผ่านปุ่มสั่งผ่านมือถือในหน้าจอตู้เพื่อเปิดหน้าเมนูเเละสั่งซื้อในอุปกรณ์ของคุณ
            </p>
          </motion.div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <h2 className="font-display font-bold text-2xl">สินค้าในตู้ (12 ช่อง)</h2>
            <button
              type="button"
              onClick={reload}
              disabled={loading}
              className="bubble-btn-soft !py-2 !px-4 text-sm inline-flex items-center gap-2"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              รีเฟรช
            </button>
          </div>

          {error && <p className="mt-4 text-destructive font-semibold">{error}</p>}

          {loading && slots.length === 0 ? (
            <div className="mt-10 flex justify-center">
              <Loader2 className="size-10 animate-spin text-accent" />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {slots.map((slot) => (
                <MachineSlotRow key={slot.slot_number} slot={slot} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}