import React from 'react';
import Insights from './Insights';
import RecentOrders from '../recentOrders/page';

const Dashboard = () => {
  return (
    <main>
      <h1>Dashboard</h1>
      <div className="date">
        <input type="date" />
      </div>
      <Insights />
      <RecentOrders />
    </main>
  );
};

export default Dashboard;
