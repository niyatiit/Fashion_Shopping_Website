import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axiosInstance.get("/orders/admin-analytics");
        setData(res.data);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const summary = data?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    avgOrderValue: 0,
  };

  const monthlyData = data?.monthlyData || [];
  const topProducts = data?.topProducts || [];
  const statusCounts = data?.statusCounts || {};
  const recentOrders = data?.recentOrders || [];

  // Find max revenue for chart scaling
  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue), 1000);
  const maxUnitsSold = Math.max(...topProducts.map((p) => p.unitsSold), 1);

  // SVG Chart Dimensions
  const chartWidth = 650;
  const chartHeight = 220;
  const paddingX = 45;
  const paddingBottom = 40;
  const paddingTop = 20;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingBottom - paddingTop;

  // Generate points for line/area chart
  const points = monthlyData.map((d, index) => {
    const x =
      monthlyData.length > 1
        ? paddingX + (index / (monthlyData.length - 1)) * plotWidth
        : chartWidth / 2;
    const y = paddingTop + plotHeight - (d.revenue / maxRevenue) * plotHeight;
    return { x, y, ...d };
  });

  const linePath = points.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`,
    ""
  );

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${
          paddingTop + plotHeight
        } L ${points[0].x} ${paddingTop + plotHeight} Z`
      : "";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-ink">Dashboard & Analytics</h1>
            <p className="text-xs text-muted mt-1">
              Store revenue, best-selling products & order analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/products"
              className="border border-sand bg-white text-ink px-4 py-2 text-xs hover:border-ink transition-colors shadow-xs"
            >
              Manage Products
            </Link>
            <Link
              to="/admin/orders"
              className="bg-ink text-ivory px-4 py-2 text-xs hover:bg-crimson transition-colors shadow-xs"
            >
              View All Orders
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-muted text-sm border border-sand">
            <div className="inline-block w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mb-3"></div>
            <p>Loading analytics & charts...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-sand bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-muted text-xs mb-2">
                  <span>Total Revenue</span>
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-medium">
                    Verified
                  </span>
                </div>
                <p className="font-display text-2xl sm:text-3xl text-ink font-semibold">
                  ₹{summary.totalRevenue.toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-muted mt-1.5">
                  Avg. Order: <strong className="text-ink">₹{summary.avgOrderValue}</strong>
                </p>
              </div>

              <div className="border border-sand bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-muted text-xs mb-2">
                  <span>Total Orders</span>
                  <span className="text-ink bg-sand/60 px-1.5 py-0.5 rounded text-[11px] font-medium">
                    All-time
                  </span>
                </div>
                <p className="font-display text-2xl sm:text-3xl text-ink font-semibold">
                  {summary.totalOrders}
                </p>
                <p className="text-[11px] text-muted mt-1.5">
                  <strong className="text-emerald-700">{statusCounts.Delivered || 0}</strong> delivered ·{" "}
                  <strong className="text-amber-700">{statusCounts.Processing || 0}</strong> processing
                </p>
              </div>

              <div className="border border-sand bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-muted text-xs mb-2">
                  <span>Catalog Products</span>
                  <span className="text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] font-medium">
                    5/page
                  </span>
                </div>
                <p className="font-display text-2xl sm:text-3xl text-ink font-semibold">
                  {summary.totalProducts}
                </p>
                <p className="text-[11px] text-muted mt-1.5">
                  Available in store catalog
                </p>
              </div>

              <div className="border border-sand bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-muted text-xs mb-2">
                  <span>Active Customers</span>
                  <span className="text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded text-[11px] font-medium">
                    Users
                  </span>
                </div>
                <p className="font-display text-2xl sm:text-3xl text-ink font-semibold">
                  {summary.totalUsers}
                </p>
                <p className="text-[11px] text-muted mt-1.5">
                  Registered shopper accounts
                </p>
              </div>
            </div>

            {/* Main Visual Charts Section */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 1. Monthly Revenue Trend Chart */}
              <div className="border border-sand bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-display text-lg text-ink font-semibold">
                        Revenue Trajectory
                      </h2>
                      <p className="text-xs text-muted">Monthly sales performance trend</p>
                    </div>
                    {hoveredPoint && (
                      <div className="text-right">
                        <span className="text-xs font-semibold text-crimson">
                          ₹{hoveredPoint.revenue} ({hoveredPoint.orders} orders)
                        </span>
                        <p className="text-[10px] text-muted">{hoveredPoint.month}</p>
                      </div>
                    )}
                  </div>

                  {/* SVG Line & Area Chart */}
                  <div className="w-full overflow-x-auto">
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="w-full h-48 select-none"
                    >
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8C1D18" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#8C1D18" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid horizontal lines */}
                      {[0.25, 0.5, 0.75, 1].map((frac) => {
                        const y = paddingTop + plotHeight * (1 - frac);
                        return (
                          <g key={frac}>
                            <line
                              x1={paddingX}
                              y1={y}
                              x2={chartWidth - paddingX}
                              y2={y}
                              stroke="#E7E2D9"
                              strokeDasharray="3 3"
                            />
                            <text
                              x={paddingX - 6}
                              y={y + 3}
                              fontSize="10"
                              fill="#9CA3AF"
                              textAnchor="end"
                            >
                              ₹{Math.round(maxRevenue * frac)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Area Fill */}
                      {areaPath && (
                        <path d={areaPath} fill="url(#revGrad)" />
                      )}

                      {/* Line Stroke */}
                      {linePath && (
                        <path
                          d={linePath}
                          fill="none"
                          stroke="#8C1D18"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Data Points and Column Bars */}
                      {points.map((pt, i) => (
                        <g
                          key={i}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        >
                          {/* Invisible hover target bar */}
                          <rect
                            x={pt.x - 20}
                            y={paddingTop}
                            width={40}
                            height={plotHeight}
                            fill="transparent"
                          />

                          {/* Data circle */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={hoveredPoint?.month === pt.month ? 6 : 4}
                            fill={hoveredPoint?.month === pt.month ? "#8C1D18" : "#1C1917"}
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            className="transition-all"
                          />

                          {/* Month Label */}
                          <text
                            x={pt.x}
                            y={chartHeight - 12}
                            fontSize="11"
                            fill="#6B7280"
                            textAnchor="middle"
                            fontWeight={hoveredPoint?.month === pt.month ? "600" : "400"}
                          >
                            {pt.month}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-sand/70 mt-2">
                  <span>● Tap/Hover dots to view monthly breakdowns</span>
                  <span>Currency: INR (₹)</span>
                </div>
              </div>

              {/* 2. Most Purchased Products (Best Sellers Chart) */}
              <div className="border border-sand bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-display text-lg text-ink font-semibold">
                        Most Purchased Products
                      </h2>
                      <p className="text-xs text-muted">
                        Ranked by customer demand & units sold
                      </p>
                    </div>
                    <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                      Best Sellers
                    </span>
                  </div>

                  {topProducts.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted border border-dashed border-sand">
                      No product purchase data recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {topProducts.map((prod, idx) => {
                        const percent = Math.round((prod.unitsSold / maxUnitsSold) * 100);
                        const medals = ["🥇", "🥈", "🥉"];

                        return (
                          <div key={prod.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="font-mono text-xs w-5 text-center text-muted font-bold">
                                  {medals[idx] || `#${idx + 1}`}
                                </span>
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-7 h-8 object-cover rounded-xs bg-sand shrink-0"
                                />
                                <span className="font-medium text-ink truncate">
                                  {prod.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 ml-2">
                                <span className="font-semibold text-ink">
                                  {prod.unitsSold} sold
                                </span>
                                <span className="text-muted text-[11px]">
                                  (₹{prod.revenue})
                                </span>
                              </div>
                            </div>

                            {/* Progress bar representing units sold relative to #1 seller */}
                            <div className="w-full bg-sand/40 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-ink h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${percent}%`,
                                  backgroundColor: idx === 0 ? "#8C1D18" : "#1C1917",
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-sand/70 mt-4 flex items-center justify-between text-xs text-muted">
                  <span>Based on all processed orders</span>
                  <Link
                    to="/admin/products"
                    className="text-crimson font-medium hover:underline"
                  >
                    Manage Inventory →
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Status Breakdown & Recent Transactions */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Order Status Distribution */}
              <div className="border border-sand bg-white p-6 shadow-xs space-y-4">
                <h3 className="font-display text-base text-ink font-semibold">
                  Order Status Overview
                </h3>

                <div className="space-y-2.5">
                  {[
                    { label: "Processing", count: statusCounts.Processing || 0, color: "bg-amber-400" },
                    { label: "Shipped", count: statusCounts.Shipped || 0, color: "bg-blue-400" },
                    { label: "Delivered", count: statusCounts.Delivered || 0, color: "bg-emerald-500" },
                    { label: "Cancelled", count: statusCounts.Cancelled || 0, color: "bg-stone-300" },
                  ].map((item) => {
                    const pct =
                      summary.totalOrders > 0
                        ? Math.round((item.count / summary.totalOrders) * 100)
                        : 0;

                    return (
                      <div key={item.label} className="text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="text-ink font-medium">{item.label}</span>
                          <span className="text-muted">
                            {item.count} orders ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-sand/40 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 text-[11px] text-muted">
                  Keep fulfillment on track by updating order states promptly.
                </div>
              </div>

              {/* Recent Transactions Quick Table */}
              <div className="lg:col-span-2 border border-sand bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base text-ink font-semibold">
                    Recent Customer Orders
                  </h3>
                  <Link
                    to="/admin/orders"
                    className="text-xs text-crimson hover:underline font-medium"
                  >
                    View All Orders →
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <p className="text-xs text-muted py-6 text-center">No orders recorded yet.</p>
                ) : (
                  <div className="divide-y divide-sand text-xs">
                    {recentOrders.map((order) => {
                      const firstItem = order.orderItems?.[0];
                      return (
                        <div
                          key={order._id}
                          className="py-2.5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={
                                firstItem?.image ||
                                firstItem?.product?.images?.[0]?.url ||
                                "https://placehold.co/80x100?text=Product"
                              }
                              alt=""
                              className="w-8 h-9 object-cover rounded-xs bg-sand shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-ink truncate">
                                {firstItem?.name || firstItem?.product?.name || "Order Item"}
                              </p>
                              <p className="text-[11px] text-muted truncate">
                                #{order._id.slice(-8).toUpperCase()} · {order.user?.name || "Shopper"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-semibold text-ink">₹{order.totalPrice}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                                order.orderStatus === "Delivered"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : order.orderStatus === "Cancelled"
                                  ? "bg-stone-100 text-stone-600 border-stone-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;