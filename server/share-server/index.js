const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://clawuser:openclaw_secure_2026@localhost:5432/openclaw',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// POST /api/share - Create a new collab session with initial graph data
// Accepts either { graphData } (new) or { graphId } (legacy)
app.post('/api/share', async (req, res) => {
  const { graphData, graphId, diagramName, permission, createdBy } = req.body;

  // Accept either graphData (new) or graphId (legacy test compat)
  const graphPayload = graphData || { nodes: [], relationships: [], style: {}, _graphId: graphId };

  if (!graphPayload) {
    return res.status(400).json({ error: 'graphData is required' });
  }

  const sessionId = uuidv4();
  const sessionUrl = `https://arrows-app-deeslab.netlify.app/#/collab/${sessionId}`;

  try {
    await pool.query(
      `INSERT INTO collab_sessions (id, diagram_name, graph_data, permission, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, diagramName || 'Untitled', JSON.stringify(graphPayload), permission || 'editor', createdBy || 'anonymous']
    );

    console.log('Session created:', sessionId);
    res.json({
      success: true,
      sessionId,
      shareId: sessionId,          // legacy compat
      sessionUrl,
      permission: permission || 'editor',
      graphId: graphId || null,    // legacy compat
    });
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/share/:id - Get session metadata + current graph_data
app.get('/api/share/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, diagram_name, graph_data, permission, created_by, created_at, updated_at, access_count FROM collab_sessions WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const row = result.rows[0];
    res.json({
      success: true,
      sessionId: row.id,
      shareId: row.id,                          // legacy compat
      diagramName: row.diagram_name,
      graphData: row.graph_data,
      graphId: row.graph_data?._graphId || null, // legacy compat
      permission: row.permission,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      accessCount: row.access_count,
    });
  } catch (err) {
    console.error('Error fetching session:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/share/:id/graph - Update graph_data (called by WS server after each update)
app.put('/api/share/:id/graph', async (req, res) => {
  const { graphData } = req.body;
  if (!graphData) {
    return res.status(400).json({ error: 'graphData is required' });
  }
  try {
    const result = await pool.query(
      'UPDATE collab_sessions SET graph_data = $1 WHERE id = $2 RETURNING id',
      [JSON.stringify(graphData), req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating graph:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/share/:id/validate - Validate and get permissions, increment access_count
app.post('/api/share/:id/validate', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE collab_sessions SET access_count = access_count + 1
       WHERE id = $1
       RETURNING id, diagram_name, permission, graph_data`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const row = result.rows[0];
    res.json({
      success: true,
      sessionId: row.id,
      shareId: row.id,                          // legacy compat
      diagramName: row.diagram_name,
      graphId: row.graph_data?._graphId || null, // legacy compat
      permission: row.permission,
      canEdit: ['editor', 'admin'].includes(row.permission),
      canAdmin: row.permission === 'admin'
    });
  } catch (err) {
    console.error('Error validating session:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/share/:id - Delete session
app.delete('/api/share/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM collab_sessions WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/shares - List sessions (admin)
app.get('/api/shares', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, diagram_name, permission, created_by, created_at, access_count FROM collab_sessions ORDER BY created_at DESC'
    );
    res.json({ success: true, sessions: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Error listing sessions:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS count FROM collab_sessions');
    res.json({
      status: 'ok',
      service: 'arrows-share-api',
      sessions: parseInt(result.rows[0].count),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Arrows Share API listening on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
