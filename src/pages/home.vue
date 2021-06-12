<script setup>
import { useRouter } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'

const router = useRouter()
</script>
<template>
  <HelloWorld />
  <br/>
  <button @click="router.push('/about')">About</button>
</template>
