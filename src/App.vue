<script setup>
import { ref, onBeforeMount } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import Worker from './my-worker?worker'

// replaced dyanmicaly
const date = '__DATE__'
const timeAgo = useTimeAgo(date)
const pong = ref(null)
const mode = ref(null)
const worker = new Worker()
const runWorker = async() => {
  worker.postMessage('ping')
}
const resetMessage = async() => {
  worker.postMessage('clear')
}
const messageFromWorker = async({ data: { msg, mode: useMode }}) => {
  pong.value = msg
  mode.value = useMode
}
onBeforeMount(() => {
  worker.addEventListener('message', messageFromWorker)
})

</script>
<template>
  <img src="/favicon.svg" width="60" height="60">
  <br>
  <div>Built at: {{ date }} ({{ timeAgo }})</div>
  <br>
  <router-view />
  <br />
  <br />
  <button @click="runWorker">Ping worker</button>
  &#160;&#160;
  <button @click="resetMessage">Reset message</button>
  <br/>
  <br/>
  <template v-if="pong">
    Response from worker: <span> Message: {{ pong }} </span>&#160;&#160;<span> Using ENV mode: {{ mode }}</span>
  </template>
</template>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
