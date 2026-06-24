fx_version 'cerulean'

games { 'gta5' }

lua54 'yes'

client_scripts {
    'config.lua',
    'client/main.lua',
}

files({
    'ui/build/**/*',
})

dependencies {
    'qs-smartphone',
}

escrow_ignore {
    'config.lua',
    'client/main.lua',
}

dependency '/assetpacks'
