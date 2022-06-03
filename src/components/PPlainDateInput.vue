<template>
  <div class="__pdate_input" tabindex="-1" :class="{ __pdateinput_error : showError, __clearable : clearable, __not_clearable : !clearable }">
    <div class="datewrapper" @keyup.capture="emitWhenComplete">
      <input
          size="2"
          maxlength="2"
          ref="day"
          v-model="dayInput"
          class="__pdate_input__input __pdate_input__input--day w-day"
          type="tel"
          placeholder="DD"
          @keydown="keydownDay"
          @input="nextElement"
          @blur="blurDay"
          @focus="focusDate"
      />
      <span ref="sep1" tabindex="-1" class="__pdate_input__divider span-1">{{ separator }}</span>
      <input
          ref="month"
          size="2"
          maxlength="2"
          v-model="monthInput"
          class="__pdate_input__input __pdate_input__input--month w-month"
          type="tel"
          placeholder="MM"
          @keydown="keydownMonth"
          @input="nextElement"
          @blur="blurMonth"
          @focus="focusDate"
      />
      <span ref="sep2" tabindex="-1" class="__pdate_input__divider span-2">{{ separator }}</span>
      <input
          ref="year"
          size="4"
          maxlength="4"
          v-model="yearInput"
          class="__pdate_input__input __pdate_input__input--year w-year"
          type="tel"
          placeholder="YYYY"
          @keydown="keydownYear"
          @input="nextElement"
          @blur="blurYear"
          @focus="focusDate"
      />
    </div>
    <a v-if="clearable && notEmpty" tabindex="-1" ref="clear" class="clear" @click="clearDate">&#9932;</a>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator"
import {DateElement, DateFormat, InputError} from "./type"

@Component
export default class PPlainDateInput extends Vue {
  @Prop() private value!: string
  @Prop({default: DateFormat.EU}) private format!: DateFormat
  @Prop({default: "-"}) private separator!: string
  @Prop({default: 1900}) private minYear!: number
  @Prop({default: 2100}) private maxYear!: number
  @Prop({default: true}) private clearable!: boolean
  @Prop({default: false}) private required!: boolean
  @Prop({default: false}) private showInError!: boolean
  @Prop({default: false}) private eagerEmit!: boolean
  private endOfElement = false;
  private inDate     = false
  private dayInput   = ""
  private monthInput = ""
  private yearInput  = ""
  private showError  = false
  private virtualValue = ""
  private fieldComplete = false;
  private controlKey = false

  /* LIFECYCLE METHODS */

  mounted(): void {
    this.reorderFields(this.format)
    this.assignNewValue(this.value)
  }

  /* EVENT HANDLERS */
  @Watch("value")
  watchValue(newValue: string): void
  {
      this.assignNewValue(newValue)
  }

  @Watch("format")
  reorderFields(newVal: string): void {
    const dayInputElm   = this.$refs.day as HTMLInputElement
    const monthInputElm = this.$refs.month as HTMLInputElement
    const yearInputElm  = this.$refs.year as HTMLInputElement

    const sep1   = this.$refs.sep1 as HTMLSpanElement
    const sep2   = this.$refs.sep2 as HTMLSpanElement
    const parent = dayInputElm.parentElement

    parent?.removeChild(dayInputElm)
    parent?.removeChild(sep1)
    parent?.removeChild(monthInputElm)
    parent?.removeChild(sep2)
    parent?.removeChild(yearInputElm)

    if (newVal === DateFormat.EU) {
      parent?.append(dayInputElm)
      parent?.append(sep1)
      parent?.append(monthInputElm)
      parent?.append(sep2)
      parent?.append(yearInputElm)
    } else if (newVal === DateFormat.US) {
      parent?.append(monthInputElm)
      parent?.append(sep1)
      parent?.append(dayInputElm)
      parent?.append(sep2)
      parent?.append(yearInputElm)
    } else if (newVal === DateFormat.ISO) {
      parent?.append(yearInputElm)
      parent?.append(sep1)
      parent?.append(monthInputElm)
      parent?.append(sep2)
      parent?.append(dayInputElm)
    }
  }

  @Watch("showInError")
  setErrorFlag(newVal: boolean): void {
    this.showError = newVal
  }

  emitWhenComplete(): void {
    this.log("emitWhenComplete, endOfElement " + this.endOfElement)
    this.logState()

    if (this.fieldComplete && !this.endOfElement && this.eagerEmit && this.isDateComplete()) {
      this.updateValue()
    }
  }

