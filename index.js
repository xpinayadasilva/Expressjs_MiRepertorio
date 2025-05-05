import express  from 'express';
import fs, { readFile, writeFile } from 'fs';
import path from'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { console } from 'inspector';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const app = express();
const PORT = 3000;
//const ARCHIVO_DATOS = path.join(__dirname, 'canciones.json');
//console.log(__dirname); 
//console.log(ARCHIVO_DATOS.toString);
app.use(express.json());
app.use(cors());

// GET /index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

const readData = async() => {
    try {
        const fsResponse = readFile('canciones.json', 'utf-8');
        const repertorio = JSON.parse(fsResponse);
        console.log('Lectura de canciones.json exitosa.');
        return repertorio;
      } catch (error) {
        console.log('Error al leer el archivo canciones.json.', error.message);
        if (error.code === 'ENOENT') {
          const newRepertorio = [];
          writeFile('canciones.json', JSON.stringify(newRepertorio));
          console.log('Se creó un nuevo archivo canciones.json.');
          return newRepertorio;
        }
      }
};

const writeData = async(data) => {
    try {
        await writeFile('canciones.json', JSON.stringify(data));
        console.log('Escritura de canciones.json exitosa.');
      } catch (error) {
        console.log('Error al escribir en el archivo canciones.json.', error.message);
      }
}

//read
/* app.get("/canciones", (req, res) => {   
    console.log ('entro a get/canciones');
    const data = readData();
    console.log(data.stringify);
    res.json(data);
}); */
app.get("/canciones", async(req, res) => {       
    const data = readFile("canciones.json");
    console.log(data.stringify);
    res.json(data);
});

//create
app.post('/canciones', async (req, res) => {
    const { id, titulo, artista, tono } = req.body;
    const newCancion = { id, titulo, artista, tono };
  
    if ( !newCancion.titulo || !newCancion.artista || !newCancion.tono ) {
      return res.status(401).json({
        message: 'La canción no fue agregada por tener campos vacíos o incompletos.',
      });
      // return console.log('La canción no fue agregada por tener campos vacíos.');
    }
  
    const repertorio = await readData();
    const idExistente = repertorio.some((cancion) => cancion.id === newCancion.id);
  
    if (idExistente) {
      return res.status(401).json({
        message: 'La canción no fue agregada, el id ya existe.',
      });
      // return console.log('La canción no fue agregada, el id ya existe.');
    }
  
    repertorio.push(newCancion);
    await writeData(repertorio);
  
    res.status(201).json({
      message: 'La canción fue agregada exitosamente.',
      cancionAgregada: newCancion,
    });
  });

//update
app.put('/canciones/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { titulo, artista, tono } = req.body;
  
    if (!titulo || !artista || !tono ) {
      return res.status(401).json({
        message: 'La canción no puede tener campos vacíos o incompletos.',
      });
      // return console.log('La canción no puede tener campos vacíos.');
    }
  
    const repertorio = await readData();
    const index = repertorio.findIndex((cancion) => cancion.id === id);
  
    if (index !== -1) {
      repertorio[index] = { id, titulo, artista, tono };
      await writeData(repertorio);
      res.json({
        message: 'La canción fue actualizada exitosamente.',
      });
    } else {
      res.status(401).json({
        message: 'No se encuentra el id de la canción.',
      });
    }
  });

//delete
app.delete('/canciones/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const repertorio = await readData();
    const newRepertorio = repertorio.filter((cancion) => cancion.id != id);
  
    if (repertorio.length != newRepertorio.length) {
      await writeData(newRepertorio);
      res.json({
        message: 'La canción fue eliminada exitosamente',
      });
    } else {
      res.status(401).json({
        message: 'No se encuentra el id de la canción.',
      });
    }
  });


//search
app.get("/canciones/buscar", (req, res) => {
    const { key, value } = req.query;
    const data = readData();
    const results = data.filter((item) => item[key] === value );
    res.json(results);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});