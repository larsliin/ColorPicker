import { computed, onUnmounted, readonly, shallowRef } from 'vue';
import { getColorFormats, normalizeHexColor } from './utils/colorFormats';

interface EyeDropperResult {
    sRGBHex: string;
}

interface EyeDropperInstance {
    open(): Promise<EyeDropperResult>;
}

type EyeDropperConstructor = new () => EyeDropperInstance;

const eyeDropper = (window as Window & { EyeDropper?: EyeDropperConstructor }).EyeDropper;
const MAX_RECENT_COLORS = 16;
const EYEDROPPER_RETRY_DELAY_MS = 100;

export function useColorPicker() {
    const selectedColor = shallowRef('');
    const recentColors = shallowRef<string[]>([]);
    const isPicking = shallowRef(false);
    const errorMessage = shallowRef('');
    const copyErrorMessage = shallowRef('');
    const statusMessage = shallowRef('');
    const copiedFormat = shallowRef('');
    const formats = computed(() => (selectedColor.value ? getColorFormats(selectedColor.value) : []));
    const isEyeDropperAvailable = typeof eyeDropper === 'function';
    let copyFeedbackTimeout: ReturnType<typeof setTimeout> | undefined;
    let hasInteracted = false;
    let storageLoaded = false;
    let pendingHistoryColors: string[] = [];
    let persistenceQueue = Promise.resolve();

    function getExtensionStorage() {
        if (typeof chrome === 'undefined' || !chrome.storage?.local) {
            return null;
        }

        const localStorage = chrome.storage.local;
        return {
            get(keys: string[]) {
                return localStorage.get(keys) as Promise<Record<string, unknown>>;
            },
            set(items: Record<string, unknown>) {
                return localStorage.set(items) as Promise<void>;
            },
        };
    }

    function normalizeHistory(value: unknown): string[] {
        if (!Array.isArray(value)) {
            return [];
        }

        const colors: string[] = [];
        for (const entry of value) {
            const color = normalizeHexColor(entry);
            if (color && !colors.includes(color)) {
                colors.push(color);
            }

            if (colors.length === MAX_RECENT_COLORS) {
                break;
            }
        }

        return colors;
    }

    function addToHistory(history: string[], color: string): string[] {
        return [color, ...history.filter((item) => item !== color)].slice(0, MAX_RECENT_COLORS);
    }

    const storageReady = (async () => {
        const storage = getExtensionStorage();
        if (!storage) {
            errorMessage.value = 'Extension storage is unavailable. Open this popup from Chrome.';
            storageLoaded = true;
            return;
        }

        try {
            const result = await storage.get(['lastColor', 'colorHistory']);
            const lastColor = result.lastColor === undefined
                ? ''
                : normalizeHexColor(result.lastColor);
            if (result.lastColor !== undefined && !lastColor) {
                throw new Error('The saved color is not a valid HEX value.');
            }

            const savedHistory = normalizeHistory(result.colorHistory);
            const initialHistory = savedHistory.length > 0
                ? savedHistory
                : (lastColor ? [lastColor] : []);
            if (!hasInteracted) {
                selectedColor.value = lastColor || '';
                recentColors.value = initialHistory;
            } else {
                recentColors.value = initialHistory;
                for (const color of pendingHistoryColors) {
                    recentColors.value = addToHistory(recentColors.value, color);
                }
            }
        } catch (error) {
            console.error('Failed to load saved colors:', error);
            errorMessage.value = 'Could not load your saved colors from extension storage.';
        } finally {
            storageLoaded = true;
        }
    })();

    onUnmounted(() => {
        clearTimeout(copyFeedbackTimeout);
    });

    function persistColors() {
        persistenceQueue = persistenceQueue.then(async () => {
            await storageReady;
            const storage = getExtensionStorage();
            if (!storage) {
                throw new Error('Extension storage is unavailable.');
            }

            await storage.set({
                lastColor: selectedColor.value,
                colorHistory: recentColors.value,
            });
        }).then(() => {
            errorMessage.value = '';
        }).catch((error: unknown) => {
            console.error('Failed to save color history:', error);
            errorMessage.value = 'Color selected, but could not save your color history.';
        });
    }

    function setSelectedColor(value: string, recordInHistory: boolean) {
        const color = normalizeHexColor(value);
        if (!color) {
            return;
        }

        hasInteracted = true;
        clearTimeout(copyFeedbackTimeout);
        copiedFormat.value = '';
        if (recordInHistory) {
            if (!storageLoaded) {
                pendingHistoryColors.push(color);
                if (pendingHistoryColors.length > MAX_RECENT_COLORS) {
                    pendingHistoryColors = pendingHistoryColors.slice(-MAX_RECENT_COLORS);
                }
            }
            recentColors.value = addToHistory(recentColors.value, color);
        }
        selectedColor.value = color;
        errorMessage.value = '';
        copyErrorMessage.value = '';
        statusMessage.value = '';
        persistColors();
    }

    function selectColor(value: string) {
        setSelectedColor(value, true);
    }

    function updateSelectedColor(value: string) {
        setSelectedColor(value, false);
    }

    function selectRecentColor(value: string) {
        setSelectedColor(value, false);
    }

    async function openEyeDropper(EyeDropperApi: EyeDropperConstructor): Promise<EyeDropperResult> {
        try {
            return await new EyeDropperApi().open();
        } catch (error) {
            if (!(error instanceof DOMException) || error.name !== 'OperationError') {
                throw error;
            }

            // Unconfirmed workaround. Chrome reports OperationError ("EyeDropper is not available")
            // when its browser process drops the chooser request, which can happen even though the
            // page still reports user activation. Waiting briefly and retrying once, within the same
            // gesture, covers the case where the browser had not yet registered that activation.
            // Cancellation (AbortError) and missing activation (NotAllowedError) are never retried.
            await new Promise((resolve) => setTimeout(resolve, EYEDROPPER_RETRY_DELAY_MS));
            return await new EyeDropperApi().open();
        }
    }

    async function pickColor() {
        if (isPicking.value) {
            return;
        }

        errorMessage.value = '';
        copyErrorMessage.value = '';
        statusMessage.value = '';

        if (!eyeDropper) {
            errorMessage.value = 'Color picking is unavailable. Use a recent desktop version of Chrome.';
            return;
        }

        // Chrome grants user activation on press and expires it after ~5 seconds, so a long press
        // reaches this click without it and EyeDropper.open() would reject. Treat it as a cancelled press.
        if (navigator.userActivation && !navigator.userActivation.isActive) {
            statusMessage.value = 'Press was held too long. Click again to pick a color.';
            return;
        }

        isPicking.value = true;

        try {
            const result = await openEyeDropper(eyeDropper);
            const color = normalizeHexColor(result.sRGBHex);
            if (!color) {
                throw new Error('The eyedropper returned an invalid color.');
            }

            selectColor(color);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                statusMessage.value = 'Color selection cancelled.';
                return;
            }

            console.error('Failed to pick a color:', error);
            errorMessage.value = error instanceof DOMException && error.name === 'OperationError'
                ? 'Chrome could not open the color picker. Please click Pick to try again.'
                : 'Could not pick a color. Please try again.';
        } finally {
            isPicking.value = false;
        }
    }

    async function copyFormat(name: string, value: string) {
        copyErrorMessage.value = '';
        clearTimeout(copyFeedbackTimeout);

        try {
            await navigator.clipboard.writeText(value);
            copiedFormat.value = name;
            copyFeedbackTimeout = setTimeout(() => {
                copiedFormat.value = '';
            }, 1200);
        } catch (error) {
            clearTimeout(copyFeedbackTimeout);
            copiedFormat.value = '';
            console.error(`Failed to copy the ${name} color:`, error);
            copyErrorMessage.value = `Could not copy the ${name} value to the clipboard.`;
        }
    }

    return {
        copiedFormat: readonly(copiedFormat),
        copyFormat,
        copyErrorMessage: readonly(copyErrorMessage),
        errorMessage: readonly(errorMessage),
        formats,
        isEyeDropperAvailable,
        isPicking: readonly(isPicking),
        pickColor,
        recentColors: readonly(recentColors),
        selectColor,
        selectRecentColor,
        selectedColor: readonly(selectedColor),
        statusMessage: readonly(statusMessage),
        updateSelectedColor,
    };
}
