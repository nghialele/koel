<template>
  <FormBase>
    <form @submit.prevent="submit" @keydown.esc="maybeClose">
      <header>
        <h1>New Smart Playlist</h1>
      </header>

      <main class="space-y-5">
        <FormRow :cols="2">
          <FormRow>
            <template #label>Name</template>
            <TextInput v-model="name" v-koel-focus name="name" placeholder="Playlist name" required />
          </FormRow>
          <FormRow>
            <template #label>Folder</template>
            <SelectBox v-model="folderId">
              <option :value="null" />
              <option v-for="folder in folders" :key="folder.id" :value="folder.id">{{ folder.name }}</option>
            </SelectBox>
          </FormRow>
        </FormRow>

        <div v-koel-overflow-fade class="group-container space-y-5 overflow-auto max-h-[480px]">
          <RuleGroup
            v-for="(group, index) in collectedRuleGroups"
            :key="group.id"
            :group="group"
            :is-first-group="index === 0"
            @input="onGroupChanged"
          />
          <Btn class="btn-add-group" small success title="Add a new group" uppercase @click.prevent="addGroup">
            <Icon :icon="faPlus" />
            Group
          </Btn>
        </div>
      </main>

      <footer>
        <Btn type="submit">Save</Btn>
        <Btn class="btn-cancel" white @click.prevent="maybeClose">Cancel</Btn>
      </footer>
    </form>
  </FormBase>
</template>

<script lang="ts" setup>
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { ref, toRef } from 'vue'
import { playlistFolderStore } from '@/stores/playlistFolderStore'
import { playlistStore } from '@/stores/playlistStore'
import { useDialogBox } from '@/composables/useDialogBox'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useMessageToaster } from '@/composables/useMessageToaster'
import { useModal } from '@/composables/useModal'
import { useOverlay } from '@/composables/useOverlay'
import { useSmartPlaylistForm } from '@/composables/useSmartPlaylistForm'
import { useRouter } from '@/composables/useRouter'

import TextInput from '@/components/ui/form/TextInput.vue'
import FormRow from '@/components/ui/form/FormRow.vue'
import SelectBox from '@/components/ui/form/SelectBox.vue'

const emit = defineEmits<{ (e: 'close'): void }>()

const {
  Btn,
  FormBase,
  RuleGroup,
  collectedRuleGroups,
  addGroup,
  onGroupChanged,
} = useSmartPlaylistForm()

const { showOverlay, hideOverlay } = useOverlay()
const { toastSuccess } = useMessageToaster()
const { showConfirmDialog } = useDialogBox()
const { go, url } = useRouter()

const targetFolder = useModal().getFromContext<PlaylistFolder | null>('folder')

const name = ref('')
const folderId = ref(targetFolder?.id)
const folders = toRef(playlistFolderStore.state, 'folders')

const close = () => emit('close')

const isPristine = () => name.value === ''
  && folderId.value === targetFolder?.id
  && collectedRuleGroups.value.length === 0

const maybeClose = async () => {
  if (isPristine()) {
    close()
    return
  }

  await showConfirmDialog('Discard all changes?') && close()
}

const submit = async () => {
  showOverlay()

  try {
    const playlist = await playlistStore.store(name.value, {
      rules: collectedRuleGroups.value,
      folder_id: folderId.value,
    })

    close()
    toastSuccess(`Playlist "${playlist.name}" created.`)
    go(url('playlists.show', { id: playlist.id }))
  } catch (error: unknown) {
    useErrorHandler('dialog').handleHttpError(error)
  } finally {
    hideOverlay()
  }
}
</script>

<style lang="postcss" scoped>
.group-container {
  scrollbar-gutter: stable;
}
</style>
