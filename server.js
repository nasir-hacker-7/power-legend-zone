const express = require('express');
const path = require('path');
const http = require('http');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

// ─── PROXY ROUTE ───
// Frontend /proxy?url=... se request karega
// Server backend API se data fetch karega (HTTP/HTTPS dono)
app.get('/proxy', (req, res) => {
  const targetUrl = req.query.url;
  const token = req.query.token || '';

  if (!targetUrl) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  const isHttps = targetUrl.startsWith('https');
  const lib = isHttps ? https : http;

  const options = {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json',
      'User-Agent': 'PowerOTPWeb/1.0'
    }
  };

  lib.get(targetUrl, options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      res.status(apiRes.statusCode).send(data);
    });
  }).on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy fetch failed', details: err.message });
  });
});

// ─── STATIC FILES ───
app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Power OTP Web running on port ${PORT}`);
});
