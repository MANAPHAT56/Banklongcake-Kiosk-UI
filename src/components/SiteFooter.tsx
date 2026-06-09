import { Link } from "@tanstack/react-router";
import { Facebook, Phone, Heart } from "lucide-react";
import mascot from "@/assets/mascot.png";

export function SiteFooter() {
  // ดึงค่าจาก Environment Variables
  const facebookUrl = import.meta.env.VITE_CONTACT_FACEBOOK_URL || "#";
  const phoneNumber = import.meta.env.VITE_CONTACT_PHONE || "";

  return (
    <footer className="mt-24 bg-gradient-to-b from-transparent to-secondary/60 border-t border-secondary/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={mascot} alt="" width={56} height={56} className="size-14" />
            <span className="font-display font-bold text-2xl">
              บ้านกล่อง<span className="text-accent">เค้ก</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-foreground/70">
            เค้กสดใหม่ทุกวัน ตลอด 24 ชั่วโมง จากครัวของเราสู่ตู้ บ้านกล่องเค้ก ใกล้บ้านคุณ
          </p>
          
          {/* โซเชียลและช่องทางการติดต่อ */}
          <div className="mt-5 flex gap-2">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="size-11 grid place-items-center rounded-full bg-card shadow-card text-accent hover:scale-110 transition-transform"
            >
              <Facebook className="size-5" />
            </a>
            
            {phoneNumber && (
              <a
                href={`tel:${phoneNumber}`}
                aria-label="โทรศัพท์"
                className="size-11 grid place-items-center rounded-full bg-card shadow-card text-accent hover:scale-110 transition-transform"
              >
                <Phone className="size-5" />
              </a>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-display font-bold mb-3">เมนู</h4>
          <ul className="space-y-2 text-foreground/70">
            <li>
              <Link to="/cakes" className="hover:text-accent">
                เค้กทั้งหมด
              </Link>
            </li>
            <li>
              <Link to="/cakes" className="hover:text-accent">
                สินค้ายอดนิยม
              </Link>
            </li>
            <li>
              <Link to="/locations" className="hover:text-accent">
                ค้นหาตู้
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-display font-bold mb-3">แบรนด์</h4>
          <ul className="space-y-2 text-foreground/70">
            <li>
              <Link to="/about" className="hover:text-accent">
                เรื่องราวของเรา
              </Link>
            </li>
            <li>
              <Link to="/locations" className="hover:text-accent">
                จุดตั้งตู้
              </Link>
            </li>
            <li>
              <a href="/#faq" className="hover:text-accent">
                คำถามที่พบบ่อย
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-secondary/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-5 text-sm text-foreground/60 flex flex-wrap gap-2 justify-between items-center">
          <p>© {new Date().getFullYear()} บ้านกล่องเค้ก สงวนลิขสิทธิ์</p>
          <p className="inline-flex items-center gap-1">
            อบด้วย <Heart className="size-4 fill-accent text-accent" /> ที่เลย
          </p>
        </div>
      </div>
    </footer>
  );
}