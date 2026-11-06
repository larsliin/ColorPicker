<script setup lang="ts">
    import { useTheme } from './composables/useTheme';

    useTheme();
</script>

<template>
    <main class="app">
        <h1>ColorPicker</h1>
        <p>Pick colors from any webpage.</p>
    </main>
</template>

<style scoped>
.app {
    padding: 16px;
}
</style>
