# Brunswick

The extension is licensed under [AGPL-3.0](LICENSE.txt).

## Requirements

* PHP v7.4+
* CiviCRM 5.49+

## How to compile

This project uses [SASS](https://sass-lang.com/) which is a superset of CSS (all CSS is valid SASS) that gets compiled down to CSS. It is used because it makes the source files tidier and also saves on repetition. The project currently uses [Laravel Mix](https://laravel-mix.com/) to make compiling super simple - see below.

- The *first time* you come to do this on your machine/vps/container you'll
  need Node installed, then run:  `npm i -g yarn; yarn install; npx mix` which
  will install `yarn` globally on your machine; install the javascript required
  to compile the project; do the initial compile.

- Edit the sass files in src/sass/

- From the extension's main dir, run `npx mix` to do a quick build,
  `npx mix -p` to do a production build (minified, takes longer), or alternatively run
  `npx mix watch` which will recompile whenever the source files are modified.

In development you'll want to disable CiviCRM asset caching (on the development admin screen).

## Why are there many sets of CSS files output?

The output is sets of CSS files suitable for different CMS-theme contexts. Accessible themes should NOT set a `rem` size on the `HTML` element, however most do. `1rem` as a `font-size` should be a readable size for the human. Browsers typically set this at 16 CSS px, and allow users to change this meaning that they can make all well-behaved web pages accessible from just one browser config setting. However when themes fix this (e.g. Bootstrap 3 sets it to 10px - not readable!) we have no way to re-un-set it, and no way of knowing how big the rem unit is. To get around this always-unknown and out of our control situation, when the SASS is compiled we get multiple sets of output CSS files, each based on a different rem size. The idea is that the admin who configures this theme can specify the rem size used in theme, and that therefore the theme should be able to be renderable in each environment.

### Writing accessible sizes.

Ask yourself: *Does it make sense for this size to be linked to the font size?*

For many margins and paddings and border-radii it might make sense to answer yes. For borders, you prefer a set px size, so the answer is No.

There may be a tension between accessibility and design here. e.g. if you are styling a button, with standard size text in it, you might think that typographically it ought to have 2× the font size as horizontal padding. This means however big the screen, your button's aspect ratio remains constant; everything is in proportion. This is probably sensible for small buttons like "Save". However if you were to apply this to a button likely to have a long description, "Yes, I’m sure I want to delete this" then keep in mind that this text could end up wrapping for a user who has ramped up their font size for accessibility reasons because (a) there's a lot of text to fit at a large font-size and (b) because you've added 4× that size as padding.

Example: I'm styling a 'big' button. I would like text and padding to be relative to the general font-size (let's say we envisage short text content), but the border I want in px.

If you think in px, then you can work with `px()` as follows

```sass
button {                        
  font-size: px(16);
  padding: px(8) px(32);
  border: solid 1px red;
  border-radius: px(8);
}
```

If you think in rems, then you can work with `rem()` as follows

```sass
button {                        
  font-size: rem(1);
  padding: rem(0.5) rem(2);
  border: solid 1px red;
  border-radius: rem(0.5);
}
```


