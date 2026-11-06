<script setup lang="ts">
    import { computed, shallowRef } from 'vue';
    import BaseAlert from '@/components/base/BaseAlert.vue';
    import BaseButton from '@/components/base/BaseButton.vue';
    import ColorFormatList from './components/ColorFormatList.vue';
    import EyeDropperIcon from './components/EyeDropperIcon.vue';
    import RecentColors from './components/RecentColors.vue';
    import { useColorPicker } from './useColorPicker';

    const {
        copiedFormat,
        copyFormat,
        copyErrorMessage,
        errorMessage,
        formats,
        isEyeDropperAvailable,
        isPicking,
        pickColor,
        recentColors,
        selectColor,
        selectRecentColor,
        selectedColor,
        statusMessage,
    } = useColorPicker();

    const secondaryFormats = computed(() => formats.value.filter((format) => format.name !== 'HEX'));
    const isColorPickerOpen = shallowRef(false);

    function selectNativeColor(event: Event) {
        isColorPickerOpen.value = false;
        selectColor((event.currentTarget as HTMLInputElement).value);
    }

    function toggleColorPicker(event: MouseEvent) {
        if (!isColorPickerOpen.value) {
            isColorPickerOpen.value = true;
            return;
        }

        event.preventDefault();
        (event.currentTarget as HTMLInputElement).blur();
        isColorPickerOpen.value = false;
    }

    function closeColorPicker() {
        isColorPickerOpen.value = false;
    }
</script>