  /*
      setTimout is used to perform an update the date if the user leaves the date field.
      Within the date field the blur is followed by a focus and then updateAfterBlur,
      which is not executed as long as you are within the date field.
   */
  blurDay(event: FocusEvent): void {
    this.log("blurDay")
    this.dayInput = PPlainDateInput.normalizeInput(this.dayInput)
    this.inDate   = false
    setTimeout(this.updateAfterBlur, 1)
  }

  blurMonth(event: FocusEvent): void {
    this.log("blurMonth")
    this.monthInput = PPlainDateInput.normalizeInput(this.monthInput)
    this.inDate     = false
    setTimeout(this.updateAfterBlur, 1)
  }

  blurYear(event: FocusEvent): void {
    let relatedTarget = event.relatedTarget
    this.log("blurYear, related target " + event.relatedTarget)
    this.yearInput = PPlainDateInput.normalizeInput(this.yearInput, 4)
    this.inDate    = false
    setTimeout(this.updateAfterBlur, 1)
  }

  focusDate(event: FocusEvent): void {
    const inputElm = event.currentTarget as HTMLInputElement
    this.log("focusDate " + inputElm.classList.value)
    inputElm.focus()
    inputElm.select()

    this.inDate = true
  }

  keydownDay(event: KeyboardEvent): boolean {
    this.log("keydown day " + event.key)
    this.logState()

    const acceptInput = this.filterInput(event)
    if (!acceptInput) {
      event.preventDefault()
      return false
    }

    if (!PPlainDateInput.isNumber(event)) {
      this.controlKey = true
      this.virtualValue = ""
      return this.moveToNextField(event);
    }

    this.controlKey = false

    const newVal = this.getInputValueOnKeydown(event)
    this.log("keydown newVal " + newVal)

    let dayOk = false
    if (newVal != "00") {
      const val = parseInt(newVal)
      dayOk = this.isValidDay(val, this.month, this.year)
    }

    if (dayOk) {
      return true
    } else {
      event.preventDefault()
      return false
    }
  }

  private moveToNextField(event: KeyboardEvent): boolean {
    if (event.code === "ArrowRight") {
      return this.nextField(event)
    } else if (event.code === "ArrowLeft") {
      return this.previousField(event)
    }

    return false
  }

  keydownMonth(event: KeyboardEvent): boolean {
    this.log("keydown month " + event.key)
    this.logState()

    const acceptInput = this.filterInput(event)
    if (!acceptInput) {
      event.preventDefault()
      return false
    }

    if (!PPlainDateInput.isNumber(event)) {
      this.controlKey = true
      this.virtualValue = ""
      return this.moveToNextField(event);
    }

    this.controlKey = false

    const newVal = this.getInputValueOnKeydown(event)
    if (newVal !== "00") {
      const val   = parseInt(newVal)
      const valid = this.isValidMonth(this.day, val, this.year)
      if (valid) {
        return true
      }
    }

    event.preventDefault()
    return false
  }

  keydownYear(event: KeyboardEvent): boolean {
    this.log("keydown year " + event.key)
    this.logState()

    const acceptInput = this.filterInput(event)
    if (!acceptInput) {
      event.preventDefault()
      return false
    }

    if (!PPlainDateInput.isNumber(event)) {
      this.controlKey = true
      this.virtualValue = ""
      return this.moveToNextField(event);
    }

    this.controlKey = false

    const newVal = this.getInputValueOnKeydown(event)
    const allZeroes = newVal === "0000"
    if (allZeroes) {
      event.preventDefault()
      return false
    }

    const val = parseInt(newVal)
    if (newVal.length === 4 && !this.isValidYear(this.day, this.month, val)) {
      event.preventDefault()
      return false
    }

    return true
  }

