import React, { useEffect, useState } from "react";
import { useFetchAllOrders } from "../../hooks/useCreateOrder";

const DashboardStats = () => {
  const { data: orders = [], isLoading } = useFetchAllOrders();

  const [completedTodayCount, setCompletedTodayCount] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [totalOrdersServed, setTotalOrdersServed] = useState(0);

  useEffect(() => {
    if (!orders.length) {
      setCompletedTodayCount(0);
      setRevenueToday(0);
      setPendingOrdersCount(0);
      setTotalOrdersServed(0);
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedTodayOrders = orders.filter((order) => {
      if (order.status !== "completed") return false;
      const orderDate = new Date(order.date);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    setCompletedTodayCount(completedTodayOrders.length);

    const totalRevenue = completedTodayOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );
    setRevenueToday(totalRevenue);

    const pendingOrders = orders.filter(order => order.status === "pending");
    setPendingOrdersCount(pendingOrders.length);

    const totalServed = orders.filter(order => order.status === "completed").length;
    setTotalOrdersServed(totalServed);
  }, [orders]);

  const stats = [
    {
      title: "Orders Today",
      value: completedTodayCount,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
      glowColor: "shadow-blue-500/50",
      bgPattern: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      labelColor: "text-blue-700 dark:text-blue-300"
    },
    {
      title: "Revenue Today",
      value: `Rs ${revenueToday.toLocaleString()}`,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-[#E5BA41] via-yellow-500 to-amber-600",
      glowColor: "shadow-[#E5BA41]/50",
      bgPattern: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-[#E5BA41]",
      labelColor: "text-amber-700 dark:text-amber-300"
    },
    {
      title: "Total Served",
      value: totalOrdersServed,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-green-500 via-emerald-600 to-teal-600",
      glowColor: "shadow-green-500/50",
      bgPattern: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      labelColor: "text-green-700 dark:text-green-300"
    },
    {
      title: "Pending Orders",
      value: pendingOrdersCount,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-orange-500 via-red-500 to-pink-600",
      glowColor: "shadow-orange-500/50",
      bgPattern: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
      labelColor: "text-orange-700 dark:text-orange-300"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 overflow-hidden">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`group relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl ${stat.glowColor} hover:scale-105 transition-all duration-500 overflow-hidden`}
        >
          {/* Animated gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur-2xl"></div>

          {/* Top border gradient */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}></div>

          <div className="relative p-6">
            {/* Header with icon */}
            <div className="flex items-center justify-between mb-6">
              {/* Icon container with gradient */}
              <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center p-3">
                  <div className={stat.iconColor}>
                    {stat.icon}
                  </div>
                </div>
              </div>

              {/* Animated pulse indicator */}
              <div className="relative">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stat.gradient} animate-pulse`}></div>
                <div className={`absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r ${stat.gradient} animate-ping`}></div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {stat.title}
            </h3>

            {/* Value with counter effect */}
            <div className="flex items-baseline justify-between">
              <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {stat.value}
              </p>

              {/* Arrow indicator */}
              <div className={`${stat.iconColor} group-hover:translate-x-1 transition-transform duration-300`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Decorative bottom bar */}
            <div className="mt-6 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 ease-out group-hover:w-full`}
                  style={{ width: '70%' }}
                ></div>
              </div>
              <span className={`text-xs font-semibold ${stat.labelColor}`}>
                {index === 1 ? 'NPR' : 'Count'}
              </span>
            </div>
          </div>

          {/* Bottom gradient accent */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;