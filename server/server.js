// express
import express from "express";
import openAIRoutes from "./routes/openAIRoutes.js";
import 'dotenv/config'

const app = express();
// const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

app.use('/',  openAIRoutes);

// Start the server
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

const listener = app.listen(process.env.EXPRESS_PORT, () => {
    console.log('Webserver started at port ' + listener.address().port)
});

