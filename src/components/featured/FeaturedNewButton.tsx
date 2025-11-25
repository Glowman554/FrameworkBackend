import { createSignal } from 'solid-js';
import { actions } from 'astro:actions';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import FeaturedEditor from './FeaturedEditor';

export default function () {
    const [newVisible, setNewVisible] = createSignal(false);
    return (
        <>
            <button class="button" onClick={() => setNewVisible(true)}>
                New featured server
            </button>
            <Overlay visible={newVisible()} reset={() => setNewVisible(false)}>
                <FeaturedEditor
                    submit={(name, address, loading) =>
                        withQuery(
                            () => actions.featured.create({ name, address }),
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
