# Vivus instant

Vivus instant: it's like Vivus but for a disposable usage. I mean if you can animate your SVG with CSS only, let's forget about your JS. Right?
So dat is for you.


## Le plan

- Build prettey layout
- Build main controller
- Build drag and drop system
- Make download buttons
- Clean the VivusInstant code
- Make optimisations about CSS outputted
- Make user feedback (show error and stuff)
- Make pretty splash logo
- Make the background color changeable
- Add github link


## Le Flow

1. Load the SVG
2. Pass it through the Pathformer
3. Add unique classes to each path

-- Now you are ready to get user input
-- The following is triggered by pressing GO

4. Grab form data
5. Check if it's correct, if not : shoot!
6. Provide this data to the custom Vivus
   this one will store all the different styling
7. Generate the CSS
8. Set it to the page

-- Other user actions

- Download button (all embeded / svg only / style only)
- Add/Remove trigger class


## Options attributes

type
start (+)
loop (+)
intervalPause (+)
duration
delay
pathTimingFunction
dashGap

*(+): got influence on output CSS structure*
