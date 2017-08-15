fis.match('*.js', {
    //optimizer: fis.plugin('uglify-js')
});

fis.media('prod').match('*.js', {
    optimizer: fis.plugin('uglify-js')
});

fis.hook('amd', {});

fis.match('src/**/**.js', {
    moduleId: '$1/$2'
});
