var myItems = {
    availableFloorSpace: 1,
    availableCargoSpace: 100,
    availableEnergyStorage: 100,

    // energy: 0,
    // solarPanels: 2,
    // nutrientStations: 2,
    // crewMembers: 2,
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
        tooltip: "Effects: 1 energy",
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
        usable: function() {
            updateCargoSpace();
            return myItems.energy >= 4 && myItems.availableCargoSpace >= 1
        },
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
        tooltip: "Cost: 5 iron, 1 floor space",
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
    // {
    //     name: "BuildMatterEnergyConverter",
    //     tooltip: "Cost: 10 iron, 20 silicon, 1 floor space",
    //     function: craft,
    //     args: {
    //         iron: -10,
    //         silicon: -20,
    //         availableFloorSpace: -1,
    //         matterEnergyConverters: 1,
    //     },
    //     duration: 4,
    //     enableOn: function() {return availableFloorSpace >= 2},
    //     usable: haveItems,
    // },
];

var inventoryDiv = $( "#inventory" );
var actionsDiv = $( "#actions" );

var state = null;
var progress = 0;
var workerAssignmentEnabled = false;

function countAssignedWorkers()
{
    let total = 0;
    for (i in actions) {
        action = actions[i];
        if (action.assignedWorkers) total += action.assignedWorkers;
    }
    return total;
}

function updateCargoSpace()
{
    myItems.availableCargoSpace = 100
        - (myItems.ironOre?myItems.ironOre:0)
        - (myItems.siliconOre?myItems.siliconOre:0)
        - (myItems.iron?myItems.iron:0)
        - (myItems.silicon?myItems.silicon:0);
}

function updateInventory()
{
    inventoryDiv.empty();
    for (item in myItems) {
        inventoryDiv.append("<div>" + item + ": " + myItems[item] + "</div>");
    }
}

function updateActions()
{
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
            action.plusButton = $("<button>+</button>");
            action.minusButton = $("<button>-</button>");
            action.workerCountSpan = $("<span>0</span>");
            if (!workerAssignmentEnabled) {
                action.plusButton.hide();
                action.minusButton.hide();
                action.workerCountSpan.hide();
            }
            tooltipDiv.append(action.plusButton);
            tooltipDiv.append(action.minusButton);
            tooltipDiv.append(action.workerCountSpan);
            actionsDiv.append(tooltipDiv);
            actionsDiv.append($("<br />"));
            if (!action.assignedWorkers) action.assignedWorkers = 0;
            action.plusButton.click(function(e){
                if (myItems.crewMembers > countAssignedWorkers()) {
                    action2.assignedWorkers += 1;
                    action2.workerCountSpan.text(action2.assignedWorkers)
                }
            });
            action.minusButton.click(function(e){
                if (action2.assignedWorkers > 0) {
                    action2.assignedWorkers -= 1;
                    action2.workerCountSpan.text(action2.assignedWorkers)
                }
            });
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
}

function killCrewMember()
{
    myItems.crewMembers -= 1;
    for (i in actions) {
        action = actions[i];
        if (action.assignedWorkers > 0) {
            action.assignedWorkers -= 1;
            action.workerCountSpan.text(action.assignedWorkers)
            return;
        }
    }
}

function enableWorkerAssignment()
{
    workerAssignmentEnabled = true;
    for (i in actions) {
        action = actions[i];
        if (action.plusButton) action.plusButton.show();
        if (action.minusButton) action.minusButton.show();
        if (action.workerCountSpan) action.workerCountSpan.show();
    }
}

$(document).ready(function()
{
    updateInventory();
    updateActions();
    updateProgressBar();

    let intoSecond = 0;

    window.setInterval(function()
    {
        let needToUpdateScreen = false;

        if (state) {
            progress += 20 / state.duration;
            if (progress >= 100) {
                progress = 0;
                state.function(state.args);
                if (!state.usable()) state = null;
                needToUpdateScreen = true;
            }
        }

        for (i in actions) {
            action = actions[i];
            if (action.assignedWorkers > 0) {
                if (!action.workerProgress) action.workerProgress = 0;
                action.workerProgress += 20 * action.assignedWorkers / action.duration;
                if (action.workerProgress >= 100) {
                    action.workerProgress -= 100;
                    if (action.usable()) {
                        action.function(action.args);
                        needToUpdateScreen = true;
                    }
                }
            }
        }

        intoSecond += 1;
        if (intoSecond >= 5) {
            intoSecond = 0;

            if (myItems.solarPanels) {
                myItems.energy += myItems.solarPanels;
            }
            if (myItems.nutrientStations && myItems.energy >= myItems.nutrientStations) {
                myItems.energy -= myItems.nutrientStations;
                if (myItems.energy > myItems.availableEnergyStorage) myItems.energy = myItems.availableEnergyStorage;
                if (!myItems.food) myItems.food = 0;
                myItems.food += myItems.nutrientStations;
            }
            if (myItems.crewMembers) {
                if (!myItems.food) myItems.food = 0;
                while (myItems.food < myItems.crewMembers) {
                    killCrewMember();
                }
                myItems.food -= myItems.crewMembers;
            }
            needToUpdateScreen = true;
        }

        if (myItems.crewMembers > 0 && !workerAssignmentEnabled) enableWorkerAssignment();

        if (needToUpdateScreen) {
            updateCargoSpace();
            updateInventory();
            updateActions();
        }
        updateProgressBar();
    }, 200);

});
