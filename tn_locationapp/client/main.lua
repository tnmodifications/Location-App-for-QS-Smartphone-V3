local PHONE_RESOURCE = 'qs-smartphone'
local ui = 'https://cfx-nui-' .. GetCurrentResourceName() .. '/ui/build/'
local APP_ID = Config.App.id

local function getLocationPayload()
    local locations = {}

    for index, location in ipairs(Config.Locations or {}) do
        local coords = location.coords or vector3(0.0, 0.0, 0.0)
        locations[#locations + 1] = {
            id = location.id or ('location_' .. index),
            title = location.title or 'Location',
            description = location.description or '',
            image = location.image or '',
            coords = {
                x = coords.x or 0.0,
                y = coords.y or 0.0,
                z = coords.z or 0.0,
            },
        }
    end

    return locations
end

local function findLocation(locationId)
    for index, location in ipairs(Config.Locations or {}) do
        local id = location.id or ('location_' .. index)
        if id == locationId then
            return location
        end
    end
end

RegisterNUICallback('tn-locationapp:getLocations', function(_, cb)
    cb({
        ok = true,
        locations = getLocationPayload(),
    })
end)

RegisterNUICallback('tn-locationapp:setWaypoint', function(data, cb)
    local location = data and findLocation(data.id)

    if not location or not location.coords then
        cb({
            ok = false,
            message = 'location_not_found',
        })
        return
    end

    SetNewWaypoint(location.coords.x, location.coords.y)

    cb({
        ok = true,
        id = data.id,
    })
end)

local function registerApp()
    local added, reason = exports[PHONE_RESOURCE]:addCustomApp({
        id = APP_ID,
        label = Config.App.label,
        icon = ui .. 'icon.webp',
        category = Config.App.category,
        creator = Config.App.creator,
        description = Config.App.description,
        age = Config.App.age,
        appStoreOnly = true,
        sizeMb = Config.App.sizeMb,
        iframe = {
            url = ui .. 'index.html',
        },
        custom = {
            enabled = true,
            sourceResource = GetCurrentResourceName(),
            bridge = {
                enabled = true,
                allowedOrigins = { 'https://cfx-nui-' .. GetCurrentResourceName() },
            },
        },
    })

    if not added then
        print(('[tn-locationapp] addCustomApp failed: %s'):format(reason or 'unknown'))
        return
    end
    print('[tn-locationapp] Locations app registered')
end

CreateThread(function()
    while GetResourceState(PHONE_RESOURCE) ~= 'started' do
        Wait(500)
    end
    registerApp()
end)

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName == PHONE_RESOURCE then
        registerApp()
    end
end)
