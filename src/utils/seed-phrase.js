
let seedArray=["read","ring","dome","yellow","realize","country","paint","mask","baby","cot","reality","throw","give","sun","hop","append","duke","wood","moon","data","hurry","train","tasteful", "tranquil","repeat","lacking","stamp","bolt","paddle"]
console.log(seedArray.length)


function shuffle(array){
    let currentIndex=array.length,ranNum
    while(currentIndex !=0){
    let ranNum = Math.floor(Math.random()*currentIndex);
    currentIndex--;
    [array[currentIndex], array[ranNum]]=[array[ranNum],array[currentIndex]]
}
return array
}




module.exports = {shuffle,seedArray,}