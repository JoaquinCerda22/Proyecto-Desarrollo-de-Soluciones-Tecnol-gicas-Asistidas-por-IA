import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  initDb,
  getProducts,
  getStats,
  checkAdminPin,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getSupplies,
  updateSupply,
  purchaseAllLowSupplies,
  getConfig,
  updateConfig
} from './server/db.js';

const app = express();
const PORT = 3000;

// Enable JSON middleware for POST/PUT requests
app.use(express.json());

// ==========================================
// API Endpoints
// ==========================================

// Get standard products
app.get('/api/products', async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin stats dynamically calculated
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin login by PIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    const isValid = await checkAdminPin(pin);

    if (isValid) {
      res.json({ success: true, token: 'admin-kiosk-session-token' });
    } else {
      res.status(401).json({ success: false, error: 'Código de PIN incorrecto' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (Admin view)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await getOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order for tracking
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Post a new order
app.post('/api/orders', async (req, res) => {
  try {
    const {
      clientName,
      clientPhone,
      deliveryDate
    } = req.body;

    if (!clientName || !clientPhone || !deliveryDate) {
      return res.status(400).json({ error: 'Datos de cliente y entrega obligatorios' });
    }

    const newOrder = await createOrder(req.body);
    res.status(201).json(newOrder);
  } catch (error: any) {
    console.error("Error inserting order: ", error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const success = await updateOrderStatus(id, status);

    if (!success) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get supplies list
app.get('/api/supplies', async (req, res) => {
  try {
    const supplies = await getSupplies();
    res.json(supplies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update specific supply stock (and trigger status check)
app.put('/api/supplies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateSupply(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'Suministro no encontrado' });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger purchase of all low material supplies at once
app.post('/api/supplies/purchase-all', async (req, res) => {
  try {
    const updated = await purchaseAllLowSupplies();
    res.json({ success: true, supplies: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get system config keys
app.get('/api/config', async (req, res) => {
  try {
    const conf = await getConfig();
    res.json(conf);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save config keys
app.post('/api/config', async (req, res) => {
  try {
    const config = req.body;
    await updateConfig(config);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// Vite Middleware Configuration & Server Boot
// ==========================================

async function startServer() {
  // Initialize database
  try {
    await initDb();
    console.log("SQLite database initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize SQLite database:", err);
  }

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dulce Descontrol Full-Stack container running in port ${PORT}`);
  });
}

startServer();
