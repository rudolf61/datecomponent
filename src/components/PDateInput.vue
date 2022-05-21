<template>
  <div class="__pdate_input">
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
        @focusin="focusIn"
        @focusout="focusOut"
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
        @focusin="focusIn"
        @focusout="focusOut"
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
        @focusin="focusIn"
        @focusout="focusOut"
    />
    <a v-if="clearable" ref="clear" class="clear" @click="clearDate"> &#10007;</a>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {DateElement, DateFormat, InputError} from "./type";

@Component
export default class PDateInput extends Vue {
  @Prop() private value!: string;
  @Prop({default: DateFormat.EU}) private format!: DateFormat;
  @Prop({default: "-"}) private separator!: string;
  @Prop({default: 1900}) private minYear!: number;
  @Prop({default: 2100}) private maxYear!: number;
  @Prop({default: true}) private clearable!: boolean;
  @Prop({default: false}) private required!: boolean;
  private inDate = false
  private dayInput = "";
  private monthInput = "";
  private yearInput = "";

  mounted(): void {
    this.reorderFields(this.format)
  }

  @Watch("format")
  reorderFields(newVal: string) {
    const dayInputElm = this.$refs.day as HTMLInputElement;
    const monthInputElm = this.$refs.month as HTMLInputElement;
    const yearInputElm = this.$refs.year as HTMLInputElement;
    const sep1 = this.$refs.sep1 as HTMLSpanElement
    const sep2 = this.$refs.sep2 as HTMLSpanElement
    const clear = this.$refs.clear as HTMLAnchorElement
    const parent = dayInputElm.parentElement;

    parent?.removeChild(dayInputElm);
    parent?.removeChild(sep1);
    parent?.removeChild(monthInputElm);
    parent?.removeChild(sep2);
    parent?.removeChild(yearInputElm);
    if (clear) {
      parent?.removeChild(clear);
    }

    if (newVal === "EU") {
      parent?.append(dayInputElm);
      parent?.append(sep1);
      parent?.append(monthInputElm);
      parent?.append(sep2);
      parent?.append(yearInputElm);
      if (clear) {
        parent?.append(clear);
      }
    } else if (newVal === "US") {
      parent?.append(monthInputElm);
      parent?.append(sep1);
      parent?.append(dayInputElm);
      parent?.append(sep2);
      parent?.append(yearInputElm);
      if (clear) {
        parent?.append(clear);
      }
    } else if (newVal === "ISO") {
      parent?.append(yearInputElm);
      parent?.append(sep1);
      parent?.append(monthInputElm);
      parent?.append(sep2);
      parent?.append(dayInputElm);
      if (clear) {
        parent?.append(clear);
      }
    }

  }

  blurDay(): void {
    this.dayInput = this.normalizeInput(this.dayInput);
    this.inDate = false
    setTimeout(this.updateAfterBlur, 1)
  }

  blurMonth(): void {
    this.monthInput = this.normalizeInput(this.monthInput);
    this.inDate = false
    setTimeout(this.updateAfterBlur, 1)
  }

  blurYear(): void {
    this.yearInput = this.normalizeInput(this.yearInput, 4);
    this.inDate = false
    setTimeout(this.updateAfterBlur, 1)
  }

  focusDate(): void {
    this.inDate = true
  }

  focusIn(input: HTMLInputElement): void {
    input.parentElement?.classList.add('is-active', 'is-completed')
  }

