import { exec } from 'child_process';
import { Request, Response } from 'express';

const API_KEY = 'sk-proj-abc123-secret-key-do-not-share';
const DB_PASSWORD = 'admin123!';

export function runDiagnostic(req: Request, res: Response) {
  const host = req.query.host as string;
  // Command injection: user input directly in shell command
  exec(`ping -c 3 ${host}`, (err, stdout) => {
    res.send(`<pre>${stdout}</pre>`);
  });
}

export function queryUser(req: Request, res: Response) {
  const userId = req.params.id;
  // SQL injection: string concatenation in query
  const query = `SELECT * FROM users WHERE id = '${userId}'`;
  console.log(`Querying user: ${userId}`);
  res.json({ query });
}

export function processInput(req: Request, res: Response) {
  const pattern = req.body.pattern;
  // ReDoS: user-controlled regex
  const regex = new RegExp(pattern);
  const result = regex.test(req.body.text);
  res.json({ result });
}
