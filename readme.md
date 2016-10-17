# Vivus instant

[Go play with Vivus Instant here](https://maxwellito.github.io/vivus-instant).

> It's like Vivus but for a disposable usage. Made with CSS animations.


## Why this project?

Simply because many developers seems happy to use [Vivus](https://maxwellito.github.io/vivus) to animate SVGs, however many times it's for a single use without controls or callbacks.. so why downloading an extra JS library when a piece of CSS can do the job? So here it is: Vivus instant.

By looking at the code, you can mention a copy of the Pathformer and a custom Vivus. The entire controls and drawing parts have been stripped down to let place to a rendering engine.

## How to use this SVG?

Some options might require a specific integration.

### Manual trigger

This works by adding the trigger class on the parent SVG tag. Because of this, it must be done inline, that means your entire SVG code must be in your HTML page. Otherwise the trigger won't work.
So in this case it's not possible to embed your sweet SVG relatively via an <img> tag.

### `<img>` tag

By definition, integrating via this way should work across modern browsers. Please check to ensure the correct behavior across platforms.

### Inline SVG

This way remain the most reliable. If it doesn't work, it's because the browser doesn't support CSS animations. Sorry, not sorry.

## Help and feedback

This tools is in beta. Any feedback or bug report is welcome. Please open an issue or a pull request. Just follow the requirements in the issue template :)







## Intro text

Make drawing stroke animation without JavaScript. Simply drag and drop your SVG and set your options. The result will be animated by CSS and ready to export. To be used inline or in a <img> tag.

If you want to play with it but you need an SVG for it, download the unanimated logo.

## Le plan

[x] Build prettey layout
[x] Build main controller
[x] Build drag and drop system
[x] Make download buttons
[x] Clean the VivusInstant code
[ ] Make optimisations about CSS outputted
[ ] Make user feedback (show error and stuff)
[x] Make pretty splash logo
[x] Make the background color changeable
[x] Add github link

[ ] Toolbar feedback
[ ] Trigger manual + download
[ ] Intro message
[ ] Form validation
[ ] Add honest comments

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