  focusOut(input: HTMLInputElement): void {
    input.parentElement?.classList.remove('is-active', 'is-completed')
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
    if (input.selectionStart || input.selectionStart === 0) {
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

    if (caretPos === 0) {
      return event.key + inputValue;
    } else {
      if (inputElement.maxLength === 2) {
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

  isLeapYear = (year?: number): boolean => {
    if (!year) {
      return false;
    }
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  };

  monthWith30Days = (month: number): boolean => [4, 6, 9, 11].includes(month);
  monthWith31Days = (month: number): boolean =>
      [1, 3, 5, 7, 8, 10, 12].includes(month);

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
      if (day === 31 && this.monthWith31Days(month)) {
        return true;
      }
      if (day === 29 && month === 2 && this.isLeapYear(year)) {
        return true;
      }

      return day < 30;
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
        return day < 31;
      }
      if (this.monthWith31Days(month)) {
        return day < 32;
      }
      if (month === 2) {
        if (!year || this.isLeapYear(year)) {
          return day < 30;
        }

        return day < 29;
      }
    }

    return true;
  }

  isValidYear(day?: number, month?: number, year?: number): boolean {
    if (!year) {
      return true;
    }

    if (month === 2 && day && day === 29 && !this.isLeapYear(year)) {
      return false;
    }

    return year >= this.minYear && year <= this.maxYear;
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
      event.preventDefault();
      return false;
    }
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
    if (newVal !== "00") {
      const val = parseInt(newVal);
      const valid = this.isValidMonth(this.day, val, this.year);
      this.log(`Is month valid ${valid}`);
      if (valid) {
        return true;
      }
    }

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
    this.log('BURP updateValue')

    if ((!this.day || !this.month || !this.year) && this.required) {
      this.raiseError({
        element: DateElement.DATE,
        error: "error.date.required",
      });
      return;

    }


    if (!this.yearInput) {
      this.raiseError({
        element: DateElement.DATE,
        error: "error.date.invalid",
      });
      return;
    }

    const dateISO = `${(this.yearInput ?? "").padStart(4, "0")}-${this.monthInput ?? ""}-${this.dayInput ?? ""}`;
    const timestamp = Date.parse(dateISO);

    if (Number.isNaN(timestamp)) {
      this.raiseError({
        element: DateElement.DATE,
        error: "error.date.invalid",
      });
      return;
    }

    this.$emit(`input`, dateISO);
  }

  private raiseError(error: InputError) {
    this.$emit(`error`, error);
  }

  private isNumber(event: KeyboardEvent): boolean {
    return event.key >= "0" && event.key <= "9";
  }

  private filterInput(event: KeyboardEvent): boolean {
    if (this.ACCEPT_CODE(event.code) || this.isNumber(event)) {
      return true;
    }

    return false;
  }

  private nextInputElement(
      element: HTMLInputElement
  ): HTMLInputElement | undefined {
    this.log(`day ${element === this.$refs.day} month ${this.$refs.month as HTMLInputElement}`)
    switch (this.format) {
      case DateFormat.EU:
        if (element === this.$refs.day) {
          return this.$refs.month as HTMLInputElement;
        } else if (element === this.$refs.month) {
          return this.$refs.year as HTMLInputElement;
        } else {
          return undefined;
        }
      case DateFormat.US:
        if (element === this.$refs.day) {
          return this.$refs.year as HTMLInputElement;
        } else if (element === this.$refs.month) {
          return this.$refs.day as HTMLInputElement;
        } else {
          return undefined;
        }
      case DateFormat.ISO:
        if (element === this.$refs.day) {
          return undefined;
        } else if (element === this.$refs.month) {
          return this.$refs.day as HTMLInputElement;
        } else {
          return this.$refs.month as HTMLInputElement;
        }
    }
  }

  private focusNextElement(element: HTMLInputElement): void {
    const nextElement = this.nextInputElement(element);
    this.log(`next ${nextElement}`)
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

  private clearDate() {
    this.dayInput = "";
    this.monthInput = "";
    this.yearInput = "";
  }

  private updateAfterBlur(): void {
    // is false if user leaves date field
    if (!this.inDate) {
      this.updateValue()
    }
  }

  private normalizeInput(input: string, length = 2): string {
    let output = input.trim();
    if (output.length > 0) {
      if (
          output === "0" ||
          output === "00" ||
          output === "000" ||
          output === "0000"
      ) {
        output = "";
      }
      if (output.length === 1) {
        output = output.padStart(length, "0");
      }
    }

    return output;
  }

  private ACCEPT_CODE: (code: string) => boolean = (code: string) =>
      [
        "Delete",
        "Backspace",
        "Tab",
        "Tab shiftKey",
        "ArrowLeft",
        "ArrowRight",
      ].includes(code);
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.__pdate_input {
  display: inline-block;
  padding: 0.3rem;
  width: 9rem;
  border: 1px gray solid;
  border-radius: 4px;
}

input, span, .clear {
  display: inline-block;
}

.w-day   { width: 17%; }
.span-1  { width: 5%; margin-right: 1px; }
.w-month { width: 24%; }
.span-2  { width: 5%; margin-right: 1px; }
.w-year  { width: 30%; }
.clear   { width: 13%; }

.clear {
  text-decoration: none;
  text-align: center;
  font-size: 70%;
  border-radius: 100%;
  background-color: #9f9f9f;
  color: white;
  margin-left: 3px;
}
</style>