<template>
    <main class="popup-shell">
        <header class="popup-header">
            <h1>Color Picker</h1>
        </header>

        <section class="popup-content" aria-label="Color picker">
            <BaseAlert
                v-if="!isEyeDropperAvailable"
                variant="warning"
                message="Color picking requires a recent desktop version of Chrome."
            />
            <BaseAlert v-if="errorMessage" :message="errorMessage" />
            <BaseAlert v-if="copyErrorMessage" :message="copyErrorMessage" />

            <BaseButton
                class="pick-button"
                :class="{ 'is-picking': isPicking }"
                :disabled="isPicking || !isEyeDropperAvailable"
                :aria-label="isPicking ? 'Picking a color from the screen' : 'Pick a color from the screen'"
                :title="isPicking ? 'Picking color…' : 'Start screen-wide color picker'"
                @click="pickColor"
            >
                <span class="pick-icon" aria-hidden="true">
                    <EyeDropperIcon />
                </span>
                <span class="pick-copy">
                    <span class="pick-title">{{ isPicking ? 'Picking from screen' : 'Pick a color from screen' }}</span>
                    <span class="pick-caption">
                        {{
                            isPicking
                                ? 'Select a pixel anywhere · Press Escape to cancel'
                                : isEyeDropperAvailable
                                    ? 'Click to start · Select any pixel, even outside Chrome'
                                    : 'Unavailable in this version of Chrome'
                        }}
                    </span>
                </span>
            </BaseButton>

            <p
                v-if="isPicking || statusMessage"
                class="status-message"
                :class="{ 'status-message-picking': isPicking }"
                role="status"
                aria-live="polite"
            >
                {{
                    isPicking
                        ? 'Picking a color—select any pixel on your screen. Press Escape to cancel.'
                        : statusMessage
                }}
            </p>

            <div class="selection-layout">
                <section class="selected-color" aria-label="Selected color">
                    <div class="selected-summary">
                        <label
                            class="color-preview"
                            :title="selectedColor ? 'Edit selected color' : 'Choose a color'"
                        >
                            <input
                                class="color-picker-input"
                                type="color"
                                :value="selectedColor || '#000000'"
                                :aria-label="selectedColor
                                    ? `Change selected color, currently ${selectedColor}`
                                    : 'Choose a color; no color currently selected'"
                                :aria-expanded="isColorPickerOpen"
                                @click="toggleColorPicker"
                                @blur="closeColorPicker"
                                @cancel="closeColorPicker"
                                @keydown.esc="closeColorPicker"
                                @change="selectNativeColor"
                            />
                            <span
                                class="color-preview-swatch"
                                :class="{ 'no-color': !selectedColor }"
                                :style="selectedColor ? { backgroundColor: selectedColor } : undefined"
                                aria-hidden="true"
                            />
                            <span class="color-edit-indicator" aria-hidden="true">
                                <svg viewBox="0 0 16 16" fill="none">
                                    <path
                                        d="m10.5 2.5 3 3M2.5 13.5l.8-3.1L10.8 2.9a1.2 1.2 0 0 1 1.7 0l.6.6a1.2 1.2 0 0 1 0 1.7l-7.5 7.5-3.1.8Z"
                                        stroke="currentColor"
                                        stroke-width="1.4"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </span>
                        </label>
                        <div class="selected-copy">
                            <span class="selected-label">Current color · HEX</span>
                            <div class="selected-value-row">
                                <span class="selected-value">{{ selectedColor || 'No color selected' }}</span>
                                <button
                                    v-if="selectedColor"
                                    type="button"
                                    class="hex-copy"
                                    :aria-label="copiedFormat === 'HEX'
                                        ? 'HEX value copied to clipboard'
                                        : `Copy HEX value ${selectedColor}`"
                                    @click="copyFormat('HEX', selectedColor)"
                                >
                                    {{ copiedFormat === 'HEX' ? 'Copied' : 'Copy' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <RecentColors
                    :colors="recentColors"
                    :selected-color="selectedColor"
                    @select="selectRecentColor"
                />

                <ColorFormatList
                    v-if="selectedColor"
                    :formats="secondaryFormats"
                    :copied-format="copiedFormat"
                    @copy="copyFormat($event.name, $event.value)"
                />
                <div v-else class="empty-state">
                    <p class="empty-title">No color selected yet</p>
                    <p class="empty-description">Use the eyedropper or choose a recent color to see RGB and HSL.</p>
                </div>
            </div>
        </section>
    </main>
</template>

<style scoped>
    .popup-shell {
        display: flex;
        flex-direction: column;
        width: 100%;
        background: var(--color-bg);
    }

    .popup-header {
        display: flex;
        align-items: center;
        margin: 12px 16px 0;
        padding: 0 0 10px;
        border-bottom: 1px solid var(--color-border);
    }

    .popup-header h1 {
        color: var(--color-text);
        font-size: 17px;
        font-weight: 600;
        line-height: 1.3;
    }

    .popup-content {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 14px 16px;
    }

    .empty-state {
        min-height: 64px;
        display: grid;
        place-items: start center;
        align-content: center;
        gap: 4px;
        padding: 10px 12px;
        text-align: center;
    }

    .empty-title {
        color: var(--color-text);
        font-size: 12px;
        font-weight: 600;
    }

    .empty-description {
        color: var(--color-text-muted);
        font-size: 11px;
    }

    .selection-layout {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .selected-color {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: var(--color-editor-bg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-button);
    }

    .selected-summary {
        display: flex;
        align-items: center;
        gap: 14px;
        min-height: 60px;
    }

    .color-preview {
        position: relative;
        flex: 0 0 60px;
        width: 60px;
        height: 60px;
        cursor: pointer;
    }

    .color-picker-input {
        position: absolute;
        inset: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        margin: 0;
        border: 0;
        opacity: 0;
        cursor: pointer;
    }

    .color-preview-swatch {
        display: block;
        width: 100%;
        height: 100%;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-button);
    }

    .color-preview-swatch.no-color {
        background: var(--color-hover);
    }

    .color-edit-indicator {
        position: absolute;
        right: 4px;
        bottom: 4px;
        display: grid;
        width: 20px;
        height: 20px;
        place-items: center;
        color: #fff;
        background: rgb(0 0 0 / 52%);
        border: 1px solid rgb(255 255 255 / 64%);
        border-radius: 6px;
        pointer-events: none;
    }

    .color-edit-indicator svg {
        width: 11px;
        height: 11px;
    }

    .color-picker-input:focus-visible + .color-preview-swatch {
        outline: 2px solid var(--color-focus);
        outline-offset: 3px;
    }

    .selected-copy {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .selected-label {
        color: var(--color-text-muted);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    .selected-value-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .selected-value {
        min-width: 0;
        overflow: hidden;
        color: var(--color-text);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 22px;
        font-weight: 700;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .pick-button {
        width: 100%;
        min-height: 82px;
        justify-content: flex-start;
        gap: 14px;
        padding: 12px 16px;
        color: #fff;
        text-align: left;
        background: var(--color-accent);
        border: 1px solid var(--color-accent);
        border-radius: var(--radius-button);
        box-shadow: 0 3px 8px rgb(0 0 0 / 18%);
    }

    .pick-button.pick-button:hover:not(:disabled) {
        filter: brightness(1.08);
    }

    .pick-button.pick-button:active:not(:disabled) {
        filter: brightness(0.94);
    }

    .pick-button.pick-button:disabled {
        color: var(--color-text-muted);
        background: var(--color-button-secondary);
        border-color: var(--color-button-secondary-border);
        box-shadow: none;
        opacity: 1;
    }

    .pick-button.pick-button.is-picking:disabled {
        color: #fff;
        background: var(--color-accent);
        border-color: var(--color-accent);
        opacity: 1;
    }

    .pick-button.pick-button:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 3px;
    }

    .pick-icon {
        flex: 0 0 48px;
        display: grid;
        width: 48px;
        height: 48px;
        place-items: center;
        background: rgb(255 255 255 / 16%);
        border: 1px solid rgb(255 255 255 / 42%);
        border-radius: 14px;
    }

    .pick-icon :deep(svg) {
        width: 24px;
        height: 24px;
    }

    .pick-copy {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 3px;
    }

    .pick-title {
        font-size: 15px;
        font-weight: 700;
        line-height: 1.25;
    }

    .pick-caption {
        color: rgb(255 255 255 / 88%);
        font-size: 11px;
        font-weight: 500;
        line-height: 1.35;
    }

    .pick-button:disabled .pick-icon {
        color: var(--color-text-muted);
        background: var(--color-hover);
        border-color: var(--color-border);
    }

    .pick-button.is-picking:disabled .pick-icon {
        color: #fff;
        background: rgb(255 255 255 / 16%);
        border-color: rgb(255 255 255 / 42%);
    }

    .pick-button:disabled .pick-caption {
        color: var(--color-text-muted);
    }

    .pick-button.is-picking:disabled .pick-caption {
        color: rgb(255 255 255 / 88%);
    }

    .status-message {
        padding: 7px 10px;
        color: var(--color-text-muted);
        font-size: 12px;
        background: var(--color-editor-bg);
        border-left: 3px solid var(--color-border);
        border-radius: var(--radius-button);
    }

    .status-message-picking {
        color: var(--color-text);
        background: var(--color-hover);
        border-left-color: var(--color-accent);
    }

    .hex-copy {
        flex: 0 0 auto;
        width: 64px;
        min-height: 32px;
        padding: 5px 9px;
        color: var(--color-accent);
        font-size: 11px;
        font-weight: 700;
        background: transparent;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-button);
        cursor: pointer;
    }

    .hex-copy:hover {
        background: var(--color-hover);
    }

    .hex-copy:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
    }
</style>
