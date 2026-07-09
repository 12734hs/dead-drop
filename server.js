const express = require('express');
const PORT = process.env.PORT || 3000;
const routes = require('./routes/index.js')

const app = express();

app.use(express.json({
    'limit': '50mb',
}));

app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`)
})

export default app;