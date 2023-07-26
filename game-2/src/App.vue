<template>
  <div id="app">
    <verifier-page/>    
  </div>
</template>

<script>
import VerifierPage from './components/VerifierPage.vue'

export default {
  name: 'App',
  components: {
    VerifierPage
  }
}
</script>

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
