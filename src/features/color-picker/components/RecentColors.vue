<script setup lang="ts">
    import BaseButton from '@/components/base/BaseButton.vue';

    const props = defineProps<{
        colors: readonly string[];
        selectedColor: string;
    }>();

    const emit = defineEmits<{
        select: [color: string];
    }>();
</script>

<template>
    <section class="recent-colors" aria-label="Recently picked colors">
        <h2>Recently picked colors</h2>
        <div class="color-grid">
            <BaseButton
                v-for="color in props.colors"
                :key="color"
                variant="bare"
                class="color-swatch"
                :class="{ selected: color === props.selectedColor }"
                :style="{ backgroundColor: color }"
                :aria-label="`Select color ${color}`"
                :aria-pressed="color === props.selectedColor"
                :title="`Select ${color}`"
                @click="emit('select', color)"
            />
        </div>
    </section>
</template>

<style scoped>
    .recent-colors {
        padding-top: var(--section-spacing);
        border-top: 1px solid var(--color-border);
    }

    .recent-colors h2 {
        margin: 0 0 5px;
        color: var(--color-text-muted);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .color-grid {
        display: grid;
        grid-template-columns: repeat(8, minmax(0, 1fr));
        gap: 5px;
    }

    .color-swatch {
        position: relative;
        min-width: 0;
        width: 100%;
        height: 34px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-button);
        cursor: pointer;
    }

    .color-swatch:hover {
        filter: brightness(1.12);
    }

    .color-swatch.selected {
        border: 1px solid var(--color-swatch-selected-border);
        box-shadow:
            0 0 0 1px var(--color-swatch-selected-ring),
            0 1px 4px var(--color-shadow);
    }

    .color-swatch.selected::after {
        position: absolute;
        right: 4px;
        bottom: 4px;
        width: 10px;
        height: 10px;
        background: transparent;
        border: 2px solid var(--color-white);
        border-radius: 50%;
        box-shadow: 0 0 0 1px var(--color-swatch-indicator-shadow);
        content: '';
    }

    .color-swatch:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
        z-index: 1;
    }
</style>
