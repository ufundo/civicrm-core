let mix = require('laravel-mix');
mix
  // .js('src.js', 'dist.js')
 .sass('src/sass/size10.scss', 'css/')
 .sass('src/sass/size14.scss', 'css/')
 .sass('src/sass/size16.scss', 'css/')
 .sass('src/sass/size18.scss', 'css/')
;
