# Interactive Reading Tool

This project enables users to interact with research papers using AI through a chat interface built with JavaScript and API integration.

## Prerequisites:
- A web browser (Chrome, Firefox, Edge, etc.)
- An Internet connection (to make API requests)
- An OpenAI API key (to be added to the script)

## Setup Instructions:

1. **File Structure:**
   Ensure the following files are in the same directory:
   - `app.html`: HTML file for structuring the webpage
   - `script.js`: JavaScript file for chat logic and API calls
   - `style.css`: CSS file for styling
   - `bionicreading.txt`: Text file containing the Bionic Reading article

2. **Open the HTML File:**
   - Double-click `app.html` to open the webpage in your web browser.

3. **Replace the API Key:**
   - Open the `script.js` file in a code editor (VSCode, Sublime Text, Notepad++, etc.)
   - Find the line where the OpenAI API key is defined:
     ```js
     const apiKey = '...'; // Replace with your actual API key
     ```
   - Replace the placeholder with your API key from OpenAI.

4. **Using the Chat Interface:**
   - Once the webpage is open, you’ll see a chat interface on the right side.
   - Type questions in the input box and press **Send** or hit **Enter**.
   - The system will highlight sections of the text and provide AI responses using OpenAI’s API.

5. **Highlighting Text:**
   - Use buttons to focus on different text sections, such as the introduction or discussion.
   - The AI will highlight relevant sections based on your queries.

6. **Chat Functionality:**
   - As you chat, the webpage will dynamically add "chat bubbles" with your messages and the AI's responses.
   - The chat supports scrolling for longer conversations and fetches relevant sections from the Bionic Reading article.

7. **Styling:**
   - Pre-defined CSS styles include:
     - Button hover effects
     - Gradient backgrounds for headers
     - Customized chat bubbles for user and AI responses

## Troubleshooting:
- Ensure your API key is correct.
- Verify that all files (HTML, JS, CSS, and text) are in the same directory.
