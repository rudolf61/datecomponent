<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <h1>Demo of custom input date component</h1>
      </div>
    </v-app-bar>

    <v-main>
      <MainApp />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import MainApp from './components/MainApp.vue';

export default Vue.extend({
  name: 'App',

  components: {
    MainApp,
  },

  data: () => ({
    //
  }),
});
</script>
