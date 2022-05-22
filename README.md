# Custom Vue date component

## Purpose
I have built a custom date component. It is a simple date component, but it has a special feature. 
It does not allow an invalid date to be entered.

## As simple as possible but not too simple 
Although this may sound simple, it is not. The only moment you can block an input is when you catch all keydown events. But at these moments the value is not yet committed. So, I created a temporary virtual value field that behaves as if this value was committed. There are different situations you must be aware of, for example, where is the value inserted and what is the value after the insertion.

## Vue Class Component
I have used Vue Class Component. It shouldn't be too difficult to turn it into a Vue 3 component for example or even a React component.

## How is it built
The custom date component has been built with three HTML input elements and with some styling you can give the suggestion that we are dealing with one input field. 
The advantage is that you don’t have to navigate within one field, which introduces extra complexity, the downside is that I need to control the context of these fields. I must know if you are within or outside the component. 
Using setTimeOut, focus and blur it is possible to figure out if you are in or outside the date component. 

### Properties
The properties that are accepted by the date component are:
1.	value
2.	separator
3.	required
4.	clearable
5.	format
6.	min and max year
7.	show when there is an error (red border)
      This component is as simple as possible and if there is a need to add extra’s, then it must be composed with other components. There are also not slots.
      I created a very simple demo, to give some idea how it works

The format accepted are EU (dd-mm-yyyy), US (mm-dd-yyyy) and ISO (yyyy-mm-dd).

## How does it work?
To give you an idea about its behaviour. When you would fill in 31 as day this will have an impact on month. Therefore, you can only fill in 01, 03, 05, 07, 08, 10 and 12 for month. If you fill in 29, then you can fill in 2 for the month. But that will limit the range of years to leap years. It doesn’t matter what your starting point is, the component will always determine which are the valid values given the current context. This way it will be impossible to fill in an invalid date, unless you leave the date field with your mouse for example. At that moment the value of the date field will be invalid.

All properties have a runtime impact, that is you can change it and you will directly see the consequences.
The date component returns an iso date, just like input of type date.

## Not ready for production
I wouldn't say that this component is ready for production. It might still contain errors. One error I'm aware off is when you turn off insertion mode. This will not insert the value, but overwrite it. This has to be fixed.
