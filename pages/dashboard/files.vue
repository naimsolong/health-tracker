<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { user } = useAuth()
const isPro = computed(() => (user.value as { subscriptionStatus?: string } | null)?.subscriptionStatus === 'active')

interface UploadedFile {
  id: number
  filename: string
  mimeType: string | null
  fileSize: number | null
  createdAt: string
}

const files = ref<UploadedFile[]>([])
const loading = ref(false)
const uploading = ref(false)
const error = ref('')
const dragOver = ref(false)

async function loadFiles() {
  loading.value = true
  try {
    const { data } = await useFetch('/api/files')
    if (data.value) files.value = (data.value as { files: UploadedFile[] }).files
  } finally {
    loading.value = false
  }
}

onMounted(loadFiles)

function formatSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleUpload(file)
}

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleUpload(file)
}

async function handleUpload(file: File) {
  if (!isPro.value) return
  error.value = ''
  uploading.value = true
  try {
    const { data, error: fetchError } = await useFetch('/api/files/upload', {
      method: 'POST',
      body: { filename: file.name, mimeType: file.type, fileSize: file.size },
    })
    if (fetchError.value) throw fetchError.value
    const result = data.value as { fileId: number }
    if (result?.fileId) {
      await loadFiles()
    }
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string }; message?: string })?.data?.message || 'Upload failed'
  } finally {
    uploading.value = false
  }
}

async function deleteFile(id: number) {
  if (!confirm('Delete this file?')) return
  try {
    await $fetch(`/api/files/${id}`, { method: 'DELETE' })
    files.value = files.value.filter((f) => f.id !== id)
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string }; message?: string })?.data?.message || 'Delete failed'
  }
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-1">Files</h1>
    <p class="text-gray-500 mb-8">Attach lab reports, prescriptions, and health documents.</p>

    <!-- Upgrade prompt for free users -->
    <div v-if="!isPro" class="rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-8 text-center mb-8">
      <svg class="w-12 h-12 text-emerald-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p class="text-lg font-semibold text-gray-900 mb-1">File uploads are a Pro feature</p>
      <p class="text-gray-500 text-sm mb-4">Upgrade to Pro for $3/month to attach PDFs, images, and documents to your health records.</p>
      <NuxtLink to="/dashboard/billing"
        class="inline-block px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
        Upgrade to Pro
      </NuxtLink>
    </div>

    <!-- Upload area for Pro users -->
    <template v-if="isPro">
      <div
        class="rounded-xl border-2 border-dashed p-8 text-center mb-6 transition-colors cursor-pointer"
        :class="dragOver ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
        @click="($refs.fileInput as HTMLInputElement)?.click()">
        <input ref="fileInput" type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt" @change="onFileSelect" />
        <svg class="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p v-if="!uploading" class="text-sm text-gray-600">
          <span class="font-semibold text-emerald-600">Click to upload</span> or drag and drop
        </p>
        <p v-else class="text-sm text-emerald-600 font-medium">Uploading...</p>
        <p class="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, WEBP, TXT — max 10 MB</p>
      </div>

      <div v-if="error" class="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{{ error }}</div>
    </template>

    <!-- File list -->
    <div v-if="loading" class="text-center py-12 text-gray-400 text-sm">Loading files...</div>

    <div v-else-if="files.length === 0 && isPro" class="text-center py-12 text-gray-400 text-sm">
      No files uploaded yet.
    </div>

    <div v-else-if="files.length > 0" class="rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="px-4 py-3 text-left font-medium">File</th>
            <th class="px-4 py-3 text-left font-medium hidden sm:table-cell">Size</th>
            <th class="px-4 py-3 text-left font-medium hidden sm:table-cell">Uploaded</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="file in files" :key="file.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="font-medium text-gray-900 truncate max-w-xs">{{ file.filename }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-500 hidden sm:table-cell">{{ formatSize(file.fileSize) }}</td>
            <td class="px-4 py-3 text-gray-500 hidden sm:table-cell">{{ formatDate(file.createdAt) }}</td>
            <td class="px-4 py-3 text-right">
              <button @click="deleteFile(file.id)"
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
