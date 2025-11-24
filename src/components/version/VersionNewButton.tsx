import { createSignal } from 'solid-js';
import { actions } from 'astro:actions';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import VersionEditor from './VersionEditor';

export default function () {
    const [newVisible, setNewVisible] = createSignal(false);
    return (
        <>
            <button class="button" onClick={() => setNewVisible(true)}>
                New version
            </button>
            <Overlay visible={newVisible()} reset={() => setNewVisible(false)}>
                <VersionEditor
                    submit={(version, endOfLife, downloadUrl, loading) =>
                        withQuery(
                            () => actions.version.create({ version, endOfLife, downloadUrl }),
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
