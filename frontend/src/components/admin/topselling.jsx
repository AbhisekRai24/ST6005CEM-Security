import React from 'react';

const TopSellingItems = () => {
  const items = [
    { name: 'RE Exhaust', qty: 45, revenue: 'Rs675.00' },
    { name: 'KTM Tailtidy', qty: 30, revenue: 'Rs900.00' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow transition-colors">
      <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
        Top Selling Items Today
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Best performing menu items by quantity sold
      </p>

      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#0B2146' }}>
              <th className="px-4 py-2" style={{ color: '#E5BA41' }}>Item</th>
              <th className="px-4 py-2" style={{ color: '#E5BA41' }}>Qty</th>
              <th className="px-4 py-2" style={{ color: '#E5BA41' }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={idx}
                className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.name}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.qty}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopSellingItems;
