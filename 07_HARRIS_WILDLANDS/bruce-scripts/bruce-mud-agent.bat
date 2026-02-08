@echo off
setlocal EnableDelayedExpansion

:: ============================================================================
:: BRUCE MUD AGENT - World Builder
:: Version: 1.0.0
:: Description: Autonomous agent for building MUD world
:: Focus: Room creation, items, weather, flora, fauna
:: ============================================================================

set AGENT_NAME=BruceMUD_WorldBuilder
set MUD_SERVER=ws://localhost:4008
set LOG_FILE=C:\brucebruce\07_HARRIS_WILDLANDS\logs\mud-agent.log

:: Behavior probabilities (must sum to 100)
set WORLD_BUILDING_PROB=50
set EXPLORATION_PROB=20
set CONTENT_PROB=15
set SOCIAL_PROB=10
set REST_PROB=5

:: Action counters
set ACTIONS_TAKEN=0
set ROOMS_CREATED=0
set ITEMS_CREATED=0
set NPCS_SPAWNED=0

echo [%date% %time%] MUD Agent starting... >> "%LOG_FILE%"
echo Agent: %AGENT_NAME% >> "%LOG_FILE%"
echo Server: %MUD_SERVER% >> "%LOG_FILE%"
echo Focus: World-building mode >> "%LOG_FILE%"

:: ============================================================================
:: MAIN LOOP
:: ============================================================================

:agent_loop
set /a ACTIONS_TAKEN+=1

:: Generate random action (0-99)
set /a action=!random! %% 100

:: Determine behavior based on probability
if !action! lss %WORLD_BUILDING_PROB% (
    call :world_building_action
) else if !action! lss %EXPLORATION_PROB% (
    call :exploration_action
) else if !action! lss %CONTENT_PROB% (
    call :content_action
) else if !action! lss %SOCIAL_PROB% (
    call :social_action
) else (
    call :rest_action
)

:: Log statistics every 10 actions
set /a check_stats=!ACTIONS_TAKEN! %% 10
if !check_stats! == 0 (
    echo [%date% %time%] Stats: Actions=!ACTIONS_TAKEN!, Rooms=!ROOMS_CREATED!, Items=!ITEMS_CREATED!, NPCs=!NPCS_SPAWNED! >> "%LOG_FILE%"
)

:: Wait before next action (30-60 seconds)
set /a wait_time=30 + (!random! %% 30)
timeout /t !wait_time! /nobreak >nul

goto :agent_loop

:: ============================================================================
:: WORLD BUILDING ACTIONS (Primary Focus - 50%% probability)
:: ============================================================================

:world_building_action
echo [%date% %time%] [WORLD_BUILDING] Taking world-building action >> "%LOG_FILE%"

set /a sub_action=!random! %% 6

if !sub_action! == 0 call :create_room
if !sub_action! == 1 call :add_item
if !sub_action! == 2 call :spawn_npc
if !sub_action! == 3 call :set_weather
if !sub_action! == 4 call :create_flora
if !sub_action! == 5 call :create_fauna

goto :eof

:create_room
echo [%date% %time%] [CREATE_ROOM] Creating new room... >> "%LOG_FILE%"
:: Simulate room creation via WebSocket
:: In production, this would connect to MUD server and send commands
set /a ROOMS_CREATED+=1
set ROOM_NAME=Room_!ROOMS_CREATED!_!random!
echo [%date% %time%] [CREATE_ROOM] Created room: !ROOM_NAME! >> "%LOG_FILE%"
goto :eof

:add_item
echo [%date% %time%] [ADD_ITEM] Adding item to world... >> "%LOG_FILE%"
set /a ITEMS_CREATED+=1
set ITEMS[0]=Ancient Scroll
set ITEMS[1]=Crystal Orb
set ITEMS[2]=Rusty Key
set ITEMS[3]=Golden Coin
set ITEMS[4]=Magic Potion
set /a item_idx=!random! %% 5
echo [%date% %time%] [ADD_ITEM] Added item: !ITEMS[%item_idx%]! >> "%LOG_FILE%"
goto :eof

