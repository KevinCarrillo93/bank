import express from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { PORT, SECRET_JWT_KEY } from './config.js'
import { UserRepository } from './user-repository.js'
import { ConnectionError, ValidationError } from './errors.js'

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: 'http://localhost:5173', // Reemplaza con la URL de tu frontend
    methods: ['GET', 'POST'],       // Métodos HTTP permitidos
    credentials: true               // Permitir cookies y encabezados de autenticación
}));

app.get('/', (req, res) =>{
    res.send('Helloo')
})

app.post('/login', async (req, res)=>{
    const { email, password } = req.body
    try {
        const user = await UserRepository.login({ email, password })
        const token = jwt.sign(
            { id: user.id, email: user.email}, 
            SECRET_JWT_KEY,
            {
                expiresIn:  '1h'
            })
        res
            .cookie('access_token', token, {
                httpOnly: true,
                secure: false, 
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60
            })
            .status(200)
            .json({ success: true, user: user});
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error.name, message: error.message });
    }
})

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    console.log("Received request with:", { email, password });
    try {
        const id = await UserRepository.create({ email, password });
        console.log("User created with ID:", id);
        res.status(200).json({ success: true, id: id });
    } catch (error) {
        console.error("Error occurred:", error);
        if (error instanceof ConnectionError) {
            setTimeout(async () => {
                try {
                    const id = await UserRepository.create({ email, password });
                    res.status(200).json({ success: true, id: id});
                } catch (err) {
                    console.error("Error in retry:", err);
                    res.status(500).json({ success: false, error: err.name, message: err.message });
                }
            }, 1000);
        }  else if (error instanceof ValidationError) {
            res.status(400).json({ success: false, error: error.name, message: error.message }); // Error de validación
        } else {
            res.status(500).json({ success: false, error: 'UnexpectedError', message: 'An unexpected error occurred.' }); // Error inesperado
        }
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Solo true en producción
        sameSite: 'strict',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

app.post('/protected', (req, res)=>{
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }
    // Verificar el token aquí
    jwt.verify(token, SECRET_JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }
        res.render('protected');
    });
});

//Simulaciones
app.post('/saveSimulation', async (req, res) => {
    const token = req.cookies.access_token
    try {
        const data = jwt.verify(token, SECRET_JWT_KEY)
        res.render('protected', data)
    } catch (error) {
        res.status(401).send('Access not authorized')
    }
    const { userId, monto, terminoPago, fechaInicio, fechaFin, tasaInteres } = req.body;
    try {
        const simulationId = await UserRepository.saveSimulation({ userId, monto, terminoPago, fechaInicio, fechaFin, tasaInteres });
        res.status(200).json({ success: true, simulationId });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

app.get('/getSimulations/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const simulations = await UserRepository.getSimulations(userId);
        res.status(200).json({ success: true, simulations });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Ruta para actualizar una simulación
app.put('/simulations/:id', (req, res) => {
    const { id } = req.params;
    const { amount, paymentTerm, startDate, endDate, interestRate } = req.body;
  
    if (!amount || !paymentTerm || !startDate || !endDate) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
  
    // Lógica para encontrar la simulación por ID y actualizarla
    const simulationIndex = simulations.findIndex((sim) => sim.id === parseInt(id));
    if (simulationIndex === -1) {
      return res.status(404).json({ message: 'Simulación no encontrada' });
    }
  
    // Actualizamos la simulación
    simulations[simulationIndex] = {
      ...simulations[simulationIndex],
      amount,
      paymentTerm,
      startDate,
      endDate,
      interestRate
    };
  
    res.json({ message: 'Simulación actualizada', simulation: simulations[simulationIndex] });
  });
  


app.listen(PORT, () =>{
    console.log(`'Servidor corriendo en http://localhost:${PORT}'`)
})

