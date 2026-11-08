<script setup lang="ts">
    import BaseButton from '@/components/base/BaseButton.vue';
    import type { ColorFormat } from '../types';

    defineProps<{
        formats: ColorFormat[];
        copiedFormat: string;
    }>();

    const emit = defineEmits<{
        copy: [format: ColorFormat];
    }>();
</script>

<template>
    <section class="formats-section" aria-label="Color formats">
        <h2>Other formats</h2>
        <div class="format-list">
            <BaseButton
                v-for="format in formats"
                :key="format.name"
                variant="bare"
                class="format-row"
                :aria-label="copiedFormat === format.name
                    ? `${format.name} value copied to clipboard`
                    : `Copy ${format.name} value ${format.value}`"
                @click="emit('copy', format)"
            >
                <span class="format-name">{{ format.name }}</span>
                <span class="format-value">{{ format.value }}</span>
                <span class="format-action">{{ copiedFormat === format.name ? 'Copied' : 'Copy' }}</span>
            </BaseButton>
        </div>
    </section>
</template>

<style scoped>
    .formats-section {
        padding-top: var(--section-spacing);
        padding-left: 0;
        padding-right: 0;
        border-top: 1px solid var(--color-border);
    }

    .formats-section h2 {
        margin: 0 0 6px;
        color: var(--color-text-muted);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .format-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .format-row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        min-height: 34px;
        padding: 5px 8px;
        color: var(--color-text);
        text-align: left;
        background: transparent;
        border: 0;
        border-radius: var(--radius-button);
        cursor: pointer;
    }

    .format-row:hover {
        background: var(--color-hover);
    }

    .format-row:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 1px;
    }

    .format-name {
        flex: 0 0 36px;
        color: var(--color-text-muted);
        font-size: 11px;
        font-weight: 700;
    }

    .format-value {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .format-action {
        flex: 0 0 auto;
        color: var(--color-accent);
        font-size: 10px;
        font-weight: 600;
    }
</style>
