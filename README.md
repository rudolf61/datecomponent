# Custom Vue date component

## Purpose
This is a simple custom date component without a fancy date picker (PPLainDateInput). It is a simple, but it is a real date component which only accepts valid date input.

It has support for three most common date formats EU, US and ISO, but could easily be extended.

## As simple as possible but not too simple 
Although this may sound simple, it is not. The only moment you can block an input is when you catch all keydown events. But at these moments the value is not yet committed. So, I construct the value as if it was committed. It is not as simple as appending, because a characters can be inserted anywhere.

## Vue Class Component
I have used Vue Class Component. It shouldn't be too difficult to turn it into a Vue 3 component for example or even a React component.

## How is it built
The custom date component has been built with three HTML input elements and with some styling you can give the suggestion that we are dealing with one input field. 

The advantage is that you don’t have to navigate within one field, which introduces extra complexity, the downside is that I need to control the context of these fields. I must know if you are within or outside the component. Using setTimeOut, focus and blur it is possible to figure out if you are in or outside the date component. 

### Properties
The properties that are accepted by the date component are:
1.	value
2.	separator
3.	required
4.	clearable
5.	format
6.	min and max year
7.	show when there is an error (red border)
8.	eager emit
      
This component is as simple as possible and if there is a need to add extra’s, then it must be composed with other components. There are also not slots.
I created a very simple demo, to give some idea how it works

The formats accepted are EU (dd-mm-yyyy), US (mm-dd-yyyy) and ISO (yyyy-mm-dd).

The separator is implicitly determined by the format, but I have chosen to make a separation between the order and the separator itself.

There might be situations that the date is in an error state. As long as you are within the date component, this shouldn't be the case. But as soon as you leave the date component it can be incomplete. 

If you choose for clearable you can clear the state of the date component, also the error state.

When the date field is required you must enter data as soon as you enter the date field.

The simple date field only emits an iso date (same as input type="date") if you leave the date field (blur), but there might be situations that you want to emit the avlue eagerly. This can be accomplished with eagerEmit. The date component only emits (@isoDate) valid date values.

## How does it work?
To give you an idea about its behaviour. When you would fill in 31 as day this will have an impact on month. Therefore, you can only fill in 01, 03, 05, 07, 08, 10 and 12 for month. If you fill in 29, then you can fill in 2 for the month. But that will limit the range of years to leap years. It doesn’t matter what your starting point is, the component will always determine which are the valid values given the current context. This way it will be impossible to fill in an invalid date, unless you leave the date field with your mouse for example. At that moment the value of the date field will be invalid.

I have added an input type="date" to compare the behaviour of this simple date field with the behaviour of Chrome and Firefox. I have tried to adapt this behaviour as much as possible so that it feels natural to work with this component.

All properties have a runtime impact, that is you can change it and you will directly see the consequences.
The date component returns an iso date, just like input of type date.

## Events
This component raises the following events

1. @log  This event has been added to monitor the keyevents, so that I was able to analyze problems I encountered - this will be removed in the future
2. @error If an error is raied, this will be emitted via this event. I'm using 
3. @isoDate this is the most important event. It contains the valid date in iso format (yyyy-mm-dd)
4. @reset when you click on the clear button, you might want to clear something related to this date field.
5. @input this is input entered by the user with the given format. Could be used with v-model.

## Separation of input and output
Just like input of type date, a distinction has been made between the input (determined by format) and the output (always iso format). This is a much better implementation then combining these two.

## Not ready for production
This component has not been used in production, so there might still be some issues. Please inform me if you find one.
