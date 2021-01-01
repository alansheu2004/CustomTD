var tabs = document.getElementsByName("tab");
var selectedTab = tabs[0];

for(let tab of tabs) {
    if(tab.checked) {
        selectedTab = tab;
        document.getElementById(selectedTab.value).classList.add("selected");
    } else {
        tab.addEventListener("click", switchTab);
    }
}

function switchTab(e) {
    selectedTab.addEventListener("click", this);
    document.getElementById(selectedTab.value).classList.remove("selected");

    selectedTab = e.target;
    selectedTab.removeEventListener("click", this);
    document.getElementById(selectedTab.value).classList.add("selected");
}