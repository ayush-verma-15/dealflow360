
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
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Tooltip
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
  Info,
  Search,
  FilterList,
  Refresh,
  AttachMoney
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import UpsellPanel from '../components/quotation/UpsellPanel';
import WarehouseSplit from '../components/warehouse/WarehouseSplit';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);

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
      // Set demo products
      setProducts([
        { _id: '1', name: 'Laptop Pro', category: 'Hardware', basePrice: 50000, stock: 100, isPromoted: true },
        { _id: '2', name: 'Server Rack', category: 'Hardware', basePrice: 150000, stock: 50, isPromoted: false },
        { _id: '3', name: 'Setup Service', category: 'Service', basePrice: 25000, stock: 999, isPromoted: false },
        { _id: '4', name: 'Annual Maintenance', category: 'Subscription', basePrice: 12000, stock: 999, isPromoted: true },
        { _id: '5', name: 'Cloud Storage', category: 'Subscription', basePrice: 5000, stock: 999, isPromoted: false },
        { _id: '6', name: 'Data Migration', category: 'Service', basePrice: 35000, stock: 999, isPromoted: false },
      ]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/users/customers');
      setCustomers(response.data.data);
    } catch (error) {
      // Set demo customers
      setCustomers([
        { _id: '1', name: 'Acme Corp', tier: 'Gold', email: 'acme@example.com' },
        { _id: '2', name: 'Beta Industries', tier: 'Silver', email: 'beta@example.com' },
        { _id: '3', name: 'Gamma Solutions', tier: 'Bronze', email: 'gamma@example.com' },
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
    let totalTax = 0;

    cart.forEach(item => {
      const price = item.product.basePrice;
      const quantity = item.quantity;
      const discount = item.discountPercent;
      const taxRate = item.product.taxRate || 0;
      const lineTotal = price * quantity;
      const lineDiscount = lineTotal * (discount / 100);
      const lineTax = (lineTotal - lineDiscount) * (taxRate / 100);

      subtotal += lineTotal;
      totalDiscount += lineDiscount;
      totalTax += lineTax;
    });

    return {
      subtotal,
      totalDiscount,
      totalTax,
      total: subtotal - totalDiscount + totalTax,
      margin: cart.length > 0 ? 30 - (totalDiscount / subtotal * 100) : 0,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
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
      setQuoteId(data._id);
      setQuotationStatus(data.approvalStatus);
      setApprovalStatus(data.approvalChain);
      setRiskScore(data.blendedRiskScore);

      toast.success('Quotation created successfully! 🎉');

      // Show warehouse split if approved
      if (data.approvalStatus === 'approved') {
        setShowWarehouseSplit(true);
      }
    } catch (error) {
      toast.error('Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <Navbar />

      <Box sx={{ flex: 1, p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Quotation Builder
        </Typography>

        <Grid container spacing={3}>
          {/* Left Column - Products */}
          <Grid item xs={12} lg={7}>
            {/* Customer Selection */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
                  {selectedCustomer && (
                    <Box display="flex" gap={1}>
                      <Chip
                        label={`Tier: ${customers.find(c => c._id === selectedCustomer)?.tier || 'N/A'}`}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label="Max Discount: 15%"
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>

            {/* Product Search & Filter */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      <MenuItem value="Hardware">Hardware</MenuItem>
                      <MenuItem value="Software">Software</MenuItem>
                      <MenuItem value="Service">Service</MenuItem>
                      <MenuItem value="Subscription">Subscription</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Products Grid */}
            <Grid container spacing={2}>
              {filteredProducts.map(product => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
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
                      <Chip
                        label={product.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
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
                          disabled={product.stock === 0}
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

          {/* Right Column - Cart */}
          <Grid item xs={12} lg={5}>
            <Paper sx={{ p: 2, borderRadius: 2, position: 'sticky', top: 80 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                </Typography>
                {cart.length > 0 && (
                  <Button size="small" color="error" onClick={() => setCart([])}>
                    Clear All
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* Cart Items */}
              {cart.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <ShoppingCart sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    No items in cart
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Add products from the list
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
                    {cart.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 1.5,
                          p: 1.5,
                          bgcolor: '#f8fafc',
                          borderRadius: 1,
                          border: '1px solid #e2e8f0'
                        }}
                      >
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
                          <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => updateQuantity(item.product._id, 1)}>
                            <Add fontSize="small" />
                          </IconButton>

                          <TextField
                            size="small"
                            type="number"
                            value={item.discountPercent}
                            onChange={(e) => updateDiscount(item.product._id, Number(e.target.value))}
                            InputProps={{
                              endAdornment: <Typography variant="caption">%</Typography>,
                              sx: { width: 80 }
                            }}
                            sx={{ ml: 'auto' }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              <Divider sx={{ my: 2 }} />

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
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2">Tax</Typography>
                  <Typography variant="body2">₹{totals.totalTax.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={1} borderTop="2px solid #e0e0e0">
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary">
                    ₹{totals.total.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="caption" color="textSecondary">Margin Impact</Typography>
                  <Chip
                    label={`${totals.margin.toFixed(1)}% margin`}
                    size="small"
                    color={totals.margin > 20 ? 'success' : 'error'}
                  />
                </Box>
              </Box>

              {/* Risk Score Display */}
              {riskScore && (
                <Alert
                  severity={riskScore.needsManagerApproval ? 'warning' : 'success'}
                  sx={{ mt: 2 }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Risk Score: {riskScore.score}
                      </Typography>
                      <Typography variant="caption">
                        Max Violation: {riskScore.maxViolation}% | Total: {riskScore.totalViolation}%
                      </Typography>
                    </Box>
                    <Chip
                      label={riskScore.needsManagerApproval ? '⚠️ Approval Needed' : '✅ Auto-Approved'}
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
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  {loading ? 'Creating...' : 'Create Quotation'}
                </Button>

                {quotationStatus !== 'draft' && (
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={() => window.location.href = `/quotations/${quoteId}`}
                  >
                    View Quotation Details
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Warehouse Split Dialog */}
        <Dialog
          open={showWarehouseSplit}
          onClose={() => setShowWarehouseSplit(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Warehouse Split
            <IconButton
              onClick={() => setShowWarehouseSplit(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <WarehouseSplit quoteId={quoteId} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowWarehouseSplit(false)}>Close</Button>
            <Button variant="contained" onClick={() => setShowWarehouseSplit(false)}>
              Confirm Split
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default QuotationPage;