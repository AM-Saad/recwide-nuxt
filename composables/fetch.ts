// fetch.js
import { ref, watchEffect, toValue } from "vue"

type Url = string | Ref<string> | ComputedRef<string>

type Options = {
  method?: string
  headers?: Record<string, string>
  body?: BodyInit
}
interface FetchResponse {
  data: Ref<unknown>
  error: Ref<Error | null>
}

export function useFetch(url: Url, options?: Options): FetchResponse {
  const data = ref(null)
  const error: Ref<Error | null> = ref(null)

  const fetchData = async (): Promise<void> => {
    // reset state before fetching..
    data.value = null
    error.value = null

    const res = await fetch(toValue(url) as string, options || {})
    if (!res.ok) {
      error.value = new Error("An error occurred")
    } else {
      data.value = await res.json()
    }
  }

  watchEffect(() => {
    fetchData()
  })

  return { data, error }
}

// Usage
// App.vue
// <template>
//   <div>
//     <div v-if="error">{{ error.message }
//       <div v-else>{{ data }}
//    </div>
//    </div>
// </template>

// <script setup>
// import { useFetch } from "./composables/fetch"
// import { ref } from "vue"

// const url = ref("https://api.example.com/data")
// const { data, error } = useFetch(url)
// </script>
