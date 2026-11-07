<script setup lang="ts">
    import { computed } from 'vue';

    const props = withDefaults(defineProps<{
        variant?: 'error' | 'warning' | 'info';
        message: string;
    }>(), {
        variant: 'error',
    });

    const role = computed(() => (props.variant === 'error' ? 'alert' : 'status'));
</script>

<template>
    <div v-if="message" class="alert" :class="variant" :role="role">
        <span class="alert-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
                <path
                    v-if="variant === 'error' || variant === 'warning'"
                    d="M12 8v5m0 3h.01M10.3 3.8 2.9 17.1A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.9L13.7 3.8a2 2 0 0 0-3.4 0Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    v-else
                    d="M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </span>
        <p class="message">{{ message }}</p>
    </div>
</template>

<style scoped>
    .alert {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 8px 12px;
        border-radius: var(--radius-button);
        font-size: 12px;
        line-height: 1.4;
        word-break: break-word;
    }

    .alert-icon {
        display: grid;
        flex-shrink: 0;
        place-items: center;
        margin-top: 1px;
    }

    .alert-icon svg {
        width: 14px;
        height: 14px;
    }

    .message {
        flex: 1;
        color: inherit;
        font-size: inherit;
    }

    .alert.error {
        color: var(--color-error);
        background: var(--color-error-bg);
        border: 1px solid var(--color-error-border);
    }

    .alert.warning {
        color: var(--color-warning);
        background: var(--color-warning-bg);
        border: 1px solid var(--color-warning-border);
    }

    .alert.info {
        color: var(--color-info);
        background: var(--color-info-bg);
        border: 1px solid var(--color-info-border);
    }
</style>
