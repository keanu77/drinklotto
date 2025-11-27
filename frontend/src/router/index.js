import { createRouter, createWebHistory } from 'vue-router';

import Login from '../views/Login.vue';
import AdminLayout from '../views/AdminLayout.vue';
import Dashboard from '../views/Dashboard.vue';
import RoomToday from '../views/RoomToday.vue';
import OrdersToday from '../views/OrdersToday.vue';
import Stores from '../views/Stores.vue';
import Lottery from '../views/Lottery.vue';
import Order from '../views/Order.vue';

const routes = [
  // 前台頁面
  { path: '/', name: 'Lottery', component: Lottery },
  { path: '/lottery', redirect: '/' },
  { path: '/order', name: 'Order', component: Order },

  // 後台頁面
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'room-today', name: 'RoomToday', component: RoomToday },
      { path: 'orders-today', name: 'OrdersToday', component: OrdersToday },
      { path: 'stores', name: 'Stores', component: Stores }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
