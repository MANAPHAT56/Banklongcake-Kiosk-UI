import { createFileRoute } from "@tanstack/react-router";
import { Loader2, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MachineCard } from "@/components/MachineCard";
import { useMachines, type MachineFilters } from "@/hooks/useMachines";

const THAI_PROVINCES = [
  "กรุงเทพมหานคร",
  "กระบี่",
  "กาญจนบุรี",
  "กาฬสินธุ์",
  "กำแพงเพชร",
  "ขอนแก่น",
  "จันทบุรี",
  "ฉะเชิงเทรา",
  "ชลบุรี",
  "ชัยนาท",
  "ชัยภูมิ",
  "ชุมพร",
  "เชียงราย",
  "เชียงใหม่",
  "ตรัง",
  "ตราด",
  "ตาก",
  "นครนายก",
  "นครปฐม",
  "นครพนม",
  "นครราชสีมา",
  "นครศรีธรรมราช",
  "นครสวรรค์",
  "นนทบุรี",
  "นราธิวาส",
  "น่าน",
  "บึงกาฬ",
  "บุรีรัมย์",
  "ปทุมธานี",
  "ประจวบคีรีขันธ์",
  "ปราจีนบุรี",
  "ปัตตานี",
  "พระนครศรีอยุธยา",
  "พังงา",
  "พัทลุง",
  "พิจิตร",
  "พิษณุโลก",
  "เพชรบุรี",
  "เพชรบูรณ์",
  "แพร่",
  "พะเยา",
  "ภูเก็ต",
  "มหาสารคาม",
  "มุกดาหาร",
  "แม่ฮ่องสอน",
  "ยะลา",
  "ยโสธร",
  "ร้อยเอ็ด",
  "ระนอง",
  "ระยอง",
  "ราชบุรี",
  "ลพบุรี",
  "ลำปาง",
  "ลำพูน",
  "เลย",
  "ศรีสะเกษ",
  "สกลนคร",
  "สงขลา",
  "สตูล",
  "สมุทรปราการ",
  "สมุทรสงคราม",
  "สมุทรสาคร",
  "สระแก้ว",
  "สระบุรี",
  "สิงห์บุรี",
  "สุโขทัย",
  "สุพรรณบุรี",
  "สุราษฎร์ธานี",
  "สุรินทร์",
  "หนองคาย",
  "หนองบัวลำภู",
  "อ่างทอง",
  "อำนาจเจริญ",
  "อุดรธานี",
  "อุตรดิตถ์",
  "อุทัยธานี",
  "อุบลราชธานี",
];

export const Route = createFileRoute("/locations/")({
  head: () => ({
    meta: [
      { title: "ค้นหาตู้ บ้านกล่องเค้ก — จุดตั้งตู้" },
      {
        name: "description",
        content: "ค้นหาตู้ บ้านกล่องเค้ก ตามชื่อ สถานที่ จังหวัด และสถานะออนไลน์ ก่อนเดินทางไปซื้อ",
      },
      { property: "og:title", content: "ค้นหาตู้ บ้านกล่องเค้ก" },
      { property: "og:description", content: "ดูตู้ทั้งหมด ค้นหาตามจังหวัด และเช็กสต็อกสินค้าในแต่ละตู้" },
    ],
  }),
  component: LocationsPage,
});

const DEFAULT_FILTERS: MachineFilters = {
  search: "",
  province: "",
  availability: "",
  sortBy: "name",
  sortOrder: "asc",
};

