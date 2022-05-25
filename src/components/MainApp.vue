<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <h3>Test custom date component</h3>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-select id="format" :items="formatItems" item-text="format" item-value="code" label="Select format" v-model="format" class="pure-u-1-3">
        </v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-select id="separator" label="Separator" v-model="separator" :items="seperatorItems">
        </v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-checkbox v-model="required" label="Required?"></v-checkbox>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-checkbox v-model="clearable" label="Clearable?"></v-checkbox>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-range-slider
            v-model="dateRange"
            min="1800"
            max="2200"
            step="10"
            label="Select date range"
            :hint="hintRange"
        ></v-range-slider>
      </v-col>
    </v-row>
    <v-row>

      <v-col offset="2" cols="3">
        <p-date-input
            v-model="date"
            @log="logMessage"
            @error="reportError"
            @isoDate="isoDate"
            @reset="reset"
            :required="required"
            :clearable="clearable"
            :min-year="minYear"
            :max-year="maxYear"
            :format="format"
            :separator="separator"
            :show-in-error="showInError"
        />
      </v-col>
      <v-col>
        <p>ISO date: {{ iso }}<br>
           Entered data: {{ date }}<br>
           Error: {{ errorDescription }}<br>
           showInError: {{ showInError }}</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <button @click="messages = []">Clear</button>
      </v-col>
    </v-row>

    <v-row class="log">
      <v-col>
        <span v-for="(msg, idx) in messages" :key="idx">{{ idx }} {{ msg }}<br></span>
      </v-col>
    </v-row>
  </v-container>
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
  showInError = false

  readonly formatItems = [
    { code: 'EU',  format: 'DD-MM-YYYY' },
    { code: 'US',  format: 'MM-DD-YYYY' },
    { code: 'ISO', format: 'YYYY-MM-DD' }
  ]

  readonly seperatorItems =  ['-', '/', '.']

  readonly dateRange = [1900, 2000]

  iso = ""
  minYear = 1900
  maxYear = 2100
  required = false
  clearable = true
  separator = '-'
  format = 'EU'

  @Watch("date", { immediate: true })
  watchDate(isoDate: string): void {
    this.errorDescription = ""
    this.showInError = false
  }

  @Watch("dateRange")
  watchDateRange(newValue: number[]): void {
    this.minYear = newValue[0]
    this.maxYear = newValue[1]
  }

  get hintRange() {
    return ` min ${this.dateRange[0]} - max ${this.dateRange[1]}`
  }

  logMessage(msg: string): void {
    this.messages.push(msg)
  }

  reportError(error: InputError): void {
    this.showInError = true
    this.errorDescription = `${error.element} - ${error.error}`
  }

  isoDate(value: string) {
    this.errorDescription = ""
    this.showInError = false
    this.iso = value
  }

  reset() {
    this.errorDescription = ""
    this.showInError = false
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.container {
  width: 80%;
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
  margin: 40px 0;
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
