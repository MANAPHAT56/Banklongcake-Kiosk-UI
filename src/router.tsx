// import { QueryClient } from "@tanstack/react-query";
// import { createRouter } from "@tanstack/react-router";
// import { routeTree } from "./routeTree.gen";

// export const getRouter = () => {
//   const queryClient = new QueryClient();

//   const router = createRouter({
//     routeTree,
//     context: { queryClient },
//     scrollRestoration: true,
//     defaultPreloadStaleTime: 0,
//   });

//   return router;
// };
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient } from '@tanstack/react-query' // 👈 1. import ตัวนี้เพิ่มเข้ามา

// 2. สร้างอินสแตนซ์ queryClient ขึ้นมาตรงนี้
export const queryClient = new QueryClient()

export const router = createRouter({
  routeTree,
  context: {
    queryClient, // 👈 3. ส่ง queryClient เข้าไปใน context ตามที่ระบบต้องการ
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}