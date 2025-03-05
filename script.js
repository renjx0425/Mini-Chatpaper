// Sends an example message to the OpenAI API
// Note this is an async function, necessary since we are using await with fetch
async function sendExampleMessage() {
    // Get the example message and example response components to display messages
    const exampleMessage = document.getElementById('example-message');
    const exampleResponse = document.getElementById('example-response');
    // Set a message to be sent to OpenAI to a static message - 
    // you will need to make this dynamic!
    const message = "User: Hello ChatGPT!";
    // Set the example message component in chat to the above message
    exampleMessage.textContent = message;   

    // First we need an API key - you must fill this line in with your own key!
    const apiKey = '...'; // Fill this line in with your own key
    // Define some system instructions. You can leave this out to get the default GPT behavior, but we'll need to use this for more fine-tuned responses!
    const systemInstructions = `
    You are a friendly AI, but you have a sassy side. \n
    Also, you love red pandas! \n
    `;
    // Wrap the call in a try/catch block
    try {
        // We recommend using fetch to call the API, like so:
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // You can change this model to whichever one you want- gpt-3.5-turbo, gpt-4-turbo also work
                messages: [ // Add your prompts below. This includes system instructions, and anything you want the AI to know to generate the response. You can add multiple user
                    { role: 'system', content: systemInstructions },
                    { role: 'user', content: message },
                    { role: 'user', content: "How are you doing today, ChatGPT?" },
                ],
                max_tokens: 350 // You may want to set this to a relatively high number for your responses. 350 is generally a solid limit.
            })
        });

        // Catch errors if response fails to send
        if (!aiResponse.ok) {
            throw new Error('Request failed: ' + aiResponse.statusText);
        }

        // Await the data to be send back from the API
        const data = await aiResponse.json();
        // Then clean the output
        const output = data.choices[0].message.content.trim();
        // Finally, display the response
        exampleResponse.textContent = "AI: " + output;
    } catch (error) {
        // Display an error message if something goes wrong (likely, bad API key, or bad internet)
        console.error('Error:', error);
        exampleResponse.textContent = 'Something went wrong!';
    }
}

// Gets the original text of the document by reading in a text document
async function getText() {
    const response = await fetch('bionicreading.txt')
    const text = await response.text()
    return text;
}

// Given a section, highlights a subsection
let previousSection = null;

function highlightSection(section) {
    // Remove previous highlights
    if (previousSection) {
        const prevSelectedSection = document.getElementById(previousSection);
        if (prevSelectedSection) {
            // Remove existing highlights by stripping the <mark> tags
            prevSelectedSection.innerHTML = prevSelectedSection.innerHTML.replace(/<\/?mark[^>]*>/gi, '');
        }
    }

    // Get current section
    const selectedSection = document.getElementById(section);
    if (!selectedSection) return; // Guard clause if the section is not found
    
    // Highlight the whole section by wrapping the entire content in a <mark> tag
    const text = selectedSection.innerHTML;
    selectedSection.innerHTML = `<mark class='highlight'>${text}</mark>`;

    // Update the previousSection variable to the current section
    previousSection = section;

    // Scroll to the section in the text
    selectedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function sendUserMessage() {
    const userQuestion = document.getElementById('user-question').value;
    if (!userQuestion) return;

    // Add user message to chat bubbles
    addChatBubble(userQuestion, 'user-message');

    try {
        // Get AI response
        const aiResponse = await getAIResponse(userQuestion);
        console.log('Raw AI Response:', aiResponse); // Debugging information

        // Sanitize the AI response by removing backticks and markdown `json` block syntax
        let sanitizedResponse = aiResponse.replace(/^```json|```$/g, '').trim();
        console.log('Sanitized AI Response:', sanitizedResponse); // Debugging information

        // Ensure the response is valid JSON
        if (!sanitizedResponse.startsWith('{') || !sanitizedResponse.endsWith('}')) {
            throw new Error('Invalid JSON format');
        }

        // Parse the JSON response
        let data;
        try {
            data = JSON.parse(sanitizedResponse);
        } catch (jsonError) {
            console.error('JSON Parsing Error:', jsonError);
            console.error('Sanitized AI Response that caused the error:', sanitizedResponse); // Log the problematic response
            addChatBubble('Failed to parse AI response.', 'error-message');
            return;
        }

        console.log('Parsed AI Response:', data); // Debugging information

        // Ensure that the response exists and is valid before displaying fallback
        const response = data.response || 'No message provided by the AI.';

        // Add AI response to chat bubbles
        addChatBubble(response, 'ai-response');

        // Create HTML buttons for links (if applicable)
        const container = document.getElementById('container');
        if (container) {
            container.innerHTML = ''; // Clear previous content

            if (data.links && data.links.length > 0) {
                data.links.forEach(link => {
                    const button = document.createElement('button');
                    button.textContent = link.text;
                    button.onclick = () => {
                        highlightSection(link.sectionID); // Call highlightSection with sectionID
                    };
                    container.appendChild(button);
                });
            }
        }

        // Highlight text, if any section is to be highlighted
        if (data.highlight) {
            highlightSection(data.highlight);
        }

    } catch (error) {
        console.error('Error:', error);
        addChatBubble('An error occurred while processing the response. Please try again.', 'error-message');
    }

    // Clear the input field
    document.getElementById('user-question').value = '';
}

// Ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const userQuestionInput = document.getElementById('user-question');
    if (userQuestionInput) {
        // Use keydown instead of keypress for consistency across browsers
        userQuestionInput.addEventListener('keydown', async function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent the default action
                await sendUserMessage(); // Trigger the function
            }
        });
    } else {
        console.error('User question input element not found');
    }
});

function addChatBubble(message, className) {
    const chatBubbles = document.getElementById('chat-bubbles');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${className}`;

    if (message) {
        // Convert section references to links
        const linkedMessage = message.replace(/\[section([^\]]+)\]/g, (_, sectionId) => {
            return `<a href="#${sectionId}" onclick="highlightSection('${sectionId}')">${sectionId}</a>`;
        });

        bubble.innerHTML = linkedMessage;
    } else {
        bubble.innerHTML = 'No message provided'; // Fallback if message is undefined
    }

    chatBubbles.appendChild(bubble);

    // Scroll to the latest message
    chatBubbles.scrollTop = chatBubbles.scrollHeight;
}

async function getAIResponse(userQuestion) {
    const apiKey = '...'; // Replace with your actual API key
    const systemInstructions = `
    You are an AI assistant that helps users understand and analyze academic papers. Provide contextually accurate and detailed responses based on the provided text and user questions. When referring to specific sections of the paper, include the section ID in the format [sectionID]. Respond in JSON format with the following structure:
    {
        "response": "Your detailed response here",
        "links": [
            {"sectionID": "section1", "text": "Section 1"},
            {"sectionID": "section2", "text": "Section 2"}
        ],
        "highlight": "sectionID"
    }
    `;

    try {
        // Fetch the entire text of the paper
        const paperText = await getText();

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // You can change this model to whichever one you want
                messages: [
                    { role: 'system', content: systemInstructions },
                    { role: 'user', content: `Here is the text of the paper:\n\n${paperText}` },
                    { role: 'user', content: userQuestion }
                ],
                max_tokens: 350 // Increase the token limit to accommodate longer responses
            })
        });

        if (!aiResponse.ok) {
            throw new Error('Request failed: ' + aiResponse.statusText);
        }

        const data = await aiResponse.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error:', error);
            return {
                response: 'An error occurred while processing your request. Please try again later.',
                links: [],
                highlight: ''
            };
        }
    }
