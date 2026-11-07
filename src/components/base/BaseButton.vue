<script setup lang="ts">
    withDefaults(defineProps<{
        variant?: 'primary' | 'outline' | 'bare';
    }>(), {
        variant: 'primary',
    });
</script>

<template>
    <button type="button" class="base-button" :class="`base-button--${variant}`">
        <slot />
    </button>
</template>

<style scoped>
    .base-button {
        border-radius: var(--radius-button);
        cursor: pointer;
    }

    .base-button--primary {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        background: var(--color-accent);
        border: 1px solid var(--color-accent);
    }

    .base-button--primary:hover:not(:disabled) {
        background: #15a86d;
        border-color: #15a86d;
    }

    .base-button--primary:active:not(:disabled) {
        background: #0f7d54;
        border-color: #0f7d54;
    }

    .base-button--outline {
        min-height: 32px;
        padding: 5px 10px;
        color: var(--color-accent);
        font-size: 11px;
        font-weight: 700;
        background: transparent;
        border: 1px solid var(--color-border);
    }

    .base-button--outline:hover:not(:disabled) {
        background: var(--color-hover);
    }

    .base-button--outline:active:not(:disabled) {
        background: var(--color-editor-bg);
    }

    :where(.base-button--bare) {
        padding: 0;
        color: inherit;
        background: transparent;
        border: 0;
    }

    .base-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .base-button:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
    }
</style>
