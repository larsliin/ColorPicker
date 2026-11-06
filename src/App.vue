<script setup lang="ts">
    import { useTheme } from './composables/useTheme';
    import ColorPickerPopup from './features/color-picker/ColorPickerPopup.vue';

    useTheme();
</script>

<template>
    <ColorPickerPopup />
</template>
