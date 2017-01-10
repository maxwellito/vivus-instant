# Vivus instant

[Try Vivus Instant](https://maxwellito.github.io/vivus-instant/).

> It's like [Vivus](https://maxwellito.github.io/vivus/) but for a disposable usage. Powered by CSS animations.

Single page app to create independent stroke animated SVGs. Open your SVG to make sure that the < g > tag has stroke in there somewhere.

## Why this project?

Many developers seem happy to use [Vivus](https://maxwellito.github.io/vivus/) to animate SVGs, however many times it's for a single use without controls or callbacks... so why downloading an extra JS library when a piece of CSS can do the job? So here it is: Vivus instant.

By looking at the code, you can mention a copy of the Pathformer and a custom Vivus. The entire controls and drawing parts have been stripped down to let place to a rendering engine.

## How to use this SVG?

```html
<!-- This should work everywhere -->
<object type="image/svg+xml" data="your_animated_svg.svg"></object>

<!-- This might be clunky -->
<img src="your_animated_svg.svg"/>

<!-- Copy pasting your animated SVG to use it inline -->
<svg>
  ...
</svg>
```

### Manual trigger

This works by adding the trigger class to the SVG tag. Unfortunately, it can only be done inline, that means your entire SVG code must be in your HTML page. Otherwise the trigger won't work.
However in a object tag it is possible to access the SVG tag to add the trigger class, but it require some extra logic to wait the document load. The tag is accessible vie the property `contentDocument` of the `<object>` tag.

## Help and feedback

This tool is in beta. Any feedback or bug reports are welcome. Please open an issue or a pull request. Just follow the requirements in the issue template :)
