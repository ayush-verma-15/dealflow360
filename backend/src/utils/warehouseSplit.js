// NISHANK - Warehouse Split Optimizer (Core Logic)
/**
 * Optimizes order fulfillment across multiple warehouses
 * 
 * Algorithm:
 * 1. Sort warehouses by shipping cost (cheapest first)
 * 2. For each item, fulfill from warehouses with available stock
 * 3. Minimize number of shipments
 * 4. Create backorders for unavailable items
 */

function optimizeWarehouseSplit(orderItems, warehouses) {
  // Sort warehouses by shipping cost weight (cheapest first)
  const sortedWarehouses = [...warehouses].sort(
    (a, b) => a.shippingCostWeight - b.shippingCostWeight
  );
  
  let split = [];
  let backorders = [];
  let totalShipments = 0;
  let totalShippingCost = 0;
  let totalFulfilled = 0;
  let totalOrdered = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Process each item
  orderItems.forEach(item => {
    let remainingQty = item.quantity;
    const productId = item.product._id.toString();
    
    // Try to fulfill from warehouses with stock
    sortedWarehouses.forEach(warehouse => {
      if (remainingQty <= 0) return;
      
      // Check stock for this product
      const stockItem = warehouse.stock.find(
        s => s.productId && s.productId._id && s.productId._id.toString() === productId
      );
      
      // Handle case where stockItem might not have productId._id populated
      let availableStock = 0;
      if (stockItem) {
        availableStock = stockItem.quantity || 0;
      } else {
        // Check if stockItem exists with productId as ObjectId
        const stockItemById = warehouse.stock.find(
          s => s.productId && s.productId.toString() === productId
        );
        if (stockItemById) {
          availableStock = stockItemById.quantity || 0;
        }
      }
      
      if (availableStock > 0) {
        const fulfillQty = Math.min(remainingQty, availableStock);
        
        // Add to split
        const existingSplit = split.find(
          s => s.warehouse.toString() === warehouse._id.toString()
        );
        
        if (existingSplit) {
          existingSplit.items.push({
            productId: productId,
            productName: item.product.name,
            quantity: fulfillQty,
            status: 'fulfilled'
          });
        } else {
          split.push({
            warehouse: warehouse._id,
            warehouseName: warehouse.name,
            city: warehouse.location.city,
            items: [{
              productId: productId,
              productName: item.product.name,
              quantity: fulfillQty,
              status: 'fulfilled'
            }],
            shipmentCost: warehouse.shippingCostWeight * fulfillQty,
            estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
          });
        }
        
        // Update stock (in memory)
        if (stockItem) {
          stockItem.quantity -= fulfillQty;
          stockItem.lastUpdated = new Date();
        }
        
        remainingQty -= fulfillQty;
        totalShipments++;
        totalShippingCost += warehouse.shippingCostWeight * fulfillQty;
        totalFulfilled += fulfillQty;
      }
    });
    
    // Handle backorders
    if (remainingQty > 0) {
      backorders.push({
        productId: productId,
        productName: item.product.name,
        quantity: remainingQty,
        estimatedRestock: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
      });
    }
  });
  
  // Calculate total cost and shipments
  const uniqueShipments = split.length;
  const totalItemsFulfilled = split.reduce((sum, s) => {
    return sum + s.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);
  
  return {
    split,
    backorders,
    totalShipments: uniqueShipments,
    totalItemsFulfilled,
    totalShippingCost: Math.round(totalShippingCost * 100) / 100,
    totalOrdered,
    fulfillmentRate: totalOrdered > 0 ? Math.round((totalItemsFulfilled / totalOrdered) * 100) : 0,
    estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    summary: {
      warehousesUsed: uniqueShipments,
      itemsFulfilled: totalItemsFulfilled,
      itemsBackordered: backorders.reduce((sum, b) => sum + b.quantity, 0),
      totalCost: Math.round(totalShippingCost * 100) / 100
    }
  };
}

module.exports = optimizeWarehouseSplit;