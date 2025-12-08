import Loading, { LoadingContext, type LoadingInterface } from '@glowman554/base-components/src/loading/Loading';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import EditButton from '@glowman554/base-components/src/generic/EditButton';
import { createSignal, Show, useContext } from 'solid-js';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { actions } from 'astro:actions';
import type { FeaturedServer } from '../../actions/featured';
import type { FakeUser } from '../../actions/users';

export type Props =
    | {
          initial?: undefined;
          submit: (username: string, loading: LoadingInterface) => void;
      }
    | {
          initial: FakeUser;
      };

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    const [name, setName] = createSignal(props.initial ? props.initial.username : '');

    const submit = () => {
        if (!props.initial) {
            props.submit(name(), loading);
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
                        <td class="pr-2 text-nowrap">Username</td>
                        <td class="w-full">
                            <input
                                type="text"
                                class="input w-full"
                                value={name()}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!!props.initial}
                                required
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <br />

            <div class="center">
                <Show when={!props.initial}>
                    <button class="button" type="submit">
                        Create
                    </button>
                </Show>

                <Show when={props.initial}>
                    <button class="button" onClick={() => navigator.clipboard.writeText(props.initial!.token)}>
                        Copy token
                    </button>
                </Show>
            </div>
        </form>
    );
}

export default function FakeUserEditor(props: Props) {
    return (
        <Loading initial={false}>
            <div class="field">
                <Wrapped {...props} />
            </div>
        </Loading>
    );
}

export function FakeUserButtons(props: { user: FakeUser }) {
    const [editVisible, setEditVisible] = createSignal(false);

    return (
        <>
            <DeleteButton
                callback={(id, loading) =>
                    withQuery(
                        () => actions.users.delete.orThrow({ username: id }),
                        loading,
                        false,
                        () => location.reload()
                    )
                }
                id={props.user.username}
            />
            <EditButton callback={() => setEditVisible(true)} />
            <Overlay visible={editVisible()} reset={() => setEditVisible(false)}>
                <FakeUserEditor initial={props.user} />
            </Overlay>
        </>
    );
}
