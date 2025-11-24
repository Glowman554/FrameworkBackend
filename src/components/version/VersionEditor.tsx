import Loading, { LoadingContext, type LoadingInterface } from '@glowman554/base-components/src/loading/Loading';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import EditButton from '@glowman554/base-components/src/generic/EditButton';
import type { Version } from '../../actions/version';
import { createSignal, Show, useContext } from 'solid-js';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { actions } from 'astro:actions';
import UploadButton from '../UploadButton';

export type Props =
    | {
          initial?: undefined;
          submit: (version: string, endOfLife: boolean, downloadUrl: string, loading: LoadingInterface) => void;
      }
    | {
          initial: Version;
          submit: (endOfLife: boolean, downloadUrl: string, loading: LoadingInterface, version: string) => void;
      };

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    const [version, setVersion] = createSignal(props.initial?.version || '');
    const [endOfLife, setEndOfLife] = createSignal(props.initial?.endOfLife || false);
    const [downloadUrl, setDownloadUrl] = createSignal(props.initial?.downloadUrl || '');

    const submit = () => {
        if (props.initial) {
            props.submit(endOfLife(), downloadUrl(), loading, props.initial.version);
        } else {
            props.submit(version(), endOfLife(), downloadUrl(), loading);
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
                        <td class="pr-2 text-nowrap">Version</td>
                        <td class="w-full">
                            <input
                                type="text"
                                class="input w-full"
                                value={version()}
                                onChange={(e) => setVersion(e.target.value)}
                                disabled={!!props.initial}
                                required
                            />
                        </td>
                    </tr>
                    <tr>
                        <td class="pr-2 text-nowrap">Download URL</td>
                        <td class="w-full">
                            <input
                                type="text"
                                class="input w-full"
                                value={downloadUrl()}
                                onChange={(e) => setDownloadUrl(e.target.value)}
                                required
                            />
                        </td>
                    </tr>
                    <tr>
                        <td class="pr-2 text-nowrap">End of life</td>
                        <td class="w-full">
                            <input
                                type="checkbox"
                                class="checkbox"
                                checked={endOfLife()}
                                onChange={(e) => setEndOfLife(e.currentTarget.checked)}
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
                <UploadButton callback={setDownloadUrl} />
            </div>
        </form>
    );
}

export default function VersionEditor(props: Props) {
    return (
        <Loading initial={false}>
            <div class="field">
                <Wrapped {...props} />
            </div>
        </Loading>
    );
}

export function VersionEditorButtons(props: { version: Version }) {
    const [editVisible, setEditVisible] = createSignal(false);

    return (
        <>
            <DeleteButton
                callback={(id, loading) =>
                    withQuery(
                        () => actions.version.delete.orThrow({ version: id }),
                        loading,
                        false,
                        () => location.reload()
                    )
                }
                id={props.version.version}
            />
            <EditButton callback={() => setEditVisible(true)} />
            <Overlay visible={editVisible()} reset={() => setEditVisible(false)}>
                <VersionEditor
                    initial={props.version}
                    submit={(endOfLife, downloadUrl, loading, version) =>
                        withQuery(
                            () => actions.version.update.orThrow({ endOfLife, version, downloadUrl }),
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
