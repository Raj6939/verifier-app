<template>
  <div id="app">
    <div class="full-height" :style="theme">
      <verifier-page @toggle-change="onToggleChange" />
    </div>
  </div>
</template>

<script>
import VerifierPage from './components/VerifierPage.vue';

export default {
  name: 'App',
  components: {
    VerifierPage,
  },
  data() {
    return {
      isSwitchOn: false,
      bgColor: '#ffffff',
    };
  },
  methods: {
    onToggleChange(isSwitchOn) {
      this.isSwitchOn = isSwitchOn;
      if (isSwitchOn) {
        this.bgColor = '#161D31';        
        document.body.style.backgroundColor = this.bgColor;
      } else {
        this.bgColor = '#ffffff';
        document.body.style.backgroundColor = this.bgColor;
      }
    },
  },
  computed: {
    theme() {
      return {
        '--bg-color': this.bgColor,
      };
    },
  },
};
</script>

<style>
/* Your existing styles go here */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
