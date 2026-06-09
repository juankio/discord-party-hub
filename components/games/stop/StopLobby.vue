<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-white bg-slate-900 p-8">
    <UCard class="w-full max-w-2xl bg-slate-800 border-slate-700 shadow-xl overflow-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-primary-400 flex items-center gap-2">
            <UIcon name="i-lucide-pen-tool" class="w-8 h-8" />
            Configuración de Tutti Frutti
          </h2>
          <UBadge color="gray" variant="solid">{{ players.length }}/8 Jugadores</UBadge>
        </div>
      </template>

      <div class="space-y-6" v-if="isHost">
        <!-- Categories -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Categorías (Mín 3, Máx 8)</label>
          <div class="flex flex-wrap gap-2 mb-3">
            <UBadge 
              v-for="(cat, idx) in categories" 
              :key="idx" 
              color="primary" 
              variant="soft"
              class="px-3 py-1 text-sm cursor-pointer hover:bg-red-500/20 hover:text-red-400 transition-colors"
              @click="removeCategory(idx)"
            >
              {{ cat }} <UIcon name="i-lucide-x" class="ml-1 w-3 h-3" />
            </UBadge>
          </div>
          
          <div class="flex gap-2" v-if="categories.length < 8">
            <UInput 
              v-model="newCategory" 
              placeholder="Nueva categoría..." 
              @keyup.enter="addCategory"
              class="flex-1"
            />
            <UButton icon="i-lucide-plus" color="primary" @click="addCategory" :disabled="!newCategory.trim()" />
          </div>
          
          <div class="mt-3 flex flex-wrap gap-2">
            <UButton 
              v-for="preset in presetCategories" 
              :key="preset"
              size="xs"
              color="gray"
              variant="soft"
              @click="addPreset(preset)"
              :disabled="categories.includes(preset) || categories.length >= 8"
            >
              {{ preset }}
            </UButton>
          </div>
        </div>

        <UDivider />

        <!-- Rounds -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Número de Rondas: {{ rounds }}</label>
          <URange v-model="rounds" :min="1" :max="10" />
        </div>
      </div>

      <div v-else class="text-center py-8">
        <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-white mb-2">Esperando al Host...</h3>
        <p class="text-slate-400">El anfitrión está configurando la partida.</p>
      </div>

      <template #footer v-if="isHost">
        <div class="flex justify-end gap-3">
          <UButton color="gray" variant="ghost" @click="$emit('cancel')">Cancelar</UButton>
          <UButton color="primary" @click="startGame" :disabled="categories.length < 3">Comenzar Partida</UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isHost: boolean
  players: any[]
  initialCategories: string[]
  initialRounds: number
}>()

const emit = defineEmits(['start', 'update_config', 'cancel'])

const categories = ref<string[]>([...props.initialCategories])
const rounds = ref(props.initialRounds)
const newCategory = ref('')

const presetCategories = ['Nombre', 'Color', 'Animal', 'Cosa', 'País/Ciudad', 'Fruta/Verdura', 'Profesión', 'Marca']

const addCategory = () => {
  const cat = newCategory.value.trim()
  if (cat && categories.value.length < 8 && !categories.value.includes(cat)) {
    categories.value.push(cat)
    newCategory.value = ''
    emitConfig()
  }
}

const addPreset = (cat: string) => {
  if (categories.value.length < 8 && !categories.value.includes(cat)) {
    categories.value.push(cat)
    emitConfig()
  }
}

const removeCategory = (idx: number) => {
  categories.value.splice(idx, 1)
  emitConfig()
}

const emitConfig = () => {
  emit('update_config', {
    categories: categories.value,
    rounds: rounds.value
  })
}

watch(rounds, () => {
  emitConfig()
})

const startGame = () => {
  emit('start', {
    categories: categories.value,
    rounds: rounds.value
  })
}
</script>
