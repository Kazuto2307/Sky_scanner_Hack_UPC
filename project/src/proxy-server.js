// server.js (Node/Express)
import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/api/run-recs', (req, res) => {
  const arg1 = req.query.arg1;
  if (!arg1) {
    return res.status(400).json({ error: 'Missing arg1' });
  }

  // Lanza el child process
  const py = spawn('python3', [
    './python_scripts/prompt_2.py',
    arg1
  ]);

  let stdout = '';
  let stderr = '';

  py.stdout.on('data', chunk => { stdout += chunk; });
  py.stderr.on('data', chunk => { stderr += chunk; });

  py.on('close', code => {
    if (code !== 0) {
      console.error('Python failed:', stderr);
      return res.status(500).json({ error: stderr.trim() });
    }
    try {
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (e) {
      console.error('Invalid JSON from Python:', stdout);
      res.status(500).json({ error: 'Invalid JSON from Python' });
    }
  });
});

app.listen(3001, () => {
  console.log('Listening on http://localhost:3001');
});
