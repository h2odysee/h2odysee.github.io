var myItems = {
    availableFloorSpace: 1,
    availableCargoSpace: 100,
    // ironOre: 2,
    // energy: 100,
    iron: 10,
    silicon: 10,
}

function haveItems() {
    for (item in this.args) {
        if (this.args[item] < 0 && (myItems[item]?myItems[item]:0) < -this.args[item]) return false;
    }
    return true;
}

function haveItems2(ok) {
    for (item in ok.args) {
        if (ok.args[item] < 0 && (myItems[item]?myItems[item]:0) < -ok.args[item]) return false;
    }
    return true;
}

var actions = [
    {
        name: "CrankGenerator",
        tooltip: `
Crank Generator
<i>Without labor nothing prospers</i>
`,
        function: craft,
        args: {
            energy: 1,
        },
        duration: 2,
        enableOn: function() {return true},
        usable: function() {return true},
    },
    {
        name: "MineAsteroid",
        tooltip: "Cost: 4 energy",
        function: search,
        args: {
            ironOre: 0.5,
            siliconOre: 0.5,
            // nickelOre: 0.1,
            // cobaltOre: 0.1,
        },
        duration: 4,
        enableOn: function() {return true},
        usable: function() {return myItems.energy >= 4},
    },
    {
        name: "SmeltIron",
        tooltip: "Cost: 2 iron ore, 1 energy",
        function: craft,
        args: {
            ironOre: -2,
            energy: -1,
            iron: 1,
        },
        duration: 2,
        enableOn: function() {return myItems.energy >= 4},
        usable: haveItems,
    },
    {
        name: "SmeltSilicon",
        tooltip: "Cost: 2 silicon ore, 1 energy",
        function: craft,
        args: {
            siliconOre: -2,
            energy: -1,
            silicon: 1,
        },
        duration: 2,
        enableOn: function() {return myItems.energy >= 4},
        usable: haveItems,
    },
    {
        name: "BuildSolarPanel",
        tooltip: "Cost: 1 silicon, 1 iron",
        function: craft,
        args: {
            silicon: -1,
            iron: -1,
            solarPanels: 1,
        },
        duration: 8,
        enableOn: function() {return myItems.ironOre >= 2 || myItems.siliconOre >= 2},
        usable: haveItems,
    },
    {
        name: "BuildNutrientStation",
        tooltip: "Cost: 5 iron",
        function: craft,
        args: {
            iron: -5,
            availableFloorSpace: -1,
            nutrientStations: 1,
        },
        duration: 4,
        enableOn: function() {return myItems.ironOre >= 2 || myItems.siliconOre >= 2},
        usable: haveItems,
    },
    {
        name: "ThawCrewMember",
        tooltip: "<i>Only slight freezerburn</i>",
        function: craft,
        args: {
            crewMembers: 1,
        },
        duration: 10,
        enableOn: function() {return true},
        usable: function() {return true},
    },
    {
        name: "ExpandSpacecraft",
        tooltip: "Cost: 20 iron",
        function: craft,
        args: {
            iron: -20,
            availableFloorSpace: 1,
        },
        duration: 10,
        enableOn: function() {return haveItems2(this) || myItems.crewMembers >= 1},
        usable: haveItems,
    },
];

var speed = 1;

var inventoryDiv = $( "#inventory" );
var actionsDiv = $( "#actions" );

var state = null;
var progress = 0;

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
            let button = $("<button>" + action.name + "</button>");
            actions[i].button = button;
            let action2 = action;
            button.click(function(e){
                if (state != action2) {
                    state = action2;
                    progress = 0;
                }
                updateProgressBar();
            });
            let tooltipDiv = $("<div class='tooltip'><span class='tooltiptext'>" + action.tooltip + "</span></div>");
            tooltipDiv.append(button);
            actionsDiv.append(tooltipDiv);
        }
        if (action.button) {
            action.button.prop("disabled",!action.usable());
        }
    }
}

function updateProgressBar()
{
    if (!state) {
        $("#action").text("Resting");
    } else {
        $("#action").text(state.name);
    }
    $("#progress").val(progress);
}

function search(itemsAtLocation)
{
    myItems.energy -= 4;

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
    updateInventory();
    updateActions();
    updateProgressBar();

    window.setInterval(function()
    {
        if (state) {
            progress += 20 / state.duration;
            if (progress >= 100) {
                progress = 0;
                state.function(state.args);
                if (!state.usable()) state = null;
            }
        }

        if (myItems.solarPanels) {
            myItems.energy += myItems.solarPanels;
        }
        if (myItems.nutrientStations && myItems.energy >= myItems.nutrientStations) {
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
