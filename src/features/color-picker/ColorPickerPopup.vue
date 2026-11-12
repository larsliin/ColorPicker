<script setup lang="ts">
    import { computed } from 'vue';
    import { BaseAlert, BaseHeroButton } from 'chrome-extension-component-library';
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
        pickColor,
        recentColors,
        selectRecentColor,
        selectedColor,
        statusMessage,
        updateSelectedColor,
    } = useColorPicker();

    const secondaryFormats = computed(() => formats.value.filter((format) => format.name !== 'HEX'));
</script>

<template>
    <main class="popup-shell">
        <h1 class="visually-hidden">Color Picker</h1>

        <section class="popup-content" aria-label="Color picker">
            <BaseAlert
                v-if="!isPicking && !isEyeDropperAvailable"
                variant="warning"
                message="Color picking requires a recent desktop version of Chrome."
            />
            <BaseAlert v-if="!isPicking && errorMessage" :message="errorMessage" />
            <BaseAlert v-if="!isPicking && copyErrorMessage" :message="copyErrorMessage" />

            <BaseHeroButton
                class="color-pick-button"
                :disabled="isPicking || !isEyeDropperAvailable"
                :aria-label="isPicking ? 'Picking a color from the screen' : 'Pick a color from the screen'"
                :title="isPicking ? 'Picking color…' : 'Start screen-wide color picker'"
                @click="pickColor"
            >
                <span class="hero-icon" aria-hidden="true">
                    <EyeDropperIcon />
                </span>
                <span class="hero-copy">
                    <span class="hero-title">
                        {{ isPicking ? 'Picking from screen' : 'Pick a color from screen' }}
                    </span>
                    <span class="hero-caption">
                        {{
                            isPicking
                                ? 'Select a pixel anywhere · Press Escape to cancel'
                                : isEyeDropperAvailable
                                    ? 'Click to start · Sample colors across your entire screen'
                                    : 'Unavailable in this version of Chrome'
                        }}
                    </span>
                </span>
            </BaseHeroButton>

            <p class="visually-hidden" role="status" aria-live="polite">
                {{ isPicking ? 'Color picker active. Select a pixel or press Escape to cancel.' : statusMessage }}
            </p>

            <div v-show="!isPicking" class="selection-layout" :class="{ 'empty-state-layout': !selectedColor }">
                <SelectedColor
                    :selected-color="selectedColor"
                    :copied-format="copiedFormat"
                    @select="updateSelectedColor"
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
    .hero-icon {
        display: grid;
        flex: 0 0 48px;
        place-items: center;
        width: 48px;
        height: 48px;
        font-size: 24px;
        line-height: 1;
        background-color: var(--color-hero-icon-bg);
        background-image: linear-gradient(180deg, var(--color-hero-icon-sheen) 0%, transparent 100%);
        border: 1px solid var(--color-hero-icon-border);
        border-radius: 14px;
        box-shadow:
            inset 0 1px 0 var(--color-hero-gloss-start),
            inset 0 -1px 0 var(--color-hero-shadow-inset);
    }

    .hero-icon :deep(svg) {
        width: 24px;
        height: 24px;
        filter: drop-shadow(0 1px 1px var(--color-hero-text-shadow));
    }

    .color-pick-button:active:not(:disabled) .hero-icon {
        background-image: linear-gradient(0deg, var(--color-hero-icon-sheen) 0%, transparent 100%);
        box-shadow:
            inset 0 2px 3px var(--color-hero-shadow-active),
            inset 0 -1px 0 var(--color-hero-icon-border);
    }

    .color-pick-button:disabled .hero-icon {
        background-color: var(--color-hero-disabled-icon-bg);
        border-color: var(--color-hero-disabled-icon-border);
    }

    .color-pick-button:disabled .hero-icon :deep(svg) {
        filter: none;
    }

    .hero-copy {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
    }

    .hero-title {
        font-size: 15px;
        font-weight: 700;
        line-height: 1.25;
    }

    .hero-caption {
        font-size: 11px;
        font-weight: 500;
        line-height: 1.35;
        color: var(--color-hero-caption);
    }

    .color-pick-button:disabled .hero-caption {
        color: var(--color-hero-disabled-text);
    }

    .popup-shell {
        display: flex;
        flex-direction: column;
        width: 100%;
        background: var(--color-bg);
    }

    .popup-content {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
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

    .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
    }
</style>
