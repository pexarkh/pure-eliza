import {
    createPromiseClient
} from '@bufbuild/connect'
import {
    createConnectTransport,
} from '@bufbuild/connect-web'
import { ElizaService } from './gen/eliza/eliza_connect.js'
import { IntroduceRequest } from './gen/eliza/eliza_pb.js'

let introFinished = false;

// Make the Eliza Service client
const client = createPromiseClient(
    ElizaService,
    createConnectTransport({
        baseUrl: 'http://localhost:8080',
    })
)

// Query for the common elements and cache them.
const containerEl = document.getElementById("conversation-container") as HTMLDivElement;
const inputEl = document.getElementById("user-input") as HTMLInputElement;

// Add an event listener to the input so that the user can hit enter and click the Send button
document.getElementById("user-input")?.addEventListener("keyup", (event) => {
    event.preventDefault();
    if (event.key === "Enter") {
        document.getElementById("send-button")?.click();
    }
});

// Adds a node to the DOM representing the conversation with Eliza
function addNode(text: string, sender: string): void {
    const divEl = document.createElement('div');
    const pEl = document.createElement('p');

    const respContainerEl = containerEl.appendChild(divEl);
    respContainerEl.className = `${sender}-resp-container`;

    const respTextEl = respContainerEl.appendChild(pEl);
    respTextEl.className = "resp-text";
    respTextEl.innerText = text;
}

async function send() {
    const sentence = inputEl?.value ?? '';

    addNode(sentence, 'user');

    inputEl.value = '';

    if (introFinished) {
        const response = await client.say({
            sentence,
        })

        addNode(response.sentence, 'eliza');
    } else {
        const request = new IntroduceRequest({
            name: sentence,
        })

        for await (const response of client.introduce(request)) {
            addNode(response.sentence, 'eliza');
        }

        introFinished = true;
    }
}

export function handleSend() {
    send();
}