:spawn_npc
echo [%date% %time%] [SPAWN_NPC] Spawning NPC... >> "%LOG_FILE%"
set /a NPCS_SPAWNED+=1
set NPCS[0]=Friendly Merchant
set NPCS[1]=Wise Elder
set NPCS[2]=Wandering Bard
set NPCS[3]=Forest Guardian
set NPCS[4]=Mysterious Stranger
set /a npc_idx=!random! %% 5
echo [%date% %time%] [SPAWN_NPC] Spawned: !NPCS[%npc_idx%]! >> "%LOG_FILE%"
goto :eof

:set_weather
echo [%date% %time%] [WEATHER] Changing weather... >> "%LOG_FILE%"
set WEATHER[0]=Clear skies
set WEATHER[1]=Light rain
set WEATHER[2]=Thunderstorm
set WEATHER[3]=Foggy morning
set WEATHER[4]=Gentle breeze
set /a weather_idx=!random! %% 5
echo [%date% %time%] [WEATHER] Set to: !WEATHER[%weather_idx%]! >> "%LOG_FILE%"
goto :eof

:create_flora
echo [%date% %time%] [FLORA] Creating flora... >> "%LOG_FILE%"
set FLORA[0]=Ancient Oak Tree
set FLORA[1]=Glowing Mushrooms
set FLORA[2]=Wildflower Patch
set FLORA[3]=Thorny Brambles
set FLORA[4]=Crystal Ferns
set /a flora_idx=!random! %% 5
echo [%date% %time%] [FLORA] Created: !FLORA[%flora_idx%]! >> "%LOG_FILE%"
goto :eof

:create_fauna
echo [%date% %time%] [FAUNA] Creating fauna... >> "%LOG_FILE%"
set FAUNA[0]=Squirrel
set FAUNA[1]=Rabbit
set FAUNA[2]=Deer
set FAUNA[3]=Owl
set FAUNA[4]=Butterflies
set /a fauna_idx=!random! %% 5
echo [%date% %time%] [FAUNA] Created: !FAUNA[%fauna_idx%]! >> "%LOG_FILE%"
goto :eof

:: ============================================================================
:: EXPLORATION ACTIONS (20%% probability)
:: ============================================================================

:exploration_action
echo [%date% %time%] [EXPLORATION] Exploring world... >> "%LOG_FILE%"
set /a sub_action=!random! %% 3

if !sub_action! == 0 (
    echo [%date% %time%] [EXPLORE] Venturing into unmapped areas >> "%LOG_FILE%"
) else if !sub_action! == 1 (
    echo [%date% %time%] [EXPLORE] Mapping room connections >> "%LOG_FILE%"
) else (
    echo [%date% %time%] [EXPLORE] Discovering hidden exits >> "%LOG_FILE%"
)
goto :eof

:: ============================================================================
:: CONTENT CREATION ACTIONS (15%% probability)
:: ============================================================================

:content_action
echo [%date% %time%] [CONTENT] Creating content... >> "%LOG_FILE%"
set /a sub_action=!random! %% 3

if !sub_action! == 0 (
    echo [%date% %time%] [CONTENT] Writing room description >> "%LOG_FILE%"
) else if !sub_action! == 1 (
    echo [%date% %time%] [CONTENT] Creating item lore >> "%LOG_FILE%"
) else (
    echo [%date% %time%] [CONTENT] Composing NPC dialogue >> "%LOG_FILE%"
)
goto :eof

:: ============================================================================
:: SOCIAL ACTIONS (10%% probability)
:: ============================================================================

:social_action
echo [%date% %time%] [SOCIAL] Social interaction... >> "%LOG_FILE%"
set /a sub_action=!random! %% 2

if !sub_action! == 0 (
    echo [%date% %time%] [SOCIAL] Observing player interactions >> "%LOG_FILE%"
) else (
    echo [%date% %time%] [SOCIAL] Responding to chat >> "%LOG_FILE%"
)
goto :eof

:: ============================================================================
:: REST ACTIONS (5%% probability)
:: ============================================================================

:rest_action
echo [%date% %time%] [REST] Taking a moment to rest... >> "%LOG_FILE%"
goto :eof

:: ============================================================================
:: CLEANUP ON EXIT
:: ============================================================================

cleanup:
echo [%date% %time%] MUD Agent shutting down... >> "%LOG_FILE%"
echo [%date% %time%] Final stats: Actions=!ACTIONS_TAKEN!, Rooms=!ROOMS_CREATED!, Items=!ITEMS_CREATED!, NPCs=!NPCS_SPAWNED! >> "%LOG_FILE%"
goto :eof
