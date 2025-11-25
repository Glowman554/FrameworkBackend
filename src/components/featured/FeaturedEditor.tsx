import Loading, { LoadingContext, type LoadingInterface } from '@glowman554/base-components/src/loading/Loading';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import EditButton from '@glowman554/base-components/src/generic/EditButton';
import { createSignal, Show, useContext } from 'solid-js';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { actions } from 'astro:actions';
import type { FeaturedServer } from '../../actions/featured';

export type Props =
    | {
          initial?: undefined;
          submit: (name: string, address: string, loading: LoadingInterface) => void;
      }
    | {
          initial: FeaturedServer;
          submit: (name: string, address: string, loading: LoadingInterface, id: number) => void;
      };

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    const [name, setName] = createSignal(props.initial ? props.initial.name : '');
    const [address, setAddress] = createSignal(props.initial ? props.initial.address : '');

    const submit = () => {
        if (props.initial) {
            props.submit(name(), address(), loading, props.initial.id);
        } else {
            props.submit(name(), address(), loading);
        }
    };

    return (
        <form
            on:submit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <table>
                <tbody>
                    <tr>
                        <td class="pr-2 text-nowrap">Name</td>
                        <td class="w-full">
                            <input
                                type="text"
                                class="input w-full"
                                value={name()}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </td>
                    </tr>
                    <tr>
                        <td class="pr-2 text-nowrap">Address</td>
                        <td class="w-full">
                            <input
                                type="text"
                                class="input w-full"
                                value={address()}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <br />

            <div class="center">
                <button class="button" type="submit">
                    <Show when={props.initial} fallback={<>Create</>}>
                        Update
                    </Show>
                </button>
            </div>
        </form>
    );
}

export default function FeaturedEditor(props: Props) {
    return (
        <Loading initial={false}>
            <div class="field">
                <Wrapped {...props} />
            </div>
        </Loading>
    );
}

export function FeaturedEditorButtons(props: { featured: FeaturedServer }) {
    const [editVisible, setEditVisible] = createSignal(false);

    return (
        <>
            <DeleteButton
                callback={(id, loading) =>
                    withQuery(
                        () => actions.featured.delete.orThrow({ id }),
                        loading,
                        false,
                        () => location.reload()
                    )
                }
                id={props.featured.id}
            />
            <EditButton callback={() => setEditVisible(true)} />
            <Overlay visible={editVisible()} reset={() => setEditVisible(false)}>
                <FeaturedEditor
                    initial={props.featured}
                    submit={(name, address, loading, id) =>
                        withQuery(
                            () => actions.featured.update.orThrow({ name, address, id }),
                            loading,
                            false,
                            () => location.reload()
                        )
                    }
                />
            </Overlay>
        </>
    );
}
