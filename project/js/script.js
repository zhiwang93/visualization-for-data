
function update(month) {
    d3.csv("dataset/airports" + month + ".csv", function (error, airports) {
        let usmap = new Usmap(airports);
        console.log(airports);
        usmap.update1();
    });
}

let month = document.getElementById("months").value;
console.log(month);
update(month);


