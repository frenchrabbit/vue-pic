<template>
  <div id="app">
    <h1>vue-pic demo</h1>
    <div class="spacer"></div>

    <div class="spacer"></div>

    <pic
      class="debug"
      src="https://picsum.photos/id/237/1920/700"
      width="1920"
      height="700"
    ></pic>

    <br />

    <pic
      class="debug"
      src="https://picsum.photos/id/137/1920/700"
      width="500"
      height="500"
    ></pic>

    <br />

    <pic
      class="debug"
      src="https://picsum.photos/id/37/1920/700"
      width="1920"
      height="1920"
    ></pic>
    <br />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'App',
})
</script>

<style>
.spacer {
  height: 200vh;
}
</style>
