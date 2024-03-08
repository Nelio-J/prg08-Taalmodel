import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
    document.addEventListener('DOMContentLoaded', function() {
        const chatForm = document.getElementById('chatForm');
        const queryInput = document.getElementById('queryInput');
        const submitBtn = document.getElementById('submitBtn');
        const loader = document.getElementById('loader');
        const responseDiv = document.getElementById('response');


        chatForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            // Disable form elements while waiting for response
            queryInput.disabled = true;
            submitBtn.disabled = true;
            loader.style.display = 'inline-block';

            // Get query input value
            const query = queryInput.value.trim();

            try {
                const response = await fetch('http://localhost:8000/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const responseData = await response.json();

                // Display the response from the server
                responseDiv.innerText = responseData.response;
                responseDiv.style.display = 'block';

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
    });

  return (
      <>
          <div className="container">
              <h1>OpenAI Chat</h1>

              <form id="chatForm">
                  <label htmlFor="queryInput">Enter your question:</label><br/>
                  <textarea id="queryInput" name="query" placeholder="Enter a Pokémon..."></textarea><br/>
                  <button type="submit" id="submitBtn">Submit</button>
              </form>

              <div id="loader" className="hidden"></div>
              <div id="response" className="hidden"></div>
          </div>
      </>
  )
}

export default App
