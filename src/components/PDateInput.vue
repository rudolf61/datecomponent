<template>
  <div class="__pdate_input">
    <input
      size="2"
      maxlength="2"
      ref="day"
      v-model="dayInput"
      class="__pdate_input__input __pdate_input__input--day"
      type="tel"
      placeholder="dd"
      @keydown="keydownDay"
      @input="nextElement"
      @blur="blurDay"
    />
    <span class="__pdate_input__divider">{{ separator }}</span>
    <input
      ref="month"
      size="2"
      maxlength="2"
      v-model="monthInput"
      class="__pdate_input__input __pdate_input__input--month"
      type="tel"
      placeholder="mm"
      @keydown="keydownMonth"
      @input="nextElement"
      @blur="blurMonth"
    />
    <span class="__pdate_input__divider">{{ separator }}</span>
    <input
      ref="year"
      size="4"
      maxlength="4"
      v-model="yearInput"
      class="__pdate_input__input __pdate_input__input--year"
      type="tel"
      placeholder="yyyy"
      @keydown="keydownYear"
      @input="nextElement"
      @blur="blurYear"
    />
    <a  href='#' class="clear" @click="clearDate"> &#10007;</a>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DateFormat, InputError, DateElement } from "./type";

@Component
export default class PDateInput extends Vue {
  @Prop() private value!: string;
  @Prop({ default: DateFormat.EU }) private format!: DateFormat;
  @Prop({ default: "-" }) private separator!: string;
  @Prop({ default: 1900 }) private minYear!: number;
  @Prop({ default: 2100 }) private maxYear!: number;

  private dayInput = "";
  private monthInput = "";
  private yearInput = "";

  private clearDate() {
    this.dayInput = "";
    this.monthInput = "";
    this.yearInput = "";
  }

  private findNextFocusElement(element?: HTMLInputElement): HTMLElement | undefined {

    if (element === undefined) {
      return undefined
    }

    const inputs = ['input', 'select', 'button', 'textarea'];
    let nextSibling = element.nextElementSibling as HTMLElement
    while (nextSibling != undefined) {
      if (inputs.includes(nextSibling.tagName)) {
        return nextSibling
      }
      let nextSibling = element.nextElementSibling as HTMLElement
    }

    return this.findNextFocusElement(element.parentElement)
    
  }

  private normalizeInput(input: string, length = 2): string {
    let output = input.trim()
    if (output.length > 0) {
      if (output === '0' || output === '00' || output === '000' || output === '0000') {
        output = ""
      }
      if (output.length === 1) {
        output = output.padStart(length, '0')
      }
    }

    return output

  }

  blurDay(): void {
    this.dayInput = this.normalizeInput(this.dayInput)
  }

  blurMonth(): void {
    this.monthInput = this.normalizeInput(this.monthInput)
  }

  blurYear(): void {
    this.yearInput = this.normalizeInput(this.yearInput, 4)
  }

  mounted(): void {
    const dayInputElm = this.$refs.day as HTMLInputElement;
    const monthInputElm = this.$refs.day as HTMLInputElement;
    const yearInputElm = this.$refs.day as HTMLInputElement;
    const parent = dayInputElm.parentElement;

    if (this.format != DateFormat.EU) {
      parent?.removeChild(dayInputElm);
      parent?.removeChild(monthInputElm);
      parent?.removeChild(yearInputElm);
    }

    if (this.format == DateFormat.US) {
      parent?.append(monthInputElm);
      parent?.removeChild(dayInputElm);
      parent?.removeChild(yearInputElm);
    } else if (this.format == DateFormat.ISO) {
      parent?.removeChild(yearInputElm);
      parent?.removeChild(monthInputElm);
      parent?.removeChild(dayInputElm);
    }
  }

  get day(): number | undefined {
    return this.dayInput ? parseInt(this.dayInput) : undefined;
  }

  get month(): number | undefined {
    return this.monthInput ? parseInt(this.monthInput) : undefined;
  }

