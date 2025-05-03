import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/api/run-recs', (req, res) => {
  const arg1 = req.query.arg1;
  if (!arg1) return res.status(400).json({ error: 'Missing arg1' });

  // 1) Lanzamos el child process
  const py = spawn('python3', ['./python_scripts/prompt_2.py', arg1]);

  // 1.a) Saber que se ha invocado al intérprete
  py.on('spawn', () => {
    console.log(`✅ Python launched (pid ${py.pid})`);
  });

  // 2) Capturamos fallo al lanzar
  py.on('error', (err) => {
    console.error('❌ Failed to start Python process:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Could not start Python process' });
    }
  });

  let stdout = '';
  let stderr = '';

  py.stdout.on('data', chunk => { stdout += chunk; });
  py.stderr.on('data', chunk => { stderr += chunk; });

  // 3) Cuando el proceso finaliza
  py.on('close', (code) => {
    console.log(`🐍 Python process exited with code ${code}`);
    if (code !== 0) {
      console.error('Python stderr:', stderr.trim());
      return res.status(500).json({ error: stderr.trim() });
    }
    try {
      const data = JSON.parse(stdout);
      console.log('📤 Parsed JSON from Python:', data);
      res.json(data);
    } catch (e) {
      console.error('❌ Invalid JSON from Python:', stdout);
      res.status(500).json({ error: 'Invalid JSON from Python' });
    }
  });
});

app.listen(3001, () => {
  console.log('Server listening on http://localhost:3001');
});
