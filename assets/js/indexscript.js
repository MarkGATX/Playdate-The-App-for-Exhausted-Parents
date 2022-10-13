var startButton = document.querySelector('.btn-large');
console.log(startButton)
var redirectUrl = './mainpage.html'
startButton.addEventListener('click', redirectToMain)

function redirectToMain (event) {
    event.preventDefault();
    document.location.replace(redirectUrl)
}