  get year(): number | undefined {
    return this.yearInput ? parseInt(this.yearInput) : undefined;
  }

  caretPosition(input: HTMLInputElement): number {
    let iCaretPos = 0;
    if (input.selectionStart || input.selectionStart == 0) {
      iCaretPos =
        input.selectionDirection == "backward"
          ? input.selectionStart
          : input.selectionEnd ?? 0;
    }

    return iCaretPos;
  }

  /*
    On keydown we don't know the value of the input when the key is released.
    This method emulates this. This enables the keydown event to validate the final value
    and block any input before it is written
    */
  getInputValueOnKeydown(event: KeyboardEvent): string {
    const inputElement = event.currentTarget as HTMLInputElement;
    const caretPos = this.caretPosition(inputElement);

    if (caretPos == inputElement.maxLength) {
      return inputElement.value;
    }

    const selectedText = document.getSelection()?.toString();
    const inputValue = selectedText
      ? inputElement.value.replace(selectedText, "")
      : inputElement.value;

    if (caretPos == 0) {
      return event.key + inputValue;
    } else {
      if (inputElement.maxLength == 2) {
        return inputValue + event.key;
      } else {
        return (
          inputValue.substring(0, caretPos) +
          event.key +
          inputValue.substring(caretPos)
        );
      }
    }
  }

  keydownDay(event: KeyboardEvent): boolean {
    this.log(`Day character code ${event.key}`);

    const acceptInput = this.filterInput(event);
    this.log(`Accept input ${acceptInput}`);
    if (!acceptInput) {
      event.preventDefault();
      return false;
    }

    if (!this.isNumber(event)) {
      return true;
    }

    const newVal = this.getInputValueOnKeydown(event);
    this.log(`newVal= ${newVal}`);

    let dayOk = false;
    if (newVal != "00") {
      const val = parseInt(newVal);
      dayOk = this.isValidDay(val, this.month, this.year);
    }

    this.log(`Is day ok? ${dayOk}`);

    if (dayOk) {
      return true;
    } else {
      this.raiseError({ element: DateElement.DD, error: "error.invalid.day" });
      event.preventDefault();
      return false;
    }
  }

