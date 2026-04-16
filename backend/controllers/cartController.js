const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.json({ success: true, cart: cart || { items: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < parsedQuantity) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const idx = cart.items.findIndex((item) => item.product.toString() === productId);
    if (idx > -1) {
      const nextQuantity = cart.items[idx].quantity + parsedQuantity;
      if (nextQuantity > product.stock) {
        return res.status(400).json({ success: false, message: 'Requested quantity exceeds stock' });
      }
      cart.items[idx].quantity = nextQuantity;
    } else {
      cart.items.push({ product: productId, quantity: parsedQuantity });
    }

    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/cart/:itemId
exports.updateCartItem = async (req, res) => {
  try {
    const nextQuantity = Number(req.body.quantity);
    if (!Number.isInteger(nextQuantity)) {
      return res.status(400).json({ success: false, message: 'Quantity must be an integer' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (nextQuantity > 0) {
      const product = await Product.findById(item.product).select('stock');
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      if (nextQuantity > product.stock) {
        return res.status(400).json({ success: false, message: 'Requested quantity exceeds stock' });
      }
    }

    item.quantity = nextQuantity;
    if (item.quantity <= 0) cart.items.pull(req.params.itemId);

    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/cart/:itemId
exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
