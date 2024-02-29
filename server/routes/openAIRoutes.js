import express from "express";
import { ChatOpenAI } from "@langchain/openai";

const openAIRoutes = express.Router();
openAIRoutes.use(express.urlencoded({extended: true}));
openAIRoutes.use(express.json());

const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
})

openAIRoutes.use("/", (req, res, next) => {
    console.log("Requested /");
    console.log(`Request METHOD: ${req.method}`);
    if (req.headers?.accept) {
        console.log(`The accept header is: ${req.headers.accept}`);
    }
    else {
        console.log("There is no accept header")
    }
    next()
})

openAIRoutes.options('/chat', (req, res) => {
    res.header("Allow", "GET, POST, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
});

// Middleware to check the Accept header
const checkAcceptHeader = (req, res, next) => {
    const acceptHeader = req.get('Accept');

    if (acceptHeader && acceptHeader.toLowerCase() === 'application/json') {
        next();
    } else {
        res.status(406).json({ message: 'Not Acceptable: Only application/json is supported.' });
    }
};

// Middleware to check the Content-Type header
const checkContentTypeHeader = (req, res, next) => {
    const contentTypeHeader = req.get('Content-Type');

    if (contentTypeHeader &&
        (contentTypeHeader.toLowerCase() === 'application/json' ||
            contentTypeHeader.toLowerCase() === 'application/x-www-form-urlencoded')) {
        next();
    } else {
        res.status(415).json({ message: 'Unsupported Media Type: Only application/json and application/x-www-form-urlencoded are supported.' });
    }
};

openAIRoutes.get('/joke', checkAcceptHeader, async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    try {
        // Invoke the LangChain model to get a joke
        const joke = await model.invoke("Tell me a Javascript joke!");

        // Return the joke as a response
        res.send(joke.content);
    } catch (error) {
        // If an error occurs, return an error response
        console.error('Error retrieving joke:', error);
        res.status(500).send('Error retrieving joke');
    }
});

// Create a new Episode
openAIRoutes.post('/chat', checkContentTypeHeader, async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    try {
        const query = req.body.query; // Assuming the query is sent in the request body

        // Invoke the LangChain model with the provided query
        const response = await model.invoke(query);

        // Return the response from the model as a JSON response
        res.json({ response: response.content });
    } catch (err) {
        if (err.name === 'ValidationError') {
            // Handle validation errors
            res.status(400).json({ message: err.message });
        } else {
            // Handle other errors
            res.status(500).json({ message: err.message });
        }
    }
});

export default openAIRoutes;