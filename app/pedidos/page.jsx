import React from 'react';
import RecentOrders from '../recentOrders/page';
import Aside from '../components/Aside';

export default function Page () {
  return (
    <div>
    <main>
      <h1>Pedidos</h1>

      <RecentOrders />
    </main>
    </div>
  );
};
