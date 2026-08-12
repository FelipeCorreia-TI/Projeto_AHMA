//Resposável por tornar flexível as 3 barrinhas e fazer que uma sidebar seja aberta

const botao = document.getElementById('BtnMenu')
const sidebar = document.getElementById('sidebar')
const overlay =document.getElementById('overlayMenu')
const conteudo =document.getElementById('conteudo-principal')

function alterarMenu(){
    sidebar.classList.toggle('aberto');
    overlay.classList.toggle('visivel');
    conteudo.classList.toggle('menu-aberto')
}

botao.addEventListener('click',alterarMenu);


overlay.addEventListener('click',alterarMenu);
//////////////////////////////////////////////////////////////////

