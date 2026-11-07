import { ref, computed } from 'vue';

export interface ApiColor {
    hex: {
        value: string;
        clean: string;
    };
    name: {
        value: string;
    };
}

export interface ApiScheme {
    mode: string;
    count: number;
    colors: ApiColor[];
}

export type SchemeMode = 'monochrome' | 'monochrome-dark' | 'monochrome-light' | 'analogic' | 'complement' | 'analogic-complement' | 'triad' | 'quad';

const API_BASE = 'https://www.thecolorapi.com';

export function useColorSchemeApi() {
    const scheme = ref<ApiScheme | null>(null);
    const isLoading = ref(false);
    const error = ref('');

    async function fetchScheme(hex: string, mode: SchemeMode, count: number, signal: AbortSignal) {
        isLoading.value = true;
        error.value = '';
        scheme.value = null;

        try {
            const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
            const url = `${API_BASE}/scheme?hex=${cleanHex}&mode=${mode}&count=${count}`;

            const response = await fetch(url, { signal });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = (await response.json()) as ApiScheme;
            if (!signal.aborted) {
                scheme.value = data;
            }
        } catch (err) {
            if (!signal.aborted) {
                const message = err instanceof Error ? err.message : 'Failed to fetch color scheme';
                error.value = message;
                console.error('Color scheme fetch error:', err);
            }
        } finally {
            if (!signal.aborted) {
                isLoading.value = false;
            }
        }
    }

    const colors = computed(() => scheme.value?.colors ?? []);

    const hexColors = computed(() => colors.value.map((c) => c.hex.value));

    const colorNames = computed(() => colors.value.map((c) => c.name.value));

    return {
        scheme: computed(() => scheme.value),
        colors,
        hexColors,
        colorNames,
        isLoading: computed(() => isLoading.value),
        error: computed(() => error.value),
        fetchScheme,
    };
}