  isLeapYear = (year?: number): boolean => {
    if (!year) {
      return false;
    }
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  monthWith30Days = (month:number) : boolean => [4, 6, 9, 11].includes(month)
  monthWith31Days = (month:number) : boolean => [1, 3, 5, 7, 8, 10, 12].includes(month)


  isValidDay(day?: number, month?: number, year?: number): boolean {
    if (!day) {
      return true;
    }

    if (day < 29) {
      return true;
    }

    if (month) {
      if (day === 30 && this.monthWith30Days(month)) {
        return true;
      }
      if (day === 31  && this.monthWith31Days(month)) {
        return true;
      }
      if (day === 29 && month === 2 && this.isLeapYear(year)) {
        return true;
      }

      return day < 30
    }

    return day < 32;
  }

  isValidMonth(day?: number, month?: number, year?: number): boolean {
    if (!month) {
      return true;
    }

    if (month > 12) {
      return false;
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

  isValidYear(day?: number, month?: number, year?: number): boolean {
    if (!year) {
      return true;
    }

    if (month === 2 && day && day === 29 && !this.isLeapYear(year)) {
      return false
    }

    return year >= this.minYear && year <= this.maxYear;
  }

  keydownMonth(event: KeyboardEvent): boolean {
    this.log(`Month character code ${event.key}`);

    const acceptInput = this.filterInput(event);
    this.log(`Accept input ${acceptInput}`);
    if (!acceptInput) {
      event.preventDefault();
      return false;
    }

    if (!this.isNumber(event)) {
      return true;
    }

    const newVal = this.getInputValueOnKeydown(event);
    this.log(`newVal= ${newVal}`);
    if (newVal != "00") {
      const val = parseInt(newVal);
      const valid = this.isValidMonth(this.day, val, this.year);
      this.log(`Is month valid ${valid}`);
      if (valid) {
        return true
      }
    }

    this.raiseError({ element: DateElement.MM, error: "error.invalid.month" });
    event.preventDefault();
    return false;
  }

  keydownYear(event: KeyboardEvent): boolean {
    this.log(`Year character code ${event.key}`);

    const acceptInput = this.filterInput(event);
    this.log(`Accept input ${acceptInput}`);
    if (!acceptInput) {
      event.preventDefault();
      return false;
    }

    if (!this.isNumber(event)) {
      return true;
    }

    const newVal = this.getInputValueOnKeydown(event);
    const allZeroes = newVal === "0000";
    this.log(`newVal= ${newVal} is all zeroes ${allZeroes}`);
    if (allZeroes) {
      event.preventDefault();
      return false;
    }

    const val = parseInt(newVal);
    if (newVal.length === 4 && !this.isValidYear(this.day, this.month, val)) {
      event.preventDefault();
      return false;
    }

    return true;
  }

  nextElement(event: KeyboardEvent): void {
    this.focusNextElement(event.currentTarget as HTMLInputElement);
  }

  updateValue(): void {
    const timestamp = Date.parse(
      `${(this.yearInput ?? "").padStart(4, "0")}-${this.monthInput ?? ""}-${
        this.dayInput ?? ""
      }`
    );
    if (Number.isNaN(timestamp)) {
      this.raiseError({
        element: DateElement.DATE,
        error: "error.invalid.date",
      });
      return;
    }

    this.$emit(`input`, timestamp);
  }

  private raiseError(error: InputError) {
    this.$emit(`error`, error);
  }

  private isNumber(event: KeyboardEvent): boolean {
    return event.key >= "0" && event.key <= "9";
  }

  private filterInput(event: KeyboardEvent): boolean {
    if (
      event.code == "Delete" ||
      event.code == "Backspace" ||
      event.code == "Tab" ||
      event.code == "Tab shiftKey" ||
      event.code == "ArrowLeft" ||
      event.code == "ArrowRight" ||
      this.isNumber(event)
    ) {
      return true;
    }

    return false;
  }

  private nextInputElement(
    element: HTMLInputElement
  ): HTMLInputElement | undefined {
    switch (this.format) {
      case DateFormat.EU:
        if (element == this.$refs.day) {
          return this.$refs.month as HTMLInputElement;
        } else if (element == this.$refs.month) {
          return this.$refs.year as HTMLInputElement;
        } else {
          return undefined;
        }
      case DateFormat.US:
        if (element == this.$refs.day) {
          return this.$refs.year as HTMLInputElement;
        } else if (element == this.$refs.month) {
          return this.$refs.day as HTMLInputElement;
        } else {
          return undefined;
        }
      case DateFormat.ISO:
        if (element == this.$refs.day) {
          return undefined;
        } else if (element == this.$refs.month) {
          return this.$refs.day as HTMLInputElement;
        } else {
          return this.$refs.month as HTMLInputElement;
        }
    }
  }

  private focusNextElement(element: HTMLInputElement): void {
    const nextElement = this.nextInputElement(element);
    if (nextElement && element.value.length == element.maxLength) {
      nextElement.select();
      nextElement.focus();
    }
  }

  private formatNumber(n: number): string {
    return n.toString().padStart(5, "0");
  }

  private log(msg: string): void {
    this.$emit("log", msg);
  }
}
</script>
<style scoped>
.__pdate_input {
  margin: auto;
  padding: 5px;
  width: 8%;
  border: 1px gray solid;
  white-space: nowrap;
  border-radius: 4px;;
}

input {
  display: inline-block;
  border: 0;
  width: 25px;
  text-align: center;
}

.__pdate_input__input--year {
  width: 32px;
}

.clear {
  text-decoration: none;
  font-size: 70%;
}
</style>
