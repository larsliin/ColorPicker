<script setup lang="ts">
    import { computed, ref } from 'vue';
    import BaseButton from '@/components/base/BaseButton.vue';
    import BaseSelect from '@/components/base/BaseSelect.vue';
    import type { SchemeMode } from '../utils/colorPalette';
    import { generateColorScheme } from '../utils/colorPalette';
    import { getContrastColor } from '../utils/colorFormats';

    interface Props {
        selectedColor: string;
        copiedFormat: string;
    }

    interface Emits {
        copy: [color: string];
        copyAll: [colors: string];
    }

    const props = defineProps<Props>();
    const emit = defineEmits<Emits>();

    const selectedMode = ref<SchemeMode>('triad');
    const paletteColors = computed(() => generateColorScheme(props.selectedColor, selectedMode.value));
    const displayColors = computed(() => paletteColors.value.map((hex) => ({
        hex,
        overlayColor: getContrastColor(hex),
    })));

    const schemeOptions: Array<{ value: SchemeMode; label: string }> = [
        { value: 'monochrome', label: 'Monochrome' },
        { value: 'monochrome-dark', label: 'Monochrome Dark' },
        { value: 'monochrome-light', label: 'Monochrome Light' },
        { value: 'analogic', label: 'Analogous' },
        { value: 'complement', label: 'Complement' },
        { value: 'analogic-complement', label: 'Analogic Complement' },
        { value: 'triad', label: 'Triadic' },
        { value: 'quad', label: 'Quadratic' },
    ];

    function isCopied(color: string) {
        return props.copiedFormat === color;
    }

    function copyAllColors() {
        const hexList = paletteColors.value.join(', ');
        emit('copyAll', hexList);
    }

</script>

<template>
    <div class="palette-generator">
        <div class="palette-controls">
            <label for="scheme-mode" class="palette-label">Theme:</label>
            <div class="palette-select">
                <BaseSelect id="scheme-mode" v-model="selectedMode">
                    <option v-for="option in schemeOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </BaseSelect>
            </div>
        </div>

        <div class="palette-container">
            <div class="palette-bar">
                <div
                    v-for="(color, index) in displayColors"
                    :key="`${color.hex}-${index}`"
                    class="palette-color"
                    :style="{ backgroundColor: color.hex, color: color.overlayColor }"
                >
                    <BaseButton
                        variant="bare"
                        class="palette-copy-btn"
                        :title="color.hex"
                        :aria-label="isCopied(color.hex)
                            ? `${color.hex} copied to clipboard`
                            : `Copy ${color.hex}`"
                        @click="emit('copy', color.hex)"
                    >
                        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path
                                v-if="isCopied(color.hex)"
                                d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"
                            />
                            <path
                                v-else
                                fill-rule="evenodd"
                                d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                            />
                        </svg>
                        <span class="palette-color-hex" aria-hidden="true">{{ color.hex }}</span>
                    </BaseButton>
                </div>
            </div>

            <div class="palette-actions">
                <BaseButton variant="outline" aria-live="polite" @click="copyAllColors">
                    {{ copiedFormat === 'Theme' ? 'Colors copied' : 'Copy all colors' }}
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .palette-generator {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0;
        padding-top: var(--section-spacing);
        border-top: 1px solid var(--color-border);
    }

    .palette-controls {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .palette-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
    }

    .palette-select {
        flex: 1;
        min-width: 0;
    }

    .palette-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .palette-bar {
        position: relative;
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.5rem;
        flex-shrink: 0;
    }

    .palette-color {
        position: relative;
        min-width: 0;
        aspect-ratio: 1;
        border: 1px solid var(--color-swatch-border);
        border-radius: var(--radius-button);
    }

    .palette-copy-btn {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 100%;
        height: 100%;
        padding: 0;
        color: inherit;
        background: transparent;
        border: 0;
        border-radius: inherit;
        cursor: pointer;
    }

    .palette-copy-btn svg {
        flex: 0 0 auto;
        width: 14px;
        height: 14px;
    }

    .palette-copy-btn:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
    }

    .palette-color-hex {
        flex: 0 0 auto;
        padding: 1px 2px;
        color: inherit;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 10px;
        font-weight: 600;
        line-height: 1.2;
        white-space: nowrap;
        pointer-events: none;
    }

    @media (hover: hover) {
        .palette-copy-btn svg,
        .palette-color-hex {
            opacity: 0;
        }

        .palette-copy-btn:hover svg,
        .palette-copy-btn:hover .palette-color-hex,
        .palette-copy-btn:focus-visible svg,
        .palette-copy-btn:focus-visible .palette-color-hex {
            opacity: 1;
        }
    }

    .palette-actions {
        display: flex;
        justify-content: flex-end;
    }

</style>
