<script setup lang="ts">
    import { computed } from 'vue';
    import BaseAlert from '@/components/base/BaseAlert.vue';
    import BaseButton from '@/components/base/BaseButton.vue';
    import ColorFormatList from './components/ColorFormatList.vue';
    import ColorPaletteGenerator from './components/ColorPaletteGenerator.vue';
    import EyeDropperIcon from './components/EyeDropperIcon.vue';
    import RecentColors from './components/RecentColors.vue';
    import SelectedColor from './components/SelectedColor.vue';
    import { useColorPicker } from './useColorPicker';

    const {
        copiedFormat,
        copyFormat,
        copyErrorMessage,
        errorMessage,
        formats,
        isEyeDropperAvailable,
        isPicking,
        logPickInput,
        pickColor,
        recentColors,
        selectColor,
        selectRecentColor,
        selectedColor,
        statusMessage,
    } = useColorPicker();

    const secondaryFormats = computed(() => formats.value.filter((format) => format.name !== 'HEX'));
</script>

<template>
    <main class="popup-shell">
        <header class="popup-header">
            <h1>Color Picker</h1>
        </header>

        <section class="popup-content" aria-label="Color picker">
            <BaseAlert
                v-if="!isPicking && !isEyeDropperAvailable"
                variant="warning"
                message="Color picking requires a recent desktop version of Chrome."
            />
            <BaseAlert v-if="!isPicking && errorMessage" :message="errorMessage" />
            <BaseAlert v-if="!isPicking && copyErrorMessage" :message="copyErrorMessage" />

            <BaseButton
                class="pick-button"
                :disabled="isPicking || !isEyeDropperAvailable"
                :aria-label="isPicking ? 'Picking a color from the screen' : 'Pick a color from the screen'"
                :title="isPicking ? 'Picking color…' : 'Start screen-wide color picker'"
                @pointerdown="logPickInput"
                @mousedown="logPickInput"
                @pointerup="logPickInput"
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

            <p class="visually-hidden" role="status" aria-live="polite">
                {{ isPicking ? 'Color picker active. Select a pixel or press Escape to cancel.' : statusMessage }}
            </p>

            <div v-show="!isPicking" class="selection-layout" :class="{ 'empty-state-layout': !selectedColor }">
                <SelectedColor
                    :selected-color="selectedColor"
                    :copied-format="copiedFormat"
                    @select="selectColor"
                    @copy="copyFormat('HEX', $event)"
                />

                <template v-if="selectedColor">
                    <ColorFormatList
                        :formats="secondaryFormats"
                        :copied-format="copiedFormat"
                        @copy="copyFormat($event.name, $event.value)"
                    />

                    <ColorPaletteGenerator
                        :selected-color="selectedColor"
                        :copied-format="copiedFormat"
                        @copy="copyFormat($event, $event)"
                        @copy-all="copyFormat('Theme', $event)"
                    />
                </template>
                <div v-else class="empty-state">
                    <p class="empty-state-message">Pick your first color to get started</p>
                </div>

                <RecentColors
                    v-if="selectedColor || recentColors.length > 0"
                    :colors="recentColors"
                    :selected-color="selectedColor"
                    @select="selectRecentColor"
                />
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
        margin: 8px 16px 0;
        padding: 0 0 8px;
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
        gap: 8px;
        padding: 10px 16px 16px;
    }

    .empty-state {
        text-align: center;
        padding: 16px 12px;
    }

    .empty-state-message {
        margin: 0;
        color: var(--color-text-muted);
        font-size: 13px;
        line-height: 1.4;
    }

    .empty-state-layout {
        opacity: 0.6;
    }

    .selection-layout {
        --section-spacing: 8px;

        display: flex;
        flex-direction: column;
        gap: var(--section-spacing);
    }

    .pick-button {
        --pick-surface-direction: 180deg;
        --pick-surface:
            radial-gradient(ellipse 80% 55% at 50% 108%, var(--color-pick-bounce), transparent 80%),
            linear-gradient(
                var(--pick-surface-direction),
                var(--color-pick-gradient-start) 0%,
                var(--color-pick-gradient-middle) 48%,
                var(--color-pick-gradient-end) 100%
            );
        --pick-shadow:
            inset 0 1px 0 var(--color-pick-highlight),
            inset 0 -3px 0 var(--color-pick-shadow-active),
            inset 1px 0 0 var(--color-pick-shadow-inset),
            inset -1px 0 0 var(--color-pick-shadow-inset);

        position: relative;
        width: 100%;
        min-height: 72px;
        justify-content: flex-start;
        gap: 14px;
        padding: 12px 16px;
        color: var(--color-white);
        text-align: left;
        text-shadow: 0 1px 2px var(--color-pick-text-shadow);
        background: var(--pick-surface);
        border: 1px solid var(--color-pick-border);
        border-radius: 6px;
        box-shadow: var(--pick-shadow);
        transition: box-shadow 100ms ease-out, filter 100ms ease-out;
        overflow: hidden;
    }

    .pick-button::before {
        content: '';
        position: absolute;
        top: 2px;
        right: 2px;
        left: 2px;
        height: 46%;
        background: linear-gradient(
            180deg,
            var(--color-pick-gloss-start) 0%,
            var(--color-pick-gloss-end) 100%
        );
        border-radius: 4px 4px 50% 50% / 4px 4px 12px 12px;
        box-shadow: inset 0 1px 0 var(--color-pick-gloss-start);
        pointer-events: none;
    }

    .pick-button.pick-button:hover:not(:disabled) {
        background: var(--pick-surface);
        border-color: var(--color-pick-border);
        filter: brightness(1.05);
    }

    .pick-button.pick-button:active:not(:disabled) {
        --pick-surface-direction: 0deg;

        background: var(--pick-surface);
        border-color: var(--color-pick-border);
        box-shadow:
            inset 0 1px 0 var(--color-pick-shadow-active),
            inset 0 4px 8px var(--color-pick-shadow-active),
            inset 0 -1px 0 var(--color-pick-highlight-active),
            inset 1px 0 0 var(--color-pick-shadow-inset),
            inset -1px 0 0 var(--color-pick-shadow-inset);
        filter: brightness(0.96);
    }

    .pick-button:active:not(:disabled)::before {
        top: auto;
        bottom: 2px;
        height: 30%;
        background: linear-gradient(
            0deg,
            var(--color-pick-gloss-start) 0%,
            var(--color-pick-gloss-end) 100%
        );
        border-radius: 50% 50% 4px 4px / 12px 12px 4px 4px;
        box-shadow: inset 0 -1px 0 var(--color-pick-gloss-start);
        opacity: 0.7;
    }

    .pick-button:active:not(:disabled) .pick-icon {
        background-image: linear-gradient(0deg, var(--color-pick-icon-sheen) 0%, transparent 100%);
        box-shadow:
            inset 0 2px 3px var(--color-pick-shadow-active),
            inset 0 -1px 0 var(--color-pick-icon-border);
    }

    .pick-button.pick-button:disabled {
        --color-pick-gloss-start: var(--color-pick-disabled-gloss-start);
        --color-pick-gloss-end: var(--color-pick-disabled-gloss-end);

        color: var(--color-pick-disabled-text);
        background:
            radial-gradient(ellipse 80% 55% at 50% 108%, var(--color-pick-disabled-bounce), transparent 80%),
            linear-gradient(
                180deg,
                color-mix(in srgb, var(--color-pick-disabled-bg), white 10%) 0%,
                var(--color-pick-disabled-bg) 40%,
                color-mix(in srgb, var(--color-pick-disabled-bg), black 4%) 52%,
                color-mix(in srgb, var(--color-pick-disabled-bg), black 9%) 100%
            );
        border-color: var(--color-pick-disabled-border);
        box-shadow: var(--pick-shadow);
        opacity: 1;
        text-shadow: none;
    }

    .pick-button.pick-button:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 3px;
    }

    @media (prefers-reduced-motion: reduce) {
        .pick-button {
            transition: none;
        }
    }

    .pick-icon {
        flex: 0 0 48px;
        display: grid;
        width: 48px;
        height: 48px;
        place-items: center;
        background-color: var(--color-pick-icon-bg);
        background-image: linear-gradient(180deg, var(--color-pick-icon-sheen) 0%, transparent 100%);
        border: 1px solid var(--color-pick-icon-border);
        border-radius: 14px;
        box-shadow:
            inset 0 1px 0 var(--color-pick-gloss-start),
            inset 0 -1px 0 var(--color-pick-shadow-inset);
    }

    .pick-icon :deep(svg) {
        width: 24px;
        height: 24px;
        filter: drop-shadow(0 1px 1px var(--color-pick-text-shadow));
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
        color: var(--color-pick-caption);
        font-size: 11px;
        font-weight: 500;
        line-height: 1.35;
    }

    .pick-button:disabled .pick-icon {
        color: var(--color-pick-disabled-text);
        background-color: var(--color-pick-disabled-icon-bg);
        border-color: var(--color-pick-disabled-icon-border);
    }

    .pick-button:disabled .pick-icon :deep(svg) {
        filter: none;
    }

    .pick-button:disabled .pick-caption {
        color: var(--color-pick-disabled-text);
    }

    .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
    }
</style>
