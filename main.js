var myItems = {
    availableFloorSpace: 5,
    availableCargoSpace: 100,
    energy: 10,
}

var actions = [
    {
        name: "MineAsteroid",
        function: search,
        args: {
            ironOre: 0.7,
            nickelOre: 0.1,
            cobaltOre: 0.1,
            siliconOre: 0.1,
        },
        duration: 4,
        enabled: true,
    },
    {
        name: "SmeltIron",
        function: craft,
        args: {
            ironOre: -2,
            energy: -1,
            iron: 1,
        },
        duration: 2,
        enableOn: function() {return myItems.ironOre >= 2},
    },
    {
        name: "SmeltSilicon",
        function: craft,
        args: {
            siliconOre: -2,
            energy: -1,
            silicon: 1,
        },
        duration: 2,
        enableOn: function() {return myItems.siliconOre >= 2},
    },
    {
        name: "BuildSolarPanel",
        function: craft,
        args: {
            silicon: -1,
            iron: -2,
            solarPanels: 1,
        },
        duration: 4,
        enableOn: function() {return myItems.silicon >= 1 && myItems.iron >= 2},
    },
    {
        name: "ExpandSpacecraft",
        function: craft,
        args: {
            iron: -2,
            availableFloorSpace: 1,
        },
        duration: 10,
        enableOn: function() {return myItems.iron >= 2},
    },
    {
        name: "BuildNutrientStation",
        function: craft,
        args: {
            iron: -2,
            availableFloorSpace: -1,
            nutrientStations: 1,
        },
        duration: 4,
        enableOn: function() {return myItems.iron >= 2 && myItems.availableFloorSpace >= 1},
    },
    {
        name: "thawCrewMember",
        function: craft,
        args: {
            crewMembers: 1,
        },
        duration: 10,
        enableOn: function() {return myItems.nutrientStations >= 1},
    },
];

var speed = 1;

var inventoryDiv = $( "#inventory" );
var actionsDiv = $( "#actions" );

var state = null;
var progress = 0;
var duration = 1;
var stateEndFunction = null;
var stateEndFunctionArgs = null;

function updateInventory()
{
    inventoryDiv.empty();
    for (item in myItems) {
        inventoryDiv.append("<div>" + item + ": " + myItems[item] + "</div>");
    }
}

function updateActions()
{
    // actionsDiv.empty();
    for (i in actions) {
        action = actions[i];
        if (!action.enabled && action.enableOn()) action.enabled = true;
        if (action.enabled && !action.button) {
            // let button = $("<a href='#' id='" + action.name + "Button' class='progress-button' data-loading='" + action.name + "' data-finished='" + action.name + "'>" + action.name + "</a>");
            let button = $("<button>" + action.name + "</button>");
            actions[i].button = button;
            let action2 = action;
            button.click(function(e){
                if (state != action2.name) {
                    state = action2.name;
                    progress = 0;
                    duration = action2.duration;
                    stateEndFunction = action2.function;
                    stateEndFunctionArgs = action2.args;
                }
                updateProgressBar();
            });
            actionsDiv.append(button);
        }
    }
}

function updateProgressBar()
{
    if (!state) {
        $("#action").text("Resting");
    } else {
        $("#action").text(state);
    }
    $("#progress").val(progress);
}

function search(itemsAtLocation)
{
    let r = Math.random();
    let r2 = 0;
    let item;
    for (item in itemsAtLocation) {
        r2 += itemsAtLocation[item];
        if (r < r2) break;
    }
    if (!myItems[item]) myItems[item] = 0;
    myItems[item] += 1;

    updateInventory();
}

function craft(items)
{
    // check if we have all the needed items
    for (item in items) {
        let amount = items[item];
        if (amount < 0 && !myItems[item] || myItems[item] < -amount) return;
    }

    // update amounts in inventory
    for (item in items) {
        let amount = items[item];
        if (!myItems[item]) myItems[item] = 0;
        myItems[item] += amount;
    }

    updateInventory();
}


$(document).ready(function()
{
    // $('.progress-button').progressInitialize();

    updateInventory();
    updateActions();
    updateProgressBar();

    window.setInterval(function()
    {
        if (state) {
            progress += 20 / duration;
            $("#" + state + "Button").progressSet(progress);
            if (progress >= 100) {
                progress = 0;
                stateEndFunction(stateEndFunctionArgs);
            }
        }

        myItems.energy += myItems.solarPanels ? myItems.solarPanels : 0;
        if (myItems.nutrientStations) {
            myItems.energy -= myItems.nutrientStations;
            if (!myItems.food) myItems.food = 0;
            myItems.food += myItems.nutrientStations;
        }
        if (myItems.crewMembers) {
            if (!myItems.food) myItems.food = 0;
            if (myItems.food < myItems.crewMembers) {
                myItems.crewMembers = myItems.food;
            }
            myItems.food -= myItems.crewMembers;
        }
        updateInventory();
        updateActions();
        updateProgressBar();
    }, 200 / speed);

});
