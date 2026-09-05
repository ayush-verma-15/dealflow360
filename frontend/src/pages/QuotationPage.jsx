// frontend/src/pages/QuotationPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Divider,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add, 
  Remove, 
  Delete, 
  TrendingUp,
  Check,
  Close,
  ShoppingCart,
  LocalOffer,
  Warning,
  Info
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import UpsellPanel from '../components/quotation/UpsellPanel';
import WarehouseSplit from '../components/warehouse/WarehouseSplit';
import ApprovalStatus from '../components/quotation/ApprovalStatus';

const QuotationPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [riskScore, setRiskScore] = useState(null);
  const [showUpsell, setShowUpsell] = useState(true);
  const [showWarehouseSplit, setShowWarehouseSplit] = useState(false);
  const [quotationStatus, setQuotationStatus] = useState('draft');
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [quoteId, setQuoteId] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data.data);
    } catch (error) {
      // Set demo customers
      setCustomers([
        { _id: '1', name: 'Acme Corp', tier: 'Gold' },
        { _id: '2', name: 'Beta Industries', tier: 'Silver' },
        { _id: '3', name: 'Gamma Solutions', tier: 'Bronze' }
      ]);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, discountPercent: 0 }]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.product._id === productId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const updateDiscount = (productId, discount) => {
    setCart(cart.map(item => {
      if (item.product._id === productId) {
        return { ...item, discountPercent: Math.min(100, Math.max(0, discount)) };
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    
    cart.forEach(item => {
      const price = item.product.basePrice;
      const quantity = item.quantity;
      const discount = item.discountPercent;
      const lineTotal = price * quantity;
      const lineDiscount = lineTotal * (discount / 100);
      
      subtotal += lineTotal;
      totalDiscount += lineDiscount;
    });
    
    return {
      subtotal,
      totalDiscount,
      total: subtotal - totalDiscount,
      margin: cart.length > 0 ? 30 - (totalDiscount / subtotal * 100) : 0
    };
  };

  const totals = calculateTotals();

  const createQuotation = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }
    
    if (cart.length === 0) {
      toast.error('Please add items to quotation');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/quotes', {
        customer: selectedCustomer,
        lines: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          discountPercent: item.discountPercent,
          lineType: item.product.category === 'Subscription' ? 'subscription' : 'one-time'
        }))
      });

      const data = response.data.data;
      setQuoteId(data.quotation._id);
      setQuotationStatus(data.quotation.approvalStatus);
      setApprovalStatus(data.quotation.approvalChain);
      setRiskScore(data.quotation.blendedRiskScore);
      
      toast.success('Quotation created successfully!');
      
      // Show warehouse split if approved
      if (data.quotation.approvalStatus === 'approved') {
        setShowWarehouseSplit(true);
      }
    } catch (error) {
      toast.error('Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      
      <Box sx={{ flex: 1, p: 3 }}>
        <Grid container spacing={3}>
          {/* Left Column - Products & Cart */}
          <Grid item xs={12} md={8}>
            {/* Customer Selection */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Customer</InputLabel>
                    <Select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      label="Select Customer"
                    >
                      {customers.map(customer => (
                        <MenuItem key={customer._id} value={customer._id}>
                          {customer.name} - {customer.tier}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  {selectedCustomer && (
                    <Chip 
                      label={`Tier: ${customers.find(c => c._id === selectedCustomer)?.tier || 'N/A'}`}
                      color="primary"
                      size="small"
                    />
                  )}
                </Grid>
              </Grid>
            </Paper>

            {/* Products Grid */}
            <Typography variant="h6" gutterBottom>
              Products
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {products.map(product => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      {product.isPromoted && (
                        <Chip 
                          label="🔥 Promoted"
                          size="small"
                          color="error"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                        />
                      )}
                      <Typography variant="h6" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {product.category}
                      </Typography>
                      <Typography variant="h5" color="primary" gutterBottom>
                        ₹{product.basePrice.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Stock: {product.stock}
                      </Typography>
                      <Box mt={2}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => addToCart(product)}
                          fullWidth
                        >
                          Add to Cart
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Right Column - Cart & Actions */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, position: 'sticky', top: 80 }}>
              <Typography variant="h6" gutterBottom>
                <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
                Cart ({cart.length} items)
              </Typography>
              <Divider sx={{ my: 1 }} />

              {/* Cart Items */}
              {cart.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="textSecondary">
                    No items in cart
                  </Typography>
                </Box>
              ) : (
                <>
                  {cart.map((item, index) => (
                    <Box key={index} sx={{ mb: 2, p: 1, bgcolor: '#f8fafc', borderRadius: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {item.product.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ₹{item.product.basePrice.toLocaleString()} × {item.quantity}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => removeFromCart(item.product._id)}>
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <IconButton 
                          size="small" 
                          onClick={() => updateQuantity(item.product._id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography variant="body2">{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => updateQuantity(item.product._id, 1)}>
                          <Add fontSize="small" />
                        </IconButton>
                        
                        <TextField
                          size="small"
                          type="number"
                          value={item.discountPercent}
                          onChange={(e) => updateDiscount(item.product._id, Number(e.target.value))}
                          InputProps={{
                            endAdornment: <Typography variant="caption">%</Typography>
                          }}
                          sx={{ width: 80, ml: 'auto' }}
                        />
                      </Box>
                    </Box>
                  ))}
                </>
              )}

              <Divider sx={{ my: 1 }} />

              {/* Totals */}
              <Box>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">₹{totals.subtotal.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2" color="error">Discount</Typography>
                  <Typography variant="body2" color="error">-₹{totals.totalDiscount.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={1} borderTop="1px solid #e0e0e0">
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6">₹{totals.total.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="caption" color="textSecondary">Margin Impact</Typography>
                  <Typography variant="caption" color={totals.margin > 20 ? 'success' : 'error'}>
                    {totals.margin.toFixed(1)}% margin
                  </Typography>
                </Box>
              </Box>

              {/* Upsell Panel */}
              {showUpsell && cart.length > 0 && (
                <UpsellPanel cart={cart} onAdd={addToCart} />
              )}

              {/* Risk Score Display */}
              {riskScore && (
                <Alert severity={riskScore.needsManagerApproval ? 'warning' : 'success'} sx={{ mt: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      Risk Score: {riskScore.score}
                    </Typography>
                    <Chip 
                      label={riskScore.needsManagerApproval ? 'Approval Needed' : 'Auto-Approved'}
                      size="small"
                      color={riskScore.needsManagerApproval ? 'warning' : 'success'}
                    />
                  </Box>
                </Alert>
              )}

              {/* Action Buttons */}
              <Box mt={2}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={cart.length === 0 || loading}
                  onClick={createQuotation}
                  sx={{ py: 1.5 }}
                >
                  {loading ? 'Creating...' : 'Create Quotation'}
                </Button>
                {quotationStatus !== 'draft' && (
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={() => window.location.href = `/quotation/${quoteId}`}
                  >
                    View Quotation
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Warehouse Split Dialog */}
        {showWarehouseSplit && (
          <WarehouseSplit 
            open={showWarehouseSplit}
            onClose={() => setShowWarehouseSplit(false)}
            quoteId={quoteId}
          />
        )}
      </Box>
    </Box>
  );
};

export default QuotationPage;