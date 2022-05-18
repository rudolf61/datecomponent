<template>
  <div class="hello">
    <h3>Example date</h3>
    <p-date-input v-model="date" @log="logMessage" />
    <p class="log">
      <button @click="messages = []">Clear</button>
      <span v-for="msg, idx in messages" :key="idx">{{ idx }} {{ msg }}<br></span>
    </p>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Vue } from 'vue-property-decorator';
import PDateInput from './PDateInput.vue';

@Component({
  components: {
     PDateInput
  }
})
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;
  date = ""
  date2 = ""
  messages: Array<string> = []

  logMessage(msg: string): void {
    this.messages.push(msg)
  }

  formatNumber(n: number): string {
    return n.toString().padStart(4, '0')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.log {
  background-color: black;
  color: white;
  text-align: left;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1em;
  overflow: scroll;
}

h3 {
  margin: 40px 0 20pz;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
