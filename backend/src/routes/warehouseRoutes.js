// How it works:
// 1. Sort warehouses by shipping cost (cheapest first)
// 2. For each item, fulfill from warehouses with stock
// 3. Minimize number of shipments
// 4. Create backorders for unavailable items

function optimizeWarehouseSplit(orderItems, warehouses) {
  // Example: 100 Laptops, 50 Servers
  // Mumbai: 60 Laptops (shipping cost: 1.2)
  // Delhi: 40 Laptops, 30 Servers (shipping cost: 1.4)
  // Bangalore: 20 Servers (shipping cost: 1.6)
  
  return {
    split: [
      { warehouse: "Mumbai", items: [{ product: "Laptop", qty: 60 }] },
      { warehouse: "Delhi", items: [{ product: "Laptop", qty: 40 }, { product: "Server", qty: 30 }] }
    ],
    backorders: [{ product: "Server", qty: 20 }],
    totalShipments: 2,
    totalShippingCost: 2600
  };
}