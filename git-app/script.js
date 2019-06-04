var url ="https://api.github.com/users/santoshvijapure/repos";

window.onload=function () {
    console.log("w t f");
    var button= document.getElementById("btn");
    button.addEventListener("click", ()=>{
        var user=document.getElementById("uname").value;
        console.log(user);
    })
}
fetch()