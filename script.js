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
            const response = await fetch("https://servicodados.ibge.gov.br/api/v3/noticias/tipos")
            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`)
            }
            const tipos = await response.json()
            popularTiposFiltro(tipos)
        } catch (error) {
            console.error("Erro ao buscar tipos:", error)
        }
    }

    async function obterDadosAPI(page = 1) {
        const queryParams = new URLSearchParams(window.location.search)
        queryParams.set("page", page)
        queryParams.set("qtd", document.getElementById("quantidadeId").value || 10)
        const busca = document.getElementById("buscarNoticiaInput").value
        if (busca) {
            queryParams.set("busca", busca)
        }

        try {
            const response = await fetch(`https://servicodados.ibge.gov.br/api/v3/noticias?${queryParams.toString()}`)
            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`)
            }
            const noticias = await response.json()
            listarNoticias(noticias.items)
            criarPaginacao(noticias.totalPages, noticias.page)
        } catch (error) {
            console.error("Erro ao buscar dados:", error)
            listaNoticias.innerHTML = "<li>Erro ao carregar as notícias. Por favor, tente novamente mais tarde.</li>"
        }
    }

    function aplicarFiltros() {
        const queryParams = new URLSearchParams()
        const tipo = document.getElementById("tipoId").value
        if (tipo) {
            queryParams.set("tipo", tipo)
        }
        const dataDe = document.getElementById("dataDe").value
        if (dataDe) {
            queryParams.set("dataInicio", dataDe)
        }
        const dataAte = document.getElementById("dataAte").value
        if (dataAte) {
            queryParams.set("dataFim", dataAte)
        }
        window.location.search = queryParams.toString()
    }

    function popularTiposFiltro(tipos) {
        const tipoSelect = document.getElementById("tipoId")
        tipos.forEach(tipo => {
            const option = document.createElement("option")
            option.value = tipo.id
            option.text = tipo.nome
            tipoSelect.appendChild(option)
        })
    }

    function listarNoticias(noticias) {
        listaNoticias.innerHTML = ""
        noticias.forEach(noticia => {
            const li = document.createElement("li")
            li.innerHTML = `
                <h3>${noticia.titulo}</h3>
                <p>${noticia.introducao}</p>
                <a href="${noticia.link}" target="_blank">Leia mais</a>
            `
            listaNoticias.appendChild(li)
        })
    }

    function criarPaginacao(totalPages, currentPage) {
        paginacao.innerHTML = ""
        for (let i = 1; i <= totalPages; i++) {
            const link = document.createElement("a")
            link.href = `?page=${i}`
            link.textContent = i
            if (i === currentPage) {
                link.classList.add("active")
            }
            paginacao.appendChild(link)
        }
    }

    obterValoresTipo()
    obterDadosAPI()
})