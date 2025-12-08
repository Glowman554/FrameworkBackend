import { createSignal } from 'solid-js';
import { actions } from 'astro:actions';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import FakeUserEditor from './FakeUserEditor';

export default function () {
    const [newVisible, setNewVisible] = createSignal(false);
    return (
        <>
            <button class="button" onClick={() => setNewVisible(true)}>
                New fake user
            </button>
            <Overlay visible={newVisible()} reset={() => setNewVisible(false)}>
                <FakeUserEditor
                    submit={(username, loading) =>
                        withQuery(
                            () => actions.users.create({ username }),
                            loading,
                            true,
                            () => location.reload()
                        )
                    }
                />
            </Overlay>
        </>
    );
}
