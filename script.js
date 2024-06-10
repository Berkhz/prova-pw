document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "https://servicodados.ibge.gov.br/api/v3/noticias"
    const listaNoticias = document.getElementById("listaNoticias")
    const paginacao = document.getElementById("paginacao")
    const botaoFiltro = document.getElementById("botaoFiltro")
    const modalFiltro = document.getElementById("modalFiltro")
    const formFiltro = document.getElementById("formFiltro")
    const buscarNoticiaForm = document.getElementById("buscarNoticia")

    botaoFiltro.addEventListener("click", function() {
        modalFiltro.open ? modalFiltro.close() : modalFiltro.showModal()
    })

    formFiltro.addEventListener("submit", function(event) {
        event.preventDefault()
        aplicarFiltros()
        modalFiltro.close()
    })

    buscarNoticiaForm.addEventListener("submit", function(event) {
        event.preventDefault()
        obterDadosAPI(1)
    })

    async function obterValoresTipo() {
        try {
            const response = await fetch(API_URL + "/tipos")
            if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`)
            const data = await response.json()
            const tipoInput = document.getElementById("tipoId")
            data.forEach(tipo => {
                const option = document.createElement("option")
                option.value = tipo.id
                option.textContent = tipo.nome
                tipoInput.appendChild(option)
            })
        } catch (error) {
            console.error("Erro ao buscar tipos:", error)
        }
    }

    async function obterDadosAPI(page = 1) {
        const params = new URLSearchParams(window.location.search)
        params.set("page", page)
        const buscarNoticiaInput = document.getElementById("buscarNoticiaInput").value
        if (buscarNoticiaInput) params.set("buscar", buscarNoticiaInput)

        const quantidade = params.get("quantidade") || 10
        params.set("quantidade", quantidade)
        const url = `${API_URL}?${params.toString()}`
        console.log(url)

        try {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`)
            const data = await response.json()
            listarNoticias(data.items)
            criarPaginacao(Math.ceil(data.totalResults / quantidade), page)
        } catch (error) {
            console.error("Erro ao buscar dados:", error)
        }
    }

    function aplicarFiltros() {
        const queryParams = new URLSearchParams()
        queryParams.set("page", "1")

        const tipo = document.getElementById("tipoId").value
        if (tipo) queryParams.set("tipo", tipo)

        const quantidade = document.getElementById("quantidadeId").value
        if (quantidade) queryParams.set("quantidade", quantidade)

        const dataDe = document.getElementById("dataDe").value
        if (dataDe) queryParams.set("dataDe", dataDe)

        const dataAte = document.getElementById("dataAte").value
        if (dataAte) queryParams.set("dataAte", dataAte)

        history.replaceState(null, "", `?${queryParams.toString()}`)
        obterDadosAPI()
    }

    function listarNoticias(noticias) {
        listaNoticias.innerHTML = ""
        noticias.forEach(noticia => {
            const item = document.createElement("li")
            item.innerHTML = `
                <img src="${noticia.imagemUrl}" alt="${noticia.titulo}" />
                <div>
                    <h2>${noticia.titulo}</h2>
                    <p>${noticia.introducao}</p>
                    <a href="${noticia.link}" target="_blank">Leia mais</a>
                </div>
            `
            listaNoticias.appendChild(item)
        })
    }

    function criarPaginacao(totalPages, currentPage) {
        paginacao.innerHTML = ""
        for (let i = 1; i <= totalPages; i++) {
            const item = document.createElement("li")
            const button = document.createElement("button")
            button.textContent = i
            if (i === currentPage) button.classList.add("active")
            button.addEventListener("click", () => obterDadosAPI(i))
            item.appendChild(button)
            paginacao.appendChild(item)
        }
    }

    function exibirFiltrosAtivos() {
        const params = new URLSearchParams(window.location.search)
        const filtrosAtivos = Array.from(params.keys()).filter(key => key !== "page").length
        const filtrosSpan = document.getElementById("filtrosAtivos")
        if (filtrosAtivos) {
            filtrosSpan.style.display = "block"
            filtrosSpan.textContent = filtrosAtivos
        } else {
            filtrosSpan.style.display = "none"
        }
    }

    obterValoresTipo()
    obterDadosAPI()
})