export type Product = {
  id: number;
  slotNumber?: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  ingredients: string;
  storage: string;
  available: boolean;
  freshness: string;
  tag?: string;
  stockQuantity?: number;
};

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=80`;

export const products: Product[] = [
  { id: 1,  name: "เค้กสตรอว์เบอร์รี่",       price: 129, imageUrl: img("photo-1565958011703-44f9829ba187"), description: "เค้กวานิลลานุ่ม สลับชั้นสตรอว์เบอร์รี่สดและวิปครีม", ingredients: "แป้งเค้ก สตรอว์เบอร์รี่สด วิปครีม น้ำตาล ไข่", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้", tag: "ขายดี" },
  { id: 2,  name: "เค้กลาวาช็อกโกแลต",        price: 149, imageUrl: img("photo-1606313564200-e75d5e30476c"), description: "เค้กช็อกโกแลตอุ่นๆ ไส้ละลายเบลเยียม", ingredients: "ช็อกโกแลตดำ เนย ไข่ แป้ง น้ำตาล", storage: "ควรรับประทานภายใน 24 ชั่วโมง", available: true,  freshness: "ทำวันนี้", tag: "ร้อน" },
  { id: 3,  name: "ชีสเค้กบลูเบอร์รี่",       price: 159, imageUrl: img("photo-1533134242443-d4fd215305ad"), description: "ชีสเค้กครีมมี่ ท็อปด้วยคอมโพตบลูเบอร์รี่", ingredients: "ครีมชีส บลูเบอร์รี่ ฐานบิสกิต น้ำตาล ไข่", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้" },
  { id: 4,  name: "เรดเวลเว็ต",               price: 139, imageUrl: img("photo-1586788680434-30d324b2d46f"), description: "เค้กเรดเวลเว็ตนุ่ม ท็อปด้วยครีมชีสฟรอสติ้ง", ingredients: "โกโก้ บัตเตอร์มิลค์ ครีมชีส เนย น้ำตาล", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้" },
  { id: 5,  name: "เค้กมะพร้าว",              price: 119, imageUrl: img("photo-1571115177098-24ec42ed204d"), description: "ชิฟฟอนมะพร้าวเบาๆ โรยมะพร้าวคั่ว", ingredients: "กะทิ ไข่ แป้ง น้ำตาล มะพร้าวคั่ว", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้" },
  { id: 6,  name: "เค้กชาไทย",                price: 135, imageUrl: img("photo-1488477181946-6428a0291777"), description: "เค้กชาไทยหอม สลับชั้นครีมชาไทยเนียนนุ่ม", ingredients: "ชาไทย ครีม ไข่ แป้ง นมข้นหวาน", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้", tag: "ท้องถิ่น" },
  { id: 7,  name: "ทิรามิสุ",                 price: 165, imageUrl: img("photo-1571877227200-a0d98ea607e9"), description: "ทิรามิสุคลาสสิก ชุบเลดี้ฟิงเกอร์ด้วยเอสเปรสโซ", ingredients: "มาสคาร์โพน เอสเปรสโซ เลดี้ฟิงเกอร์ โกโก้ ไข่", storage: "เก็บในตู้เย็น 2–8°C", available: false, freshness: "ทำวันนี้" },
  { id: 8,  name: "ชีสเค้กโอรีโอ",            price: 155, imageUrl: img("photo-1543339308-43e59d6b73a6"), description: "ชีสเค้กครีมมี่ ผสมคุกกี้โอรีโอบด", ingredients: "ครีมชีส คุกกี้โอรีโอ เนย ครีม น้ำตาล", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้" },
  { id: 9,  name: "ทาร์ตเลมอน",               price: 109, imageUrl: img("photo-1519915028121-7d3463d20b13"), description: "ฐานบัตเตอร์กรอบ ไส้เลมอนคัร์ดเปรี้ยวหวาน", ingredients: "เลมอน เนย ไข่ น้ำตาล แป้ง", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้" },
  { id: 10, name: "เค้กมัทฉะ",                price: 145, imageUrl: img("photo-1515037893149-de7f840978e2"), description: "เค้กมัทฉะเกรดพิธี สลับชั้นกานาชวิตช็อกโกแลต", ingredients: "มัทฉะ ไวท์ช็อกโกแลต ไข่ แป้ง ครีม", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้", tag: "ใหม่" },
  { id: 11, name: "เค้กมูสมะม่วง",            price: 139, imageUrl: img("photo-1464195244916-405fa0a82545"), description: "มูสมะม่วงเนียนนุ่ม บนสปันจ์อัลมอนด์", ingredients: "มะม่วง ครีม เจลาติน อัลมอนด์ น้ำตาล", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้" },
  { id: 12, name: "บานอฟฟี่พาย",              price: 129, imageUrl: img("photo-1488477304112-4944851de03d"), description: "คาราเมล กล้วย และวิปครีมบนฐานบิสกิต", ingredients: "กล้วย คาราเมล ครีม บิสกิต เนย", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้" },
  { id: 13, name: "มิลล์ฟอยราสเบอร์รี่",      price: 169, imageUrl: img("photo-1612203985729-70726954388c"), description: "แป้งพัฟกรอบ สลับชั้นครีมราสเบอร์รี่", ingredients: "แป้งพัฟ ราสเบอร์รี่ ครีม น้ำตาล วานิลลา", storage: "ควรรับประทานภายใน 24 ชั่วโมง", available: true,  freshness: "ทำวันนี้" },
  { id: 14, name: "เค้กแครอทวอลนัท",          price: 125, imageUrl: img("photo-1621303837174-89787a7d4729"), description: "เค้กแครอทเครื่องเทศ โรยวอลนัท ท็อปครีมชีส", ingredients: "แครอท วอลนัท ครีมชีส อบเชย น้ำตาล", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้" },
  { id: 15, name: "เค้กพิสตาชิโอกุหลาบ",      price: 179, imageUrl: img("photo-1557925923-cd4648e211a0"), description: "เค้กพิสตาชิโอ บัตเตอร์ครีมกลิ่นกุหลาบ", ingredients: "พิสตาชิโอ น้ำกุหลาบ เนย ไข่ แป้ง", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้", tag: "พรีเมียม" },
  { id: 16, name: "คาราเมลพุดดิ้ง",           price: 89,  imageUrl: img("photo-1551024506-0bccd828d307"), description: "พุดดิ้งคัสตาร์ดเนียน ราดซอสคาราเมลเผา", ingredients: "นม ไข่ น้ำตาล วานิลลา", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้" },
  { id: 17, name: "แบล็กฟอเรสต์",             price: 159, imageUrl: img("photo-1578985545062-69928b1d9587"), description: "เค้กช็อกโกแลต เชอร์รี่ และครีมชานติลลี่", ingredients: "ช็อกโกแลต เชอร์รี่ ครีม คิร์ช ไข่", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้" },
  { id: 18, name: "เค้กโยเกิร์ตพีช",          price: 135, imageUrl: img("photo-1562777717-dc6984f65a63"), description: "มูสโยเกิร์ตเบาๆ ท็อปพีชหวาน", ingredients: "พีช โยเกิร์ต ครีม เจลาติน น้ำตาล", storage: "เก็บในตู้เย็น 2–8°C", available: true,  freshness: "ทำวันนี้" },
  { id: 19, name: "ฮันนี่คัสเทลล่า",          price: 99,  imageUrl: img("photo-1599785209707-a456fc1337bb"), description: "เค้กสปันจ์ฮันนี่ญี่ปุ่น นุ่มละมุน", ingredients: "น้ำผึ้ง ไข่ แป้ง น้ำตาล", storage: "อุณหภูมิห้อง ปิดสนิท", available: true,  freshness: "ทำวันนี้" },
  { id: 20, name: "บราวนี่อุ้งหมี",            price: 79,  imageUrl: img("photo-1606890737304-57a1ca8a5b62"), description: "บราวนี่ช็อกโกแลตเนื้อแน่น รูปอุ้งหมีน่ารัก", ingredients: "ช็อกโกแลต เนย ไข่ แป้ง น้ำตาล", storage: "อุณหภูมิห้อง ปิดสนิท", available: true,  freshness: "ทำวันนี้", tag: "น่ารัก" },
];
