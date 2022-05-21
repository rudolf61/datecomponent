<template>
  <div class="container">
    <h3>Custom date component</h3>
    <div class="date_properties">
      <div class="pure-g">
        <label for="format" class="pure-u-1-6">Date Format</label>
        <select id="format" v-model="format" class="pure-u-1-3">
          <option value="EU" selected>DD-MM-YYYY</option>
          <option value="US">MM-DD-YYYY</option>
          <option value="ISO">YYYY-MM-DD</option>
        </select>
      </div>
      <div class="pure-g">
        <label for="separator" class="pure-u-1-6">Separator</label>
        <select id="separator" v-model="separator" class="pure-u-1-3">
          <option value="-" selected>-</option>
          <option value="/">/</option>
          <option value=".">.</option>
          <option value=" "></option>
        </select>
      </div>
      <div class="pure-g">

        <label for="required" class="pure-u-1-6">Required</label>
        <input type="checkbox" v-model="required" class="pure-u-1-3">
      </div>
      <div class="pure-g">
        <label class="pure-u-1-6">Range</label>
        <div class="pure-u-5-6 range"><input type="number" v-model="minYear"> - <input type="number" v-model="maxYear"></div>
      </div>
    </div>
    <p-date-input
        v-model="date"
        @log="logMessage"
        @error="reportError"
        :required="required"
        :min-year="minYear"
        :max-year="maxYear"
        :format="format"
        :separator="separator"
    />
    <p>Entered valid date: {{ date }}</p>
    <p>Error {{ errorDescription }}</p>
    <p class="log">
      <button @click="messages = []">Clear</button>
      <span v-for="msg, idx in messages" :key="idx">{{ idx }} {{ msg }}<br></span>
    </p>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Prop, Vue, Watch} from 'vue-property-decorator';
import PDateInput from './PDateInput.vue';
import {InputError} from './type';

@Component({
  components: {
    PDateInput
  }
})
export default class MainApp extends Vue {
  @Prop() private msg!: string;
  date = ""
  errorDescription = ""
  messages: Array<string> = []

  minYear = 1900
  maxYear = 2100
  required = false
  separator = '-'
  format = 'EU'

  @Watch("date")
  watchDate(isoDate: string): void {
    this.errorDescription = ""
  }

  logMessage(msg: string): void {
    this.messages.push(msg)
  }

  reportError(error: InputError): void {
    this.errorDescription = `${error.element} - ${error.error}`
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.container {
  width: 40%;
  margin: auto;
}

label, select, .range, input {
  text-align: left;
}

.pure-g {
  height: 40px;
}

.date_properties {
  background: #eee;
  padding: 1.2em;
}

.log {
  background-color: black;
  color: white;
  text-align: left;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1em;
  overflow: scroll;
}

select {
  width: 200px;
}

h3 {
  margin: 40px 0 20 pz;
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
