// express
import express from "express";
import openAIRoutes from "./routes/openAIRoutes.js";
import 'dotenv/config'
import path from "path";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// communicatie met Azure (> chatGPT)
// console.log(process.env.AZURE_OPENAI_API_KEY)

import { ChatOpenAI } from "@langchain/openai"

const app = express();
// const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

app.use('/',  openAIRoutes);

// Get the directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the CLIENT directory
app.use(express.static(path.join(__dirname, 'client')));

// Define routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'client', 'index.html'));
});

// Start the server
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

const listener = app.listen(process.env.EXPRESS_PORT, () => {
    console.log('Webserver started at port ' + listener.address().port)
});

// async function main() {
//     const joke = await model.invoke("Tell me a Javascript joke!")
//
//     // const joke =  await model.invoke("Can you give me a competitively viable moveset for Cinderace in Pokemon Sword and Shield? Please include an EV-spread, nature, ability and held item. Please structure it like this, line separated: Name @ Held item Ability: EVs: 252 stat / 4 stat / 252 stat Nature - Move #1 - Move #2 - Move #3 - Move #4 .Finally, could you recommend 5 other Pokemon that could fit on the team?")
//     console.log(joke.content)
// }
//
// main()

// const joke =  await model.invoke("Tell me a recipe for Hot Chocolate!")
// console.log(joke.content)

