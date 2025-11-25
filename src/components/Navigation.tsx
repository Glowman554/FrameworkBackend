import Navigation, { Entry, Home } from '@glowman554/base-components/src/generic/Navigation';

export default function () {
    return (
        <Navigation>
            <Home href="/">Home</Home>
            <Entry href="/versions">Versions</Entry>
            <Entry href="/chat">Chat</Entry>
            <Entry href="/featured">Featured servers</Entry>
        </Navigation>
    );
}
