
<template>
  <div class="date-input" :class="{ 'required': required }">
    <v-text-field
        v-model="dateString"
        clearable
        type="date"
        :dense="dense"
        :error-messages="errorMessages"
        @click:clear="clearField"
        @blur="onBlur($event)"
        @keyup="emitOnFullDate"
    >
      <template #label>
        <slot></slot>
      </template>
      <template #message>
        <slot name="error"></slot>
      </template>
    </v-text-field>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { Emit, Prop, Watch } from "vue-property-decorator"

import { isUndefined } from "lodash-es"

import dayjs from "dayjs"

enum HTMLEvent {
  INPUT  = "input",
  CHANGE = "change",
  BLUR   = "blur"
}

@Component
export default class PDateInput extends Vue {
  @Prop({ type: Date }) value?: Date
  @Prop({ type: Array }) errorMessages?: Array<string>
  @Prop({ type: String, default: "DD-MM-YYYY" }) format!: string
  @Prop({ type: Boolean, default: false }) required!: boolean
  @Prop({ type: Boolean, default: false }) dense!: boolean

  readonly isoFormat = "YYYY-MM-DD"

  dateString = ""

  clearField(): void {
    this.dateString = ""
  }

  @Watch("value", { immediate: true })
  inputDateChanged(): void {
    if (isUndefined(this.value)) {
      this.clearField()
      return
    }
    const formattedDate = dayjs(this.value).format(this.isoFormat)
    if (!this.value || !dayjs(formattedDate, this.isoFormat, true).isValid()) {
      return
    }
    this.dateString = formattedDate
  }

  emitOnFullDate(): void {
    if (dayjs(this.dateString, this.isoFormat, true).isValid()) {
      this.emitNewDate()
    }
  }

  emitNewDate(): void {
    if (this.dateString === "" || this.dateString === null) {
      this.$emit(HTMLEvent.INPUT, undefined)
      this.$emit(HTMLEvent.CHANGE, undefined)
      return
    }
    const validDate = dayjs(this.dateString, this.isoFormat, true).toDate()
    this.$emit(HTMLEvent.INPUT, validDate)
    this.$emit(HTMLEvent.CHANGE, validDate)
  }

  @Emit(HTMLEvent.BLUR)
  onBlur(event: Event): Event {
    this.emitNewDate()
    return event
  }
}
</script>

<style>
  .v-input__append-inner {
    display: inline-block;
    position: relative !important;
  }
  .v-input__append-inner .mdi-close {
    position: absolute !important;
    left: -20px;
    z-index: 9999999;
    background-color: #eeeeee;
    opacity: 1;
  }
</style>

