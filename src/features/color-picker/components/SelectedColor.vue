<script setup lang="ts">
    import { shallowRef } from 'vue';
    import { BaseButton } from 'chrome-extension-component-library';

    defineProps<{
        selectedColor: string;
        copiedFormat: string;
    }>();

    const emit = defineEmits<{
        select: [color: string];
        copy: [color: string];
    }>();

    const isColorPickerOpen = shallowRef(false);

    function selectNativeColor(event: Event) {
        isColorPickerOpen.value = false;
        emit('select', (event.currentTarget as HTMLInputElement).value);
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
                <span class="selected-value" :class="{ 'is-empty': !selectedColor }">{{ selectedColor || 'No color selected' }}</span>
                <BaseButton
                    v-if="selectedColor"
                    variant="secondary"
                    size="small"
                    class="hex-copy"
                    :aria-label="copiedFormat === 'HEX'
                        ? 'HEX value copied to clipboard'
                        : `Copy HEX value ${selectedColor}`"
                    @click="emit('copy', selectedColor)"
                >
                    {{ copiedFormat === 'HEX' ? 'Copied' : 'Copy HEX' }}
                </BaseButton>
            </div>
        </div>
    </section>
</template>

<style scoped>
    .selected-color {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px;
        background: var(--color-editor-bg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-button);
    }

    .selected-summary {
        display: flex;
        align-items: center;
        gap: 14px;
        min-height: 85px;
    }

    .color-preview {
        position: relative;
        flex: 0 0 85px;
        width: 85px;
        height: 85px;
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
        right: 6px;
        bottom: 6px;
        display: grid;
        width: 22px;
        height: 22px;
        place-items: center;
        color: var(--color-white);
        background: var(--color-edit-indicator-bg);
        border: 1px solid var(--color-edit-indicator-border);
        border-radius: 6px;
        pointer-events: none;
    }

    .color-edit-indicator svg {
        width: 12px;
        height: 12px;
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
        gap: 4px;
    }

    .selected-label {
        color: var(--color-text-muted);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
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

    .selected-value.is-empty {
        color: var(--color-text-muted);
        font-size: 12px;
        font-weight: 400;
    }

    .hex-copy {
        align-self: flex-start;
        width: 88px;
    }
</style>
