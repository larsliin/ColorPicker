<script setup lang="ts">
    import { computed } from 'vue';
    import BaseAlert from '@/components/base/BaseAlert.vue';
    import BaseButton from '@/components/base/BaseButton.vue';
    import ColorFormatList from './components/ColorFormatList.vue';
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

            <p class="visually-hidden" role="status" aria-live="polite">{{ statusMessage }}</p>

            <div v-if="selectedColor" class="selection-layout">
                <SelectedColor
                    :selected-color="selectedColor"
                    :copied-format="copiedFormat"
                    @select="selectColor"
                    @copy="copyFormat('HEX', $event)"
                />

                <RecentColors
                    :colors="recentColors"
                    :selected-color="selectedColor"
                    @select="selectRecentColor"
                />

                <ColorFormatList
                    :formats="secondaryFormats"
                    :copied-format="copiedFormat"
                    @copy="copyFormat($event.name, $event.value)"
                />
            </div>
            <div v-else class="selection-layout empty-state-layout">
                <SelectedColor
                    :selected-color="selectedColor"
                    :copied-format="copiedFormat"
                    @select="selectColor"
                    @copy="copyFormat('HEX', $event)"
                />

                <div class="empty-state">
                    <p class="empty-state-message">Pick your first color to get started</p>
                </div>

                <RecentColors
                    v-if="recentColors.length > 0"
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
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .pick-button {
        --pick-surface:
            linear-gradient(180deg, #218766 0%, #0c7252 48%, #086148 100%);
        --pick-shadow:
            inset 0 1px 0 rgb(255 255 255 / 35%),
            inset 0 -2px 3px rgb(0 40 28 / 18%),
            0 2px 6px rgb(0 0 0 / 18%);

        width: 100%;
        min-height: 82px;
        justify-content: flex-start;
        gap: 14px;
        padding: 12px 16px;
        color: #fff;
        text-align: left;
        text-shadow: 0 1px 2px rgb(0 42 27 / 35%);
        background: var(--pick-surface);
        border: 1px solid #08664b;
        border-radius: 6px;
        box-shadow: var(--pick-shadow);
        transition: box-shadow 100ms ease-out, filter 100ms ease-out;
    }

    .pick-button.pick-button:hover:not(:disabled) {
        background: var(--pick-surface);
        border-color: #08664b;
        filter: brightness(1.05);
    }

    .pick-button.pick-button:active:not(:disabled) {
        background: var(--pick-surface);
        border-color: #08664b;
        box-shadow:
            inset 0 2px 5px rgb(0 40 28 / 30%),
            inset 0 1px 0 rgb(255 255 255 / 20%);
        filter: brightness(0.94);
    }

    .pick-button.pick-button:disabled {
        color: var(--color-text-muted);
        background: var(--color-button-secondary);
        border-color: var(--color-button-secondary-border);
        box-shadow: none;
        opacity: 1;
        text-shadow: none;
    }

    .pick-button.pick-button.is-picking:disabled {
        color: #fff;
        background: var(--pick-surface);
        border-color: #08664b;
        box-shadow: var(--pick-shadow);
        opacity: 1;
        text-shadow: 0 1px 2px rgb(0 42 27 / 35%);
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
        background: rgb(255 255 255 / 12%);
        border: 1px solid rgb(255 255 255 / 25%);
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

    .pick-button:disabled:not(.is-picking) .pick-icon {
        color: var(--color-text-muted);
        background: var(--color-hover);
        border-color: var(--color-border);
    }

    .pick-button:disabled:not(.is-picking) .pick-caption {
        color: var(--color-text-muted);
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
