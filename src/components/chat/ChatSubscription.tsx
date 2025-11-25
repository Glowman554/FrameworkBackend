import { createSignal, onCleanup, onMount, Show, useContext } from 'solid-js';
import type { ChatMessage } from '../../actions/chat';
import Loading, { LoadingContext } from '@glowman554/base-components/src/loading/Loading';
import { createQuery, withQuery } from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';

export function urlWithPrefix(url: string, ws: boolean): string {
    const prefix = localStorage.getItem('prefix');
    const prefixed = prefix ? prefix + url : url;

    if (ws) {
        if (!prefixed.startsWith('http')) {
            return prefixed;
        }
        const parsed = new URL(prefixed);
        parsed.protocol = parsed.protocol === 'http:' ? 'ws:' : 'wss:';
        return parsed.href;
    }

    return prefixed;
}

function createSubscription() {
    const [websocket, setWebsocket] = createSignal<WebSocket | null>(null);
    const [history, setHistory] = createSignal<ChatMessage[]>([]);

    const connect = () => {
        const ws = new WebSocket(urlWithPrefix('/api/v1/chat/subscribe', true));
        ws.onopen = () => {
            console.log('websocket opened');
            setWebsocket(ws);
        };
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data) as ChatMessage;
            console.log('websocket message', data);

            setHistory([...history(), data]);
        };
        ws.onclose = () => {
            console.log('websocket closed');
            setWebsocket(null);
            setTimeout(connect, 1000);
        };
    };

    onMount(() => {
        connect();
    });

    onCleanup(() => {
        const ws = websocket();
        if (ws) {
            console.log('closing websocket');
            ws.close();
        }
    });

    return [history];
}

function ChatMessageComponent(props: { message: ChatMessage }) {
    return (
        <div>
            <strong>{props.message.username}:</strong> {props.message.message}
        </div>
    );
}

function Wrapped() {
    const [staticHistory] = createQuery(() => actions.chat.loadLatest({ limit: 50 }).then((res) => res.data));
    const [history] = createSubscription();
    const [messageInput, setMessageInput] = createSignal('');
    const loading = useContext(LoadingContext);

    const onMessageSend = () => {
        withQuery(() => actions.chat.publishUnauthenticated({ message: messageInput() }), loading, true);
        setMessageInput('');
    };

    return (
        <div class="center">
            <div class="max-h-[80vh] w-full overflow-y-auto rounded-xl bg-neutral-800 p-4 text-white">
                <input
                    value={messageInput()}
                    class="mb-8 w-full rounded-xl bg-neutral-600 p-2 text-white"
                    type="text"
                    autocomplete="off"
                    autocapitalize="off"
                    onKeyDown={(e) => {
                        setMessageInput(e.currentTarget.value);
                        if (e.key == 'Enter') {
                            onMessageSend();
                        }
                    }}
                ></input>

                {history()
                    .toReversed()
                    .map((message) => (
                        <ChatMessageComponent message={message} />
                    ))}

                <Show when={staticHistory()}>
                    {staticHistory()!.map((message) => (
                        <ChatMessageComponent message={message} />
                    ))}
                </Show>
            </div>
        </div>
    );
}

export default function () {
    return (
        <Loading initial={true}>
            <Wrapped />
        </Loading>
    );
}
