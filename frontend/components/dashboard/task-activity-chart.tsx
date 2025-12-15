'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { TaskStats } from '@/lib/types';

interface TaskActivityChartProps {
  stats: TaskStats | null;
  isLoading?: boolean;
}

const COLORS = {
  todo: '#fbbf24',
  inProgress: '#a855f7',
  done: '#22c55e',
};

export function TaskActivityChart({ stats, isLoading }: TaskActivityChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: 'To Do', value: stats?.todo || 0, color: COLORS.todo },
    { name: 'In Progress', value: stats?.inProgress || 0, color: COLORS.inProgress },
    { name: 'Done', value: stats?.done || 0, color: COLORS.done },
  ];

  const barData = [
    {
      name: 'Tasks',
      'To Do': stats?.todo || 0,
      'In Progress': stats?.inProgress || 0,
      'Done': stats?.done || 0,
    },
  ];

  const hasData = (stats?.todo || 0) + (stats?.inProgress || 0) + (stats?.done || 0) > 0;

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No task data available</p>
            <p className="text-sm text-muted-foreground">
              Create some tasks to see the distribution chart
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="To Do" fill={COLORS.todo} radius={[0, 4, 4, 0]} />
                <Bar
                  dataKey="In Progress"
                  fill={COLORS.inProgress}
                  radius={[0, 4, 4, 0]}
                />
                <Bar dataKey="Done" fill={COLORS.done} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
