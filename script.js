document.addEventListener("DOMContentLoaded", function() {
    obterDadosAPI()
    const botaoFiltro = document.getElementById("botaoFiltro")
    const modalFiltro = document.getElementById("modalFiltro")
    const formFiltro = document.getElementById("formFiltro")
    const buscarNoticiaForm = document.getElementById("buscarNoticia")

    botaoFiltro.addEventListener("click", function() {
        if (modalFiltro.open) 
            modalFiltro.close()
        else 
            modalFiltro.showModal()
    })

    botaoFiltro.addEventListener("submit", function(event) {
        event.preventDefault()
        obterDadosAPI()
        modalFiltro.close()
    })

    buscarNoticiaForm.addEventListener("submit", function(event) {
        event.preventDefault()
        obterDadosAPI()
    })
})

async function obterDadosAPI() {
    const buscarNoticiaInput = document.getElementById("buscarNoticiaInput").value
    const tipo = document.getElementById("tipoId").value
    const quantidade = document.getElementById("quantidadeId").value
    const dataDe = document.getElementById("dataDe").value
    const dataAte = document.getElementById("dataAte").value

    const url = new url("http://servicodados.ibge.gov.br/api/v3/noticias")
    const params = {
        tipo: tipo,
        quantidade: quantidade,
        dataDe: dataDe,
        dataAte: dataAte,
        buscar: buscarNoticiaInput
    }

    Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key])
    })

    try {
        const response = await fetch(url)
        const dados = await response.json()
        listarNoticias(dados)
    } catch (error) {
        console.error("Erro ao buscar dados da API:", error)
    }
}

function listarNoticias(noticias) {
    const listaNoticias = document.getElementById("listaNoticias")
    listaNoticias.innerHTML = ""

    noticias.items.forEach(noticia => {
        const li = document.createElement("li")
        li.innerHTML = `
            <img src="https://agenciadenoticias.ibge.gov.br/${noticia.imagens.thumb}" alt="${noticia.titulo}">
            <h2>${noticia.titulo}</h2>
            <p>${noticia.introducao}</p>
            <p>Editorias: ${noticia.editorias.map(editoria => `#${editoria.nome}`).join(' ')}</p>
            <p>Publicado há ${calcularTempoPublicacao(noticia.data_publicacao)}</p>
            <button onclick="window.open('https://agenciadenoticias.ibge.gov.br/${noticia.url}', '_blank')">Leia Mais</button>
        `
        listaNoticias.appendChild(li)
    })
}

function calcularTempoPublicacao(dataPublicacao) {
    const data = new Date(dataPublicacao)
    const hoje = new Date()
    const diff = Math.floor((hoje - data) / (1000 * 60 * 60 * 24))
    if (diff === 0) {
        return "Publicado hoje"
    } else if (diff === 1) {
        return "Publicado ontem"
    } else {
        return `Publicado há ${diff} dias`
    }
}