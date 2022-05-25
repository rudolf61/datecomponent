<template>
  <div class="__pdate_input" :class="{ __pdateinput_error : showError, __clearable : clearable, __not_clearable : !clearable }">
    <div class="datewrapper">
      <input
          size="2"
          maxlength="2"
          ref="day"
          v-model="dayInput"
          class="__pdate_input__input __pdate_input__input--day w-day"
          type="tel"
          placeholder="dd"
          @keydown="keydownDay"
          @input="nextElement"
          @blur="blurDay"
          @focus="focusDate"
      />
      <span ref="sep1" class="__pdate_input__divider span-1">{{ separator }}</span>
      <input
          ref="month"
          size="2"
          maxlength="2"
          v-model="monthInput"
          class="__pdate_input__input __pdate_input__input--month w-month"
          type="tel"
          placeholder="mm"
          @keydown="keydownMonth"
          @input="nextElement"
          @blur="blurMonth"
          @focus="focusDate"
      />
      <span ref="sep2" class="__pdate_input__divider span-2">{{ separator }}</span>
      <input
          ref="year"
          size="4"
          maxlength="4"
          v-model="yearInput"
          class="__pdate_input__input __pdate_input__input--year w-year"
          type="tel"
          placeholder="yyyy"
          @keydown="keydownYear"
          @input="nextElement"
          @blur="blurYear"
          @focus="focusDate"
      />
    </div>
    <a v-if="clearable" ref="clear" class="clear" @click="clearDate"> &#10007;</a>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator"
import {DateElement, DateFormat, InputError} from "./type"

@Component
export default class PDateInput extends Vue {
  @Prop() private value!: string
  @Prop({default: DateFormat.EU}) private format!: DateFormat
  @Prop({default: "-"}) private separator!: string
  @Prop({default: 1900}) private minYear!: number
  @Prop({default: 2100}) private maxYear!: number
  @Prop({default: true}) private clearable!: boolean
  @Prop({default: false}) private required!: boolean
  @Prop({default: false}) private showInError!: boolean
  private inDate     = false
  private dayInput   = ""
  private monthInput = ""
  private yearInput  = ""
  private showError  = false

  /* LIFECYCLE METHODS */
  mounted(): void {
    this.reorderFields(this.format)
    this.assignNewValue(this.value)
  }

  /* EVENT HANDLERS */
  @Watch("value")
  watchValue(newValue: string)
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

  /*
      setTimout is used to perform an update the date if the user leaves the date field.
      Within the date field the blur is followed by a focus and then updateAfterBlur,
      which is not executed as long as you are within the date field.
   */
  blurDay(): void {
    this.dayInput = PDateInput.normalizeInput(this.dayInput)
    this.inDate   = false
    setTimeout(this.updateAfterBlur, 1)
  }

  blurMonth(): void {
    this.monthInput = PDateInput.normalizeInput(this.monthInput)
    this.inDate     = false
    setTimeout(this.updateAfterBlur, 1)
  }

  blurYear(): void {
    this.yearInput = PDateInput.normalizeInput(this.yearInput, 4)
    this.inDate    = false
    setTimeout(this.updateAfterBlur, 1)
  }

  focusDate(): void {
    this.inDate = true
  }

  keydownDay(event: KeyboardEvent): boolean {
    const acceptInput = this.filterInput(event)
    if (!acceptInput) {
      event.preventDefault()
      return false
    }

    if (!PDateInput.isNumber(event)) {
      return true
    }

    const newVal = this.getInputValueOnKeydown(event)

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

  keydownMonth(event: KeyboardEvent): boolean {
    const acceptInput = this.filterInput(event)
    if (!acceptInput) {
      event.preventDefault()
      return false
    }

    if (!PDateInput.isNumber(event)) {
      return true
    }

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
    const acceptInput = this.filterInput(event)
    if (!acceptInput) {
      event.preventDefault()
      return false
    }

    if (!PDateInput.isNumber(event)) {
      return true
    }

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

    const timestamp = Date.parse(dateISO)
    const d = new Date()
    if (Number.isNaN(timestamp) || (this.year && (this.year < this.minYear || this.year > this.maxYear))) {
      this.raiseError({
        element: DateElement.DATE,
        error: "error.date.invalid",
      })
      return
    }

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
    return this.ACCEPT_CODE(event.code) || PDateInput.isNumber(event)
  }

  /*
  On keydown we don't know the value of the input when the key is released.
  This method emulates this. This enables the keydown event to validate the final value
  and block any input before it is written
  */
  private getInputValueOnKeydown(event: KeyboardEvent): string {
    const inputElement = event.currentTarget as HTMLInputElement
    const caretPos = PDateInput.caretPosition(inputElement)

    if (caretPos == inputElement.maxLength) {
      return inputElement.value
    }

    const selectedText = document.getSelection()?.toString()
    const inputValue = selectedText
        ? inputElement.value.replace(selectedText, "")
        : inputElement.value

    if (caretPos === 0) {
      return event.key + inputValue
    } else {
      if (inputElement.maxLength === 2) {
        return inputValue + event.key
      } else {
        return (
            inputValue.substring(0, caretPos) +
            event.key +
            inputValue.substring(caretPos)
        )
      }
    }
  }

  private nextElement(event: KeyboardEvent): void {
    this.focusNextElement(event.currentTarget as HTMLInputElement)
  }

  private nextInputElement(
      element: HTMLInputElement
  ): HTMLInputElement | undefined {
    switch (this.format) {
      case DateFormat.EU:
        if (element === this.$refs.day) {
          return this.$refs.month as HTMLInputElement
        } else if (element === this.$refs.month) {
          return this.$refs.year as HTMLInputElement
        } else {
          return undefined
        }
      case DateFormat.US:
        if (element === this.$refs.day) {
          return this.$refs.year as HTMLInputElement
        } else if (element === this.$refs.month) {
          return this.$refs.day as HTMLInputElement
        } else {
          return undefined
        }
      case DateFormat.ISO:
        if (element === this.$refs.day) {
          return undefined
        } else if (element === this.$refs.month) {
          return this.$refs.day as HTMLInputElement
        } else {
          return this.$refs.month as HTMLInputElement
        }
    }
  }

  private isComplete(element: HTMLInputElement): boolean {
    let complete = element.value.length == element.maxLength
    if (!complete) {
      if (element.classList.contains("w-day")) {
          complete = element.value > '3'
      }
      else if (element.classList.contains("w-month")) {
        complete = element.value > '1'
      }

    }
    return  complete
  }

  private focusNextElement(element: HTMLInputElement): void {
    const nextElement = this.nextInputElement(element)

    if (nextElement && this.isComplete(element)) {
      nextElement.select()
      nextElement.focus()
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
  }

  private updateAfterBlur(): void {
    // is false if user leaves date field
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

      dayInputElm.blur()
      monthInputElm.blur()
      yearInputElm.blur()

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
  font-size: 70%;
  border-radius: 100%;
  background-color: #9f9f9f;
  color: white;
  margin-left: 3px;
}

.__pdateinput_error {
  border-color: red;
}

::placeholder {
  font-family: 'Courier New', Courier, monospace;
}
</style>