  updateValue(): void {
    this.log("updateValue")

    if (this.isEmpty && !this.required) {
      return
    }

    if ((!this.day || !this.month || !this.year) && this.required) {
      this.raiseError({
        element: DateElement.DATE,
        error: "error.date.required",
      })
      return
    }

    if (!this.yearInput) {
      this.raiseError({
        element: DateElement.DATE,
        error: "error.date.invalid",
      })
      return
    }

    const dateISO = `${(this.yearInput ?? "").padStart(4, "0")}-${this.monthInput ?? ""}-${this.dayInput ?? ""}`
    this.log("isoDate " + dateISO)

    const timestamp = Date.parse(dateISO)

    if (Number.isNaN(timestamp) || (this.year && (this.year < this.minYear || this.year > this.maxYear))) {
      this.log("Not a valid date")
      if (!this.inDate) {
        this.raiseError({
          element: DateElement.DATE,
          error: "error.date.invalid",
        })
      }
      return
    }

    this.log("Emit value")
    this.showError = false
    this.$emit(`input`, this.formatToInput(dateISO))
    this.$emit(`isoDate`, dateISO)
  }

  /* COMPUTED PROPERTIES */
  get day(): number | undefined {
    return this.dayInput ? parseInt(this.dayInput) : undefined
  }

  get month(): number | undefined {
    return this.monthInput ? parseInt(this.monthInput) : undefined
  }

  get year(): number | undefined {
    return this.yearInput ? parseInt(this.yearInput) : undefined
  }

  get isEmpty(): boolean {
    return (this.day   === undefined || this.day   === 0)
        && (this.month === undefined || this.month === 0)
        && (this.year  === undefined  || this.year  === 0)
  }

  get notEmpty(): boolean {
    return !this.isEmpty
  }

  private isLeapYear = (year?: number): boolean => {
    if (!year) {
      return false
    }
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  }

  /* PRIVATE UTILITY/HELPER METHODS */
  private monthWith30Days = (month: number): boolean => [4, 6, 9, 11].includes(month)
  private monthWith31Days = (month: number): boolean =>
      [1, 3, 5, 7, 8, 10, 12].includes(month)


  private logState() {
    this.log(`
      endOfElement  ${this.endOfElement}
      inDate        ${this.inDate}
      dayInput      ${this.dayInput}
      monthInput    ${this.monthInput}
      yearInput     ${this.yearInput}
      showError     ${this.showError}
      virtualValue  ${this.virtualValue}
      fieldComplete ${this.fieldComplete}
      controlKey    ${this.controlKey}


    `)
  }

  private isValidDay(day?: number, month?: number, year?: number): boolean {
    if (!day) {
      return true
    }

    if (day < 29) {
      return true
    }

    if (month) {
      if (day === 30 && this.monthWith30Days(month)) {
        return true
      }
      if (day === 31 && this.monthWith31Days(month)) {
        return true
      }
      if (day === 29 && month === 2 && this.isLeapYear(year)) {
        return true
      }

      return day < 30
    }

    return day < 32
  }

  private isValidMonth(day?: number, month?: number, year?: number): boolean {
    if (!month) {
      return true
    }

    if (month > 12) {
      return false
    }

    if (day) {
      if (this.monthWith30Days(month)) {
        return day < 31
      }
      if (this.monthWith31Days(month)) {
        return day < 32
      }
      if (month === 2) {
        if (!year || this.isLeapYear(year)) {
          return day < 30
        }

        return day < 29
      }
    }

    return true
  }

  private isValidYear(day?: number, month?: number, year?: number): boolean {
    if (!year) {
      return true
    }

    if (month === 2 && day && day === 29 && !this.isLeapYear(year)) {
      return false
    }

    return year >= this.minYear && year <= this.maxYear
  }

  private raiseError(error: InputError) {
    this.$emit(`error`, error)
  }

  private static isNumber(event: KeyboardEvent): boolean {
    return event.key >= "0" && event.key <= "9"
  }

  private filterInput(event: KeyboardEvent): boolean {
    return this.ACCEPT_CODE(event.code) || PPlainDateInput.isNumber(event)
  }

  /*
  On keydown we don't know the value of the input when the key is released.
  This method emulates this. This enables the keydown event to validate the final value
  and block any input before it is written
  */
  private getInputValueOnKeydown(event: KeyboardEvent): string {
    this.log("getInputValueOnKeydown")
    const inputElement = event.currentTarget as HTMLInputElement
    const caretPos = PPlainDateInput.caretPosition(inputElement)
    this.endOfElement = false;

    const selectedText = document.getSelection()?.toString()
    const inputValue = selectedText
        ? inputElement.value.replace(selectedText, "")
        : inputElement.value

    this.log("selected text" + selectedText + "  inputValue " + inputValue)
    if (caretPos == inputElement.maxLength) {
      this.endOfElement = true
      this.virtualValue = "0" + event.key
      return "0" + event.key
    }

    if (caretPos === 0) {
      this.virtualValue = event.key
      return this.virtualValue
    } else {
      if (inputElement.maxLength === 2) {
        this.virtualValue = inputValue + event.key
        return this.virtualValue
      } else {
        this.virtualValue =
            inputValue.substring(0, caretPos) +
            event.key +
            inputValue.substring(caretPos)
        return this.virtualValue
      }
    }
  }

  private nextElement(event: KeyboardEvent): void {
    this.log("nextElement")
    const element = event.target as HTMLInputElement
    if (this.endOfElement) {
      element.value = this.virtualValue
    }

    this.focusNextElement(event)
  }

  private nextInputElement(
      element: HTMLInputElement, next: boolean
  ): HTMLInputElement | undefined {
    switch (this.format) {
      case DateFormat.EU:
        if (element === this.$refs.day) {
          return next ? this.$refs.month as HTMLInputElement : undefined
        } else if (element === this.$refs.month) {
          return next ? this.$refs.year as HTMLInputElement : this.$refs.day as HTMLInputElement
        } else {
          return next ?  undefined : this.$refs.month as HTMLInputElement
        }
      case DateFormat.US:
        if (element === this.$refs.day) {
          return next ? this.$refs.year as HTMLInputElement : this.$refs.month as HTMLInputElement
        } else if (element === this.$refs.month) {
          return next ? this.$refs.day as HTMLInputElement : undefined
        } else {
          return next ? undefined : this.$refs.day as HTMLInputElement
        }
      case DateFormat.ISO:
        if (element === this.$refs.day) {
          return next ? undefined : this.$refs.month as HTMLInputElement
        } else if (element === this.$refs.month) {
          return next ? this.$refs.day as HTMLInputElement : this.$refs.year as HTMLInputElement
        } else {
          return next ? this.$refs.month as HTMLInputElement : undefined
        }
    }
  }

  private isComplete(element: HTMLInputElement): boolean {
    this.log("Virtual value " + this.virtualValue + ", element value " + element.value)
    let complete = this.virtualValue.length === element.maxLength && element.value.length > 0
    if (!complete) {
      if (element.classList.contains("w-day")) {
          complete = element.value > '3'
      }
      else if (element.classList.contains("w-month")) {
        complete = element.value > '1'
      }

    }

    this.log("Field is complete? " + complete)
    return  complete
  }

  private isDateComplete(): boolean {
    return this.day != undefined && this.day > 0 && this.month != undefined && this.month > 0 && this.year != undefined && this.year > 0
  }

  private focusNextElement(event: KeyboardEvent): void {
    const element = event.currentTarget as HTMLInputElement
    const nextElement = this.nextInputElement(element, true)
    this.fieldComplete = this.isComplete(element)
    if (nextElement) {
      if (this.fieldComplete) {
        nextElement.focus()
      }
    }
  }

  private static caretPosition(input: HTMLInputElement): number {
    let iCaretPos = 0
    if (input.selectionStart || input.selectionStart === 0) {
      iCaretPos =
          input.selectionDirection == "backward"
              ? input.selectionStart
              : input.selectionEnd ?? 0
    }

    return iCaretPos
  }

  private log(msg: string): void {
    this.$emit("log", msg)
  }

  private clearDate() {
    this.dayInput   = ""
    this.monthInput = ""
    this.yearInput  = ""
    this.showError = false
    this.$emit('reset')
  }

  private updateAfterBlur(): void {
    if (!this.inDate) {
      this.updateValue()
    }
  }

  private static normalizeInput(input: string, length = 2): string {
    let output = input.trim()
    if (output.length > 0) {
      if (
          output === "0" ||
          output === "00" ||
          output === "000" ||
          output === "0000"
      ) {
        output = ""
      }
      if (output.length === 1) {
        output = output.padStart(length, "0")
      }
    }

    return output
  }

  private formatToInput(isoDate: string): string {
    const dateParts = isoDate.split(this.separator)
    let date = ""

    switch (this.format) {
      case DateFormat.EU:
        date = `${dateParts[2].padEnd(2, '0')}${this.separator}${dateParts[1].padEnd(2, '0')}${this.separator}${dateParts[0].padEnd(4, '0')}`
        break
      case DateFormat.US:
        date = `${dateParts[1].padEnd(2, '0')}${this.separator}${dateParts[2].padEnd(2, '0')}${this.separator}${dateParts[0].padEnd(4, '0')}`
        break
      case DateFormat.ISO:
        date = `${dateParts[0].padEnd(2, '0')}${this.separator}${dateParts[1].padEnd(2, '0')}${this.separator}${dateParts[2].padEnd(4, '0')}`
        break
    }

    return date
  }

  private assignNewValue(newValue: string): void {
    const dayInputElm   = this.$refs.day as HTMLInputElement
    const monthInputElm = this.$refs.month as HTMLInputElement
    const yearInputElm  = this.$refs.year as HTMLInputElement

    const dateParts = newValue.split(this.separator)
    let day   = ""
    let month = ""
    let year  = ""

    if (dateParts.length === 3) {
      switch (this.format) {
        case DateFormat.EU:
          day   = dateParts[0]
          month = dateParts[1]
          year  = dateParts[2]
          break
        case DateFormat.US:
          month = dateParts[0]
          day   = dateParts[1]
          year  = dateParts[2]
          break
        case DateFormat.ISO:
          year  = dateParts[0]
          month = dateParts[1]
          day   = dateParts[2]
          break
      }

      if (this.isDatePartEmpty(year) && this.isDatePartEmpty(month) && this.isDatePartEmpty(day)) {
        return
      }

      this.dayInput   = day.padStart(2, '0')
      this.monthInput = month.padStart(2, '0')
      this.yearInput  = year.padStart(4, '0')

      this.updateValue()

    }
  }

  private ACCEPT_CODE: (code: string) => boolean = (code: string) =>
      [
        "Delete",
        "Backspace",
        "Tab",
        "Tab shiftKey",
        "ArrowLeft",
        "ArrowRight",
      ].includes(code)

  private isDatePartEmpty: (val?: string) => boolean = (datePart?: string) => !datePart || !datePart.trim() || datePart === '00' || datePart === '0000'

  private startOfField(inputElement: HTMLInputElement) {
    const caretPos = PPlainDateInput.caretPosition(inputElement)
    return caretPos == 0
  }

  private endOfField(inputElement: HTMLInputElement) {
    const caretPos = PPlainDateInput.caretPosition(inputElement)
    const maxlen = inputElement.maxLength
    return caretPos === maxlen
  }


  private nextField(event: KeyboardEvent): boolean {
    const element = event.target as HTMLInputElement
    let next = false
    if (this.endOfField(element)) {
      event.preventDefault()
      const nextElement = this.nextInputElement(element, true)
      if (nextElement) {
        next = true
        nextElement.focus()
        nextElement.setSelectionRange(0, 0)
      }
    }

    return next
  }

  private previousField(event: KeyboardEvent): boolean {
    const element = event.target as HTMLInputElement
    let next = false
    if (this.startOfField(element)) {
      const nextElement = this.nextInputElement(element, false)
      if (nextElement) {
        next = true
        event.preventDefault()
        nextElement.focus()
        nextElement.setSelectionRange(nextElement.maxLength, nextElement.maxLength)
      }
    }

    return next
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.__pdate_input {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  width: 9rem;
  padding: 4px 3px 4px 6px;
  border: 1px gray solid;
  border-radius: 4px;
}

.__pdate_input:focus-within {
  border-color: cornflowerblue;
  border-width: 2px;
}

.__pdate_input.__pdateinput_error:focus-within {
  border-color: red;
  border-width: 2px;
}

.__clearable {
  width: 9rem;
}

.__not_clearable {
  width: 8rem;
}

.datewrapper {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 0;
}

input, span, .clear {
  display: inline-block;
}

input:focus {
  outline: none;
}

.w-day {
  width: 20%;
}

.span-1 {
  width: 7%;
  margin-right: 1px;
}

.w-month {
  width: 20%;
}

.span-2 {
  width: 7%;
  margin-right: 1px;
}

.w-year {
  width: 38%;
}

.clear {
  width: 14%;
}

.clear {
  text-decoration: none;
  text-align: center;
  font-size: 90%;
  padding: 2px;
  border-radius: 10%;
  background-color: rgb(238, 238, 238);
  color: black;
  margin-left: 3px;
}

.__pdate_input__divider {
  pointer-events: none;
}
.__pdateinput_error {
  border-color: red;
}

::placeholder {
  font-family: 'Courier New', Courier, monospace;
}
</style>
