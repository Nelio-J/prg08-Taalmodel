document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chatContainer');

    const initialForm = document.getElementById('initialForm');
    const initialQueryInput = document.getElementById('initialQueryInput');
    const initialSubmitButton = document.getElementById('initialSubmitButton')

    const chatForm = document.getElementById('chatForm');
    const queryInput = document.getElementById('queryInput');
    const submitBtn = document.getElementById('submitBtn');

    const loader = document.getElementById('loader');
    const responseDiv = document.getElementById('response');
    const movesetDiv = document.getElementById('moveset');
    const pokemonSprite = document.getElementById('pokemonSprite');

    let chatHistory = []; // Initialize chat history

    initialForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Disable form elements
        initialQueryInput.disabled = true;
        initialSubmitButton.disabled = true;
        loader.style.display = 'block';

        try {
            // Send initial Pokémon name to backend
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: initialQueryInput.value, history: chatHistory })
            });

            const responseData = await response.json();

            // Update chat history with the model's response
            chatHistory = responseData.history;
            // console.log(chatHistory);
            console.log(responseData);

            // Display the response from the server
            movesetDiv.innerText = responseData.response;
            movesetDiv.style.display = 'block';

            // Fetch sprite from PokéAPI
            const pokemonName = responseData.pokemonName;
            console.log(pokemonName);
            const spriteResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            const spriteData = await spriteResponse.json();
            console.log(spriteData);

            // Display the sprite
            pokemonSprite.src = spriteData.sprites.other['official-artwork'].front_default;
            pokemonSprite.style.display = 'block';

            // Show chat form
            initialForm.style.display = 'none';
            chatForm.style.display = 'inline-block';
        } catch (error) {
            console.log('Error:', error);
            responseDiv.innerText = 'Error occurred while fetching response';
            responseDiv.style.display = 'block';
        } finally {
            // Enable form elements and hide loading spinner
            initialQueryInput.disabled = false;
            initialSubmitButton.disabled = false;
            loader.style.display = 'none';
        }
    });


    chatForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Get query input value
        const query = queryInput.value.trim();


        if (query === '') {
            return; // Do nothing if input is empty
        }

        // Disable form elements while waiting for response
        queryInput.disabled = true;
        submitBtn.disabled = true;
        loader.style.display = 'block';

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query, history: chatHistory })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();

            // Update chat history with the model's response
            chatHistory = responseData.history;

            console.log(responseData);

            // Check if the response is a moveset
            if (isMoveset(responseData.response)) {
                // Trim the response to only contain the Pokémon build and leftover information
                const { trimmedResponse, leftoverResponse } = trimResponse(responseData.response);

                // Display the trimmed Pokémon build in the moveset div
                movesetDiv.innerText = trimmedResponse;
                movesetDiv.style.display = 'block';

                // Display the leftover information only if it exists
                if (leftoverResponse.trim()) {
                    responseDiv.innerText = leftoverResponse;
                    responseDiv.style.display = 'block';
                } else {
                    responseDiv.style.display = 'none';
                }
            } else {
                // Display other responses in the otherResponse div
                responseDiv.innerText = responseData.response;
                responseDiv.style.display = 'block';
            }

            // Clear input field
            queryInput.value = '';
        } catch (error) {
            console.log('Error:', error);
            responseDiv.innerText = 'Error occurred while fetching response';
            responseDiv.style.display = 'block';
        } finally {
            // Re-enable form elements and hide loader
            queryInput.disabled = false;
            submitBtn.disabled = false;
            loader.style.display = 'none';
        }
    });

    // function displayMessage(message, role) {
    //     const messageElement = document.createElement('div');
    //     messageElement.classList.add(role);
    //     messageElement.textContent = message;
    //     chatContainer.appendChild(messageElement);
    // }

    // Function to check if the response is a moveset
    function isMoveset(response) {
        return response.includes('@') && response.includes('-');
    }

    // Function to trim the response to only contain the Pokémon build and return leftover information
    function trimResponse(response) {
        // Split the response by new line character
        const lines = response.split('\n');
        // Find the index of the line containing the Pokémon build structure
        const startIndex = lines.findIndex(line => line.includes('@'));
        // Find the index of the last line that starts with a dash (indicating a move)
        let endIndex = lines.length - 1; // Initialize endIndex to the last line
        for (let i = lines.length - 1; i > startIndex; i--) {
            if (lines[i].trim().startsWith('-')) {
                endIndex = i; // Update endIndex to the index of the last move
                break;
            }
        }
        // Extract the lines containing the Pokémon build
        const trimmedLines = lines.slice(startIndex, endIndex + 1);
        // Join the trimmed lines back together to form the Pokémon build
        const trimmedResponse = trimmedLines.join('\n');
        // Extract the leftover lines
        const leftoverLines = lines.slice(0, startIndex).concat(lines.slice(endIndex + 1));
        // Join the leftover lines back together to form the leftover information
        const leftoverResponse = leftoverLines.join('\n');
        // Return both the trimmed Pokémon build and the leftover information
        return { trimmedResponse, leftoverResponse };
    }


});
