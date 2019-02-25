// alert(" This site is under development see the footer to visit OLD site.")  
$(function(){
    
    $('#typewriteText').typewrite({
        actions: [
          {delay: 1500},
          {type: 'Hi, im Santosh.'},
          {delay: 1500},
        //   {select: {from: 9, to: 15}},
          {remove: {num: 15, type: 'stopped'}},
          {delay: 1000},
          {type: 'a Developer.'},
          {delay: 1000},
          {remove: {num: 10, type: 'stopped'}},
          {delay: 1000},
          {type: 'Designer.'},
          {delay: 1000},
          {remove: {num:10 , type:'stopped'}},
          {type:'nd a Pro Gamer :)'}
        ]
      });
      
});


const data =fetch('https://api.github.com/users/santoshvijapure/repos').then(function () { 
console.log(data);
})

// const data=fetch('https://api.github.com/users/santoshvijapure/repos').then((resp) => resp.json())