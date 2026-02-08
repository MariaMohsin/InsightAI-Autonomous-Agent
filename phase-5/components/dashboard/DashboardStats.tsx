// components/dashboard/DashboardStats.tsx
'use client';

import { StatCard } from './StatCard';

interface DashboardStatsProps {
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalTodos,
  completedTodos,
  pendingTodos
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Todos"
        value={totalTodos}
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
        gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        delay={0}
      />

      <StatCard
        title="Completed"
        value={completedTodos}
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        gradient="bg-gradient-to-br from-green-500 to-green-600"
        delay={0.1}
      />

      <StatCard
        title="Pending"
        value={pendingTodos}
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        delay={0.2}
      />
    </div>
  );
};
