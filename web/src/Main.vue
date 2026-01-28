<template>
    <HomeView v-if="activeView === 'HomeView'" @start="onClickedStartAtHomeView"/>
    <OpticView v-if="activeView === 'OpticView'"/>
</template>

<script setup>
import HomeView from './views/HomeView.vue'
import OpticView from './views/OpticVIew.vue'
import { ref } from 'vue'

const activeView = ref('HomeView')

const onClickedStartAtHomeView = () => {
    activeView.value = 'OpticView'
}
</script>

<style scoped>
</style>