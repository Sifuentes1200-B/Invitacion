import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_PATH = '/NoQuiseHacerUnLoginEnFormaSiEncontrasteEstoTeMerecesPoderEstarAqui';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ========= RUTA PRIVADA ADMIN ========= */
app.get(ADMIN_PATH, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

/* ========= CONSULTAR INVITADO POR CÓDIGO ========= */
app.get('/api/guest/:code', async (req, res) => {
  let conn;

  try {
    const code = req.params.code.trim().toUpperCase();
    conn = await pool.getConnection();

    const rows = await conn.query(
      `
      SELECT 
        titular,
        confirmado,
        numero_pases,
        mensaje
      FROM invitados
      WHERE codigo = ?
      LIMIT 1
      `,
      [code]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Código no válido. Verifica tu número de invitación.'
      });
    }

    const guest = rows[0];

    return res.json({
      ok: true,
      data: {
        titular: guest.titular,
        confirmado: guest.confirmado,
        numero_pases: guest.numero_pases,
        mensaje: guest.mensaje
      }
    });
  } catch (error) {
    console.error('Error al consultar invitado:', error);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrió un error al consultar la invitación.'
    });
  } finally {
    if (conn) conn.release();
  }
});

/* ========= CONFIRMAR ASISTENCIA ========= */
app.post('/api/confirm/:code', async (req, res) => {
  let conn;

  try {
    const code = req.params.code.trim().toUpperCase();
    const { asistencia } = req.body;

    if (typeof asistencia !== 'string') {
      return res.status(400).json({
        ok: false,
        message: 'Dato de asistencia no válido.'
      });
    }

    const confirmado = asistencia === 'si' ? 1 : 0;

    conn = await pool.getConnection();

    const result = await conn.query(
      `
      UPDATE invitados
      SET confirmado = ?
      WHERE codigo = ?
      `,
      [confirmado, code]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Código no válido.'
      });
    }

    return res.json({
      ok: true,
      message: 'Confirmación guardada correctamente.'
    });
  } catch (error) {
    console.error('Error al guardar confirmación:', error);

    return res.status(500).json({
      ok: false,
      message: 'No fue posible guardar la confirmación.'
    });
  } finally {
    if (conn) conn.release();
  }
});

/* ========= ADMIN: LISTAR INVITADOS ========= */
app.get('/api/admin/guests', async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();

    const rows = await conn.query(
      `
      SELECT
        id,
        codigo,
        titular,
        numero_pases,
        mensaje,
        confirmado
      FROM invitados
      ORDER BY id DESC
      `
    );

    return res.json({
      ok: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al listar invitados:', error);

    return res.status(500).json({
      ok: false,
      message: 'No fue posible obtener los invitados.'
    });
  } finally {
    if (conn) conn.release();
  }
});

/* ========= ADMIN: CREAR INVITADO ========= */
app.post('/api/admin/guests', async (req, res) => {
  let conn;

  try {
    const { codigo, titular, numero_pases, mensaje } = req.body;

    if (!codigo || !titular || !numero_pases) {
      return res.status(400).json({
        ok: false,
        message: 'Código, titular y número de pases son obligatorios.'
      });
    }

    conn = await pool.getConnection();

    const existing = await conn.query(
      `
      SELECT id
      FROM invitados
      WHERE codigo = ?
      LIMIT 1
      `,
      [String(codigo).trim().toUpperCase()]
    );

    if (existing.length) {
      return res.status(409).json({
        ok: false,
        message: 'Ese código ya existe.'
      });
    }

    await conn.query(
      `
      INSERT INTO invitados (
        codigo,
        titular,
        numero_pases,
        mensaje,
        confirmado
      ) VALUES (?, ?, ?, ?, 0)
      `,
      [
        String(codigo).trim().toUpperCase(),
        String(titular).trim(),
        Number(numero_pases),
        mensaje ? String(mensaje).trim() : null
      ]
    );

    return res.json({
      ok: true,
      message: 'Invitado registrado correctamente.'
    });
  } catch (error) {
    console.error('Error al crear invitado:', error);

    return res.status(500).json({
      ok: false,
      message: 'No fue posible registrar al invitado.'
    });
  } finally {
    if (conn) conn.release();
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});