const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ruta de prueba para simular la llegada de un pedido del mesero
app.post('/api/pedidos', (req, res) => {
    const { mesa, platillos, total } = req.body;

    console.log(`[NUEVO PEDIDO] Mesa: ${mesa} | Total: $${total}`);
    console.log('Platillos:', platillos);

    res.status(201).json({
        status: 'success',
        message: 'Pedido recibido en cocina y caja',
        data: { mesa, total }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo con éxito en el puerto ${PORT}`);
});
