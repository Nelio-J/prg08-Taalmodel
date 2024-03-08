import express from "express";
import {ChatOpenAI} from "@langchain/openai";

const openAIRoutes = express.Router();
openAIRoutes.use(express.urlencoded({extended: true}));
openAIRoutes.use(express.json());

const chatHistory = []; // Initialize chat history array

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
        const { query, history } = req.body;

        console.log(query);
        console.log(history);

        let engineeredPrompt;

        if (history.length === 0) {

            const system = "You are an experienced competitive Pokémon teacher. You can simplifiy concepts that are hard to understand.";

            engineeredPrompt = `Can you give me a competitively viable moveset for ${query} in Pokemon Sword and Shield? Please include an EV-spread, nature, ability and held item. Please structure it like this, line separated: Name @ Held item Ability: EVs: 252 stat / 4 stat / 252 stat Nature - Move #1 - Move #2 - Move #3 - Move #4. I don't need any other information outside of the given structure. If the Pokémon is not officially known, please return: Error - Pokémon not found. Please check your spelling.`;

            // console.log(engineeredPrompt);

            const response = await model.invoke([
                ["system", system],
                ["user", engineeredPrompt]
            ]);

            // Extract the Pokémon name using the separate function
            const pokemonName = extractPokemonName(response.content, query);

            chatHistory.push({ role: 'system', content: system});
            chatHistory.push({ role: 'user', content: engineeredPrompt });
            chatHistory.push({ role: 'model', content: response.content });

            // Return the response from the model along with chat history as a JSON response
            res.json({ response: response.content, pokemonName, history: chatHistory });
            console.log(pokemonName);

            console.log(chatHistory);
            console.log("______________________________");

        } else {
            // Add user's query and model's response to chat history
            chatHistory.push({ role: 'user', content: query });

            // Construct engineered prompt based on chat history
            engineeredPrompt = chatHistory.map(item => item.content).join('\n');

            console.log("ELSE STATEMENT");
            console.log(engineeredPrompt);

            // Invoke the LangChain model with the provided query
            const response = await model.invoke(engineeredPrompt);

            // Add user's query and model's response to chat history
            // chatHistory.push({ role: 'user', content: query });
            chatHistory.push({ role: 'model', content: response.content });

            // Return the response from the model along with chat history as a JSON response
            res.json({ response: response.content, history: chatHistory });
            console.log(response);
            console.log("______________________________");

            // console.log("______________________________");
            // console.log(chatHistory);
        }

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

// Function to extract Pokémon name from LangChain response
function extractPokemonName(responseContent, originalQuery) {
    // Regular expression to match the first word before a space or '@' character
    const matches = responseContent.match(/^([^\s@]+)/);
    // Extracted Pokémon name or fallback to the original query
    return matches ? matches[0].toLowerCase() : originalQuery.toLowerCase();
}

export default openAIRoutes;