import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));

  // API proxy route to bypass CORS for third-party AI endpoints
  app.post('/api/ai-proxy', async (req, res) => {
    try {
      const { url, options } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Missing 'url' in request body." });
      }

      const fetchOptions: RequestInit = {
        method: options?.method || 'POST',
        headers: options?.headers || {},
      };

      if (options?.body) {
        fetchOptions.body = typeof options.body === 'object' ? JSON.stringify(options.body) : options.body;
      }

      console.log(`Proxying request to: ${url}`);
      const response = await fetch(url, fetchOptions);

      const contentType = response.headers.get('content-type') || '';
      const status = response.status;

      res.status(status);

      if (contentType.includes('application/json')) {
        const data = await response.json();
        res.json(data);
      } else {
        const text = await response.text();
        res.send(text);
      }
    } catch (err: any) {
      console.error('Proxy Error:', err);
      res.status(500).json({ error: err.message || 'Error occurred in proxy server' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
