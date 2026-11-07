<script setup lang="ts">
    import { computed, ref, watch } from 'vue';
    import BaseAlert from '@/components/base/BaseAlert.vue';
    import BaseButton from '@/components/base/BaseButton.vue';
    import BaseSelect from '@/components/base/BaseSelect.vue';
    import { useColorSchemeApi, type SchemeMode } from '../composables/useColorSchemeApi';
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

    const { fetchScheme, colors, isLoading, error } = useColorSchemeApi();
    const paletteColors = computed(() => colors.value.map((color) => ({
        ...color,
        overlayColor: getContrastColor(color.hex.value),
    })));

    const selectedMode = ref<SchemeMode>('triad');
    const schemeOptions: Array<{ value: SchemeMode; label: string; description: string }> = [
        { value: 'monochrome', label: 'Monochrome', description: 'Single color, different shades' },
        { value: 'monochrome-dark', label: 'Monochrome Dark', description: 'Dark tones of single color' },
        { value: 'monochrome-light', label: 'Monochrome Light', description: 'Light tones of single color' },
        { value: 'analogic', label: 'Analogous', description: 'Colors next to each other' },
        { value: 'complement', label: 'Complement', description: 'Opposite colors on color wheel' },
        { value: 'analogic-complement', label: 'Analogic Complement', description: 'Mix of analogous & complement' },
        { value: 'triad', label: 'Triadic', description: 'Three colors evenly spaced' },
        { value: 'quad', label: 'Quadratic', description: 'Four colors, cool & warm balance' },
    ];

    watch([() => props.selectedColor, selectedMode], ([color, mode], _previous, onCleanup) => {
        const controller = new AbortController();
        onCleanup(() => controller.abort());
        void fetchScheme(color, mode, 5, controller.signal);
    }, { immediate: true });

    function isCopied(color: string) {
        return props.copiedFormat === color;
    }

    function copyAllColors() {
        if (colors.value.length === 0) return;

        const hexList = colors.value.map((c) => c.hex.value).join(', ');
        emit('copyAll', hexList);
    }

</script>

<template>
    <div class="palette-generator">
        <BaseAlert v-if="error" :message="`Theme generation failed: ${error}`" />

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
            <div class="palette-bar" :aria-busy="isLoading">
                <template v-if="colors.length">
                    <div
                        v-for="(color, index) in paletteColors"
                        :key="`${color.hex.value}-${index}`"
                        class="palette-color"
                        :style="{ backgroundColor: color.hex.value, color: color.overlayColor }"
                    >
                        <BaseButton
                            variant="bare"
                            class="palette-copy-btn"
                            :title="color.name.value"
                            :aria-label="isCopied(color.hex.value)
                                ? `${color.hex.value} copied to clipboard`
                                : `Copy ${color.hex.value}`"
                            @click="emit('copy', color.hex.value)"
                        >
                            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                <path
                                    v-if="isCopied(color.hex.value)"
                                    d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"
                                />
                                <path
                                    v-else
                                    fill-rule="evenodd"
                                    d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                                />
                            </svg>
                            <span class="palette-color-hex" aria-hidden="true">{{ color.hex.value }}</span>
                        </BaseButton>
                    </div>
                </template>
                <template v-else>
                    <div v-for="index in 5" :key="index" class="palette-placeholder" aria-hidden="true" />
                </template>
                <div v-if="isLoading" class="palette-loading" role="status">
                    <span class="spinner" aria-hidden="true"></span>
                    Generating theme...
                </div>
            </div>

            <div class="palette-actions">
                <BaseButton variant="outline" :disabled="isLoading || !colors.length" aria-live="polite" @click="copyAllColors">
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
        padding-top: 10px;
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

    .palette-loading {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        gap: 6px;
        justify-content: center;
        font-size: 12px;
        color: var(--color-text);
    }

    .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid var(--color-border);
        border-top-color: var(--color-text);
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
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

    .palette-color,
    .palette-placeholder {
        min-width: 0;
        aspect-ratio: 1;
        border-radius: var(--radius-button);
    }

    .palette-placeholder {
        background: var(--color-editor-bg);
        border: 1px solid var(--color-border);
    }

    .palette-color {
        position: relative;
        border: 1px solid rgb(0 0 0 / 20%);
    }

    .palette-copy-btn {
        position: absolute;
        inset: 0;
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
        position: absolute;
        top: 50%;
        left: 50%;
        width: 14px;
        height: 14px;
        transform: translate(-50%, -50%);
    }

    .palette-copy-btn:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
    }

    .palette-color-hex {
        position: absolute;
        left: 50%;
        bottom: 4px;
        padding: 1px 2px;
        color: inherit;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 10px;
        font-weight: 600;
        line-height: 1.2;
        transform: translateX(-50%);
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
