var tabs = document.getElementsByName("tab");
var selectedTab = tabs[0];

var editing = true;

for(let tab of tabs) {
    if(tab.checked) {
        selectedTab = tab;
        document.getElementById(selectedTab.value).classList.add("selected");
    } else {
        tab.addEventListener("click", switchTab);
    }
}

function switchTab(e) {
    selectedTab.addEventListener("click", switchTab);
    document.getElementById(selectedTab.value).classList.remove("selected");

    selectedTab = e.target;
    selectedTab.removeEventListener("click", switchTab);
    document.getElementById(selectedTab.value).classList.add("selected");
}