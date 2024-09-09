const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'dnxtpro',
  password: 'locoplaya',
  database: 'diario',
  connectionLimit: 10,
});

app.get('/obtener-tareas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tareas');
    res.json({ content: rows });
  } catch (error) {
    console.error('Error al obtener tareas desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
app.get('/obtener-eventos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM calendario');
    console.log(rows)
    res.json({ content: rows });
  } catch (error) {
    console.error('Error al obtener eventos desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
app.get('/obtener-categoria', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT _id,color,title FROM categoria');
    console.log('tonto',rows)
    res.json({ content: rows });
  } catch (error) {
    console.error('Error al obtener categoria desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
app.delete('/borrar-evento/:_id', async (req, res) => {
  const _id = req.params._id;
  console.log(_id)

  try {
    await pool.query('DELETE FROM calendario WHERE _id = ?', [_id]);
    res.json({ message: 'Evento borrado correctamente de la base de datos.' });
  } catch (error) {
    console.error('Error al borrar el evento de la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
app.post('/guardar-evento',async(req,res)=>{
  const{description,end,start,todoId,_id}=req.body[req.body.length - 1];
  console.log(req.body[req.body.length - 1])
  try{
    await pool.query('INSERT INTO calendario (description,todoId,_id,end,start) VALUES (?,?,?,?,?)',[
      description,todoId,_id,end,start,
    ]);
    res.json({message:'Evento Guardado Correctamente'});
   } catch(error){
    console.error(error);
    res.status(500).json({error:'Error del servidor'})
  }
})
app.post('/guardar-categoria',async(req,res)=>{
  const{_id,color,title}=req.body[req.body.length - 1];
  console.log(req.body[req.body.length - 1])
  try{
    await pool.query('INSERT INTO categoria (_id,color,title) VALUES (?,?,?)',[
      _id,color,title,
    ]);
    res.json({message:'Categoria Guardada Correctamente'});
   } catch(error){
    console.error(error);
    res.status(500).json({error:'Error del servidor'})
  }
})
app.post('/guardar-tarea', async (req, res) => {  
  const { nombre, descripcion, nuevo_tiempo } = req.body;
  const fechaCreacion = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    await pool.query('INSERT INTO tareas (nombre, descripcion, nuevo_tiempo, fecha_creacion) VALUES (?, ?, ?, ?)', [
      nombre,
      descripcion,
      nuevo_tiempo,
      fechaCreacion,
    ]);
    res.json({ message: 'Tarea guardada correctamente en la base de datos.' });
  } catch (error) {
    console.error('Error al guardar la tarea en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Nueva ruta para manejar el borrado de tareas
app.delete('/borrar-tarea/:taskId', async (req, res) => {
  const taskId = req.params.taskId;

  try {
    await pool.query('DELETE FROM tareas WHERE id = ?', [taskId]);
    res.json({ message: 'Tarea borrada correctamente de la base de datos.' });
  } catch (error) {
    console.error('Error al borrar la tarea en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/obtener-nombres', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM nombres');
    res.json({ content: rows });
  } catch (error) {
    console.error('Error al obtener nombres desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Endpoint para agregar un nuevo nombre
app.post('/agregar-nombre', async (req, res) => {
  const nuevoNombre = req.body.nuevoNombre;
  try {
    await pool.query('INSERT INTO nombres (nombre) VALUES (?)', [nuevoNombre]);
    res.json({ message: 'Nombre agregado correctamente.' });
  } catch (error) {
    console.error('Error al agregar el nombre en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
app.post('/guardar-objetivo', async (req, res) => {
  const { nombre, descripcion, fecha, estado } = req.body; // Incluye `estado` aquí

  try {
    await pool.query('INSERT INTO objetivos (nombre, descripcion, fecha, estado) VALUES (?, ?, ?, ?)', [
      nombre,
      descripcion,
      fecha,
      estado,
    ]);
    res.json({ message: 'Objetivo guardado correctamente en la base de datos.' });
  } catch (error) {
    console.error('Error al guardar el objetivo en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
app.get('/obtener-objetivos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM objetivos');
    res.json({ content: rows });
  } catch (error) {
    console.error('Error al obtener objetivos desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/borrar-objetivo/:taskId', async (req, res) => {
  const taskId = req.params.taskId;

  try {
    await pool.query('DELETE FROM objetivos WHERE id = ?', [taskId]);
    res.json({ message: 'Objetivo borrado correctamente de la base de datos.' });
  } catch (error) {
    console.error('Error al borrar el objetivo en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



app.put('/cambiar-estado-objetivo/:id', async (req, res) => {
  const objetivoId = req.params.id;

  try {
    // Obtén el estado actual del objetivo
    const [currentStatusRows] = await pool.query('SELECT estado FROM objetivos WHERE id = ?', [objetivoId]);
    const currentStatus = currentStatusRows[0].estado;

    // Cambia el estado a opuesto (pendiente <-> cumplido)
    const newStatus = currentStatus === 'pendiente' ? 'cumplido' : 'pendiente';

    // Actualiza el estado del objetivo en la base de datos
    await pool.query('UPDATE objetivos SET estado = ? WHERE id = ?', [newStatus, objetivoId]);

    res.json({ message: 'Estado del objetivo cambiado correctamente.' });
  } catch (error) {
    console.error('Error al cambiar el estado del objetivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