function cleanFilters(filters: MachineFilters): MachineFilters {
  return {
    search: filters.search?.trim(),
    province: filters.province?.trim(),
    availability: filters.availability,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
}

function hasFilters(filters: MachineFilters) {
  return Boolean(
    filters.search ||
      filters.province ||
      filters.availability ||
      filters.sortBy !== DEFAULT_FILTERS.sortBy ||
      filters.sortOrder !== DEFAULT_FILTERS.sortOrder,
  );
}

function LocationsPage() {
  const [draftFilters, setDraftFilters] = useState<MachineFilters>(DEFAULT_FILTERS);
  const [filters, setFilters] = useState<MachineFilters>(DEFAULT_FILTERS);
  const { machines, loading, error, reload } = useMachines(filters);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters(cleanFilters(draftFilters));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [draftFilters]);

  function updateFilter(field: keyof MachineFilters, value: string) {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  }

  function clearFilters() {
    setDraftFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <>
      <SiteHeader />
      <section className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-accent font-bold text-sm uppercase tracking-wider">ค้นหาตู้</p>
            <h1 className="mt-2 font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-balance">
              เลือกตู้ที่อยากไป
            </h1>
            <p className="mt-3 text-foreground/70">
              ค้นหาตามชื่อ สถานที่ หรือจังหวัด แล้วเช็กว่าตู้พร้อมขายอยู่ไหมก่อนเดินทาง
            </p>
          </div>

          <div className="mt-8 rounded-3xl border-2 border-secondary/50 bg-card/90 p-4 shadow-card sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_150px]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
                <input
                  value={draftFilters.search ?? ""}
                  onChange={(event) => updateFilter("search", event.target.value)}
                  placeholder="ค้นหาชื่อตู้ หรือสถานที่"
                  className="h-11 w-full rounded-2xl border-2 border-secondary/60 bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary"
                />
              </label>

              <select
                value={draftFilters.province ?? ""}
                onChange={(event) => updateFilter("province", event.target.value)}
                className="h-11 rounded-2xl border-2 border-secondary/60 bg-background px-3 text-sm outline-none transition focus:border-primary"
              >
                <option value="">ทุกจังหวัด</option>
                {THAI_PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>

              <select
                value={draftFilters.availability ?? ""}
                onChange={(event) => updateFilter("availability", event.target.value)}
                className="h-11 rounded-2xl border-2 border-secondary/60 bg-background px-3 text-sm outline-none transition focus:border-primary"
              >
                <option value="">ทุกสถานะ</option>
                <option value="AVAILABLE">พร้อมใช้งาน</option>
                <option value="UNAVAILABLE">ไม่พร้อมใช้งาน</option>
              </select>

              <select
                value={`${draftFilters.sortBy}:${draftFilters.sortOrder}`}
                onChange={(event) => {
                  const [sortBy, sortOrder] = event.target.value.split(":");
                  setDraftFilters((current) => ({
                    ...current,
                    sortBy,
                    sortOrder: sortOrder as "asc" | "desc",
                  }));
                }}
                className="h-11 rounded-2xl border-2 border-secondary/60 bg-background px-3 text-sm outline-none transition focus:border-primary"
              >
                <option value="name:asc">เรียงตามชื่อ</option>
                <option value="province:asc">เรียงตามจังหวัด</option>
                <option value="sales_count:desc">ขายดีที่สุด</option>
              </select>
            </div>

            <div className="mt-3 flex flex-col gap-2 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {loading ? "กำลังค้นหา..." : `พบ ${machines.length} ตู้`}
              </span>
              {hasFilters(draftFilters) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 font-bold text-accent hover:underline"
                >
                  <X className="size-4" />
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-10 text-center">
              <p className="text-destructive font-semibold">{error}</p>
              <button type="button" onClick={reload} className="bubble-btn-soft mt-4 inline-flex items-center gap-2">
                <RefreshCw className="size-4" /> ลองใหม่
              </button>
            </div>
          )}

          {loading ? (
            <div className="mt-14 flex justify-center">
              <Loader2 className="size-10 animate-spin text-accent" />
            </div>
          ) : machines.length === 0 ? (
            <div className="mt-14 rounded-3xl border-2 border-secondary/50 bg-card p-8 text-center shadow-card">
              <p className="font-display text-2xl font-bold">ไม่พบตู้ที่ตรงกับเงื่อนไข</p>
              <p className="mt-2 text-foreground/60">ลองล้างตัวกรองหรือค้นหาจังหวัดใกล้เคียง</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {machines.map((machine, index) => (
                <MachineCard key={machine.machine_uuid} machine={machine} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}