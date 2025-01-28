import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIAgent } from '@llamaindex/openai'
import { createInterface } from 'readline';


// Make sure your local Qdrant server is started using:
// docker run -p 6333:6333 qdrant/qdrant
const client = new QdrantClient({
    url: 'http://localhost:6333',
    // url: 'https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.us-east-0-1.aws.cloud.qdrant.io',
    // apiKey: '<your-api-key>',
});
const agent = new OpenAIAgent({
    tools: []
})

const response = await agent.chat({
    message: 'Hello, how are you?',
    stream: false
})


const rl = createInterface({
    input: process.stdin,
    output: process.stdout
})

let userMsg = "";
let answer: any = null;

console.info(`Assistant: ${response.message}`)

while (true) {
    rl.question('You: ', async (prompt) => {
        userMsg = prompt;
        rl.close();
    });

    if (userMsg == "exit") break;

    answer = await agent.chat({
        message: userMsg,
        stream: false
    })
    console.info(`Assistant: ${response.message}`)
}