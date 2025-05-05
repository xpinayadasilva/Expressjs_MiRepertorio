import express  from 'express'
import fs from 'fs'
import path from'path'
import cors from 'cors'
import { fileURLToPath } from 'url';
import { console } from 'inspector';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const app = express();
const PORT = 3000;
const ARCHIVO_DATOS = path.join(__dirname, 'canciones.json');
console.log(__dirname);
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {    
    res.sendFile(path.join(__dirname,'index.html'));
})

const readData = () => {
    try {
        const data = fs.readFileSync(ARCHIVO_DATOS, 'utf-8');
        return JSON.parse(data);
    }
    catch(error){
        return [];
    }
};

const writeData = (data) => {
    fs.writeFileSync(ARCHIVO_DATOS, JSON.stringify(data, null, 2), 'utf-8');
}

//read
app.get("/canciones", (req, res) => {   
    console.log ('entro a get/canciones');
    const data = readData();
    console.log(data.stringify);
    res.json(data);
});

//create
app.post("/canciones", (req, res) =>{
    const data = readData();
    const newItem = req.body;
    newItem.id = data.length ? data[data.length - 1].id + 1 : 1;
    data.push(newItem);
    writeData(data);
    res.status(201).json(newItem);
});

//update
app.put("/canciones/:id", (req, res) =>{
    const data = readData();
    const id = parseInt(req.params.id, 10);
    const index = data.findIndex((item) => item.id === id);

    if(index !== -1){
        data[index] = { ...data[index], ...req.body };
        writeData(data);
        res.json(data[index]);
    }
    else{
        res.status(404).json({ error: 'Elemento no encontrado' });
    }
});

//delete
app.delete("/canciones/:id", (req, res) =>{
    const data = readData();
    const id = parseInt(req.params.id, 10);
    const newData = data.filter((item) => item.id !== id);

    if (newData.length !== data.length){
        writeData(newData);
        res.json({ message: 'Elemento eliminado'});
    }
    else{
        res.status(404).json({ error: 'Elemento no encontrado' });
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