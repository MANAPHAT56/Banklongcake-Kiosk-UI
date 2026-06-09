import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, CircleCheck, CircleX } from "lucide-react";
import type { Machine } from "@/types/api";

export function MachineCard({
  machine,
  stockHint,
  index = 0,
}: {
  machine: Machine;
  stockHint?: string;
  index?: number;
}) {
  const machineUuid = machine.machineUuid ?? machine.machine_uuid;
  const connectionStatus = machine.connectionStatus ?? machine.connection_status;
  const serviceStatus = machine.serviceStatus ?? machine.service_status;
  const province = machine.telemetry?.province;
  const available = connectionStatus === "ONLINE" && serviceStatus === "ACTIVE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to="/locations/$machineUuid"
        params={{ machineUuid }}
        className="group flex flex-col h-full bg-card rounded-3xl p-6 border-2 border-secondary/50 shadow-card hover:border-primary/50 hover:-translate-y-1 transition-all"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="size-12 rounded-2xl bg-gradient-pink text-primary-foreground grid place-items-center shadow-bubble shrink-0">
            <MapPin className="size-5" />
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
              available
                ? "bg-success/15 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {available
              ? <CircleCheck className="size-3" />
              : <CircleX className="size-3" />}
            {available ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน"}
          </span>
        </div>

        <h3 className="mt-4 font-display font-bold text-xl group-hover:text-accent transition-colors">
          {machine.name}
        </h3>
        <p className="mt-2 text-sm text-foreground/70 line-clamp-2">{machine.location}</p>
        {province && (
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-accent">{province}</p>
        )}

        {stockHint ? (
          <p className="mt-3 text-sm font-semibold text-foreground/80">{stockHint}</p>
        ) : (
          <p className="mt-3 text-sm text-foreground/50">แตะเพื่อดูสินค้าและสต็อกในตู้</p>
        )}

        <p className="mt-4 text-sm font-bold text-accent inline-flex items-center gap-1 group-hover:underline">
          ดูรายละเอียดตู้ <ChevronRight className="size-4" />
        </p>
      </Link>
    </motion.div>
  );
}