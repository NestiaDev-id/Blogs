import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.redirect('/api'))

// Root API
app.get('/api', (c) => c.json({ 
  message: "Welcome to Lentera Blog API",
  version: "1.0.0"
}))

// Error Handler
app.onError((err, c) => c.json({ status: "error", message: err.message }, 500));

// error 404 handler
app.notFound((c) => c.json({ status: "error", message: "Not Found" }, 404));

const port = 3000;
console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });