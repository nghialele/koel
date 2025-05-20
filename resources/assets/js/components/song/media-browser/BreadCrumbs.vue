<template>
  <ul class="text-base" :class="disabled && 'disabled'">
    <li v-for="p in paths" :key="p.path" class="inline-block">
      <a :href="url('media-browser', { path: p.path })" class="text-k-text-secondary font-normal">
        {{ p.name }}
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useRouter } from '@/composables/useRouter'
import { computed, toRefs } from 'vue'
import { mediaBrowser } from '@/services/mediaBrowser'

const props = withDefaults(defineProps<{ path: string, disabled?: boolean }>(), {
  disabled: false,
})

const { path } = toRefs(props)

const { url } = useRouter()

const paths = computed(() => mediaBrowser.getBreadcrumbs(path.value))
</script>

<style scoped lang="postcss">
.disabled {
  @apply opacity-50 cursor-not-allowed pointer-events-none;
}

li:not(:first-of-type)::before {
  content: '/';
  @apply font-normal opacity-50 inline-block mx-1.5;
}

li:last-of-type a {
  @apply font-semibold text-k-text-primary cursor-default;
}
</style>
