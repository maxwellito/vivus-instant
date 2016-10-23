# Vivus instant

[Try Vivus Instant](https://maxwellito.github.io/vivus-instant).

> It's like Vivus but for a disposable usage. Made with CSS animations.

Single page app to create independent stroke animated SVGs.

## Why this project?

Simply because many developers seems happy to use [Vivus](https://maxwellito.github.io/vivus) to animate SVGs, however many times it's for a single use without controls or callbacks.. so why downloading an extra JS library when a piece of CSS can do the job? So here it is: Vivus instant.

By looking at the code, you can mention a copy of the Pathformer and a custom Vivus. The entire controls and drawing parts have been stripped down to let place to a rendering engine.

## Compatibility

Animated SVG are not friendly with Firefox, or the opposite. However using an `<object>` tag like in the intro box will work everywhere.

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
