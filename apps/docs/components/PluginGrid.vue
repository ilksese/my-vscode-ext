<script setup lang="ts">
import { plugins } from '../src/plugins';

const sorted = [...plugins].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

function isImageIcon(icon: string): boolean {
  return icon.startsWith('/') || icon.startsWith('http');
}
</script>

<template>
  <div class="plugin-grid">
    <a
      v-for="p in sorted"
      :key="p.id"
      class="plugin-card"
      :href="`/${p.id}/`"
    >
      <span class="plugin-icon" aria-hidden="true">
        <img v-if="isImageIcon(p.icon)" :src="p.icon" :alt="p.title" />
        <template v-else>{{ p.icon }}</template>
      </span>
      <div>
        <h3>{{ p.title }}</h3>
        <p>{{ p.description }}</p>
      </div>
    </a>
  </div>
</template>

<style scoped>
.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.plugin-card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.2s, transform 0.2s;
}

.plugin-card,
.plugin-card * {
  text-decoration: none;
}

.plugin-card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
}

.plugin-icon {
  font-size: 2rem;
  line-height: 1;
}

.plugin-icon img {
  width: 2rem;
  height: 2rem;
  display: block;
}

.plugin-card h3 {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
}

.plugin-card p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
</style>