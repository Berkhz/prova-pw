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

    async function obterDadosAPI(page = 1) {
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set("page", page);
        queryParams.set("qtd", document.getElementById("quantidadeId").value || 10);
        const busca = document.getElementById("buscarNoticiaInput").value;
        if (busca) {
            queryParams.set("busca", busca);
        }
    
        try {
            const response = await fetch(`${API_URL}?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }
            const noticias = await response.json();
            
            if (noticias && noticias.items && Array.isArray(noticias.items)) {
                listarNoticias(noticias.items);
                criarPaginacao(noticias.totalPages, noticias.page);
            } else {
                console.error("Dados de notícias inválidos:", noticias);
                listaNoticias.innerHTML = "<li>Erro ao carregar as notícias. Dados inválidos retornados pela API.</li>";
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            listaNoticias.innerHTML = "<li>Erro ao carregar as notícias. Por favor, tente novamente mais tarde.</li>";
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
        window.history.pushState({}, "", `?${queryParams.toString()}`)
        obterDadosAPI()
    }

    function listarNoticias(noticias) {
        const listaHtml = noticias.map(noticia => {
            const imagemSrc = noticia.imagens && noticia.imagens.length > 0 ? noticia.imagens[0].url : '';
            const imagemAlt = noticia.imagens && noticia.imagens.length > 0 ? noticia.imagens[0].legenda : '';
            const titulo = noticia.titulo || 'Título não disponível';
            const introducao = noticia.introducao || 'Introdução não disponível';
            const url = noticia.url || '#';
            const editorias = noticia.editorias ? noticia.editorias.split(',').map(editoria => `#${editoria.trim()}`).join(' ') : '';
            const dataPublicacao = calcularTempoPublicacao(noticia.data_publicacao);
    
            return `
                <li>
                    <img src="https://agenciadenoticias.ibge.gov.br${imagemSrc}" alt="${imagemAlt}">
                    <div>
                        <h2>${titulo}</h2>
                        <p>${introducao}</p>
                        <p>${editorias}</p>
                        <p>${dataPublicacao}</p>
                        <a href="${url}" target="_blank" rel="noopener noreferrer">Leia Mais</a>
                    </div>
                </li>
            `;
        }).join("");
    
        listaNoticias.innerHTML = `<ul>${listaHtml}</ul>`;
    }
    
    function calcularTempoPublicacao(dataPublicacao) {
        const dataAtual = new Date();
        const dataPostagem = new Date(dataPublicacao);
        const diff = Math.abs(dataAtual - dataPostagem);
        const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
        if (diffDays === 0) {
            return 'Publicado hoje';
        } else if (diffDays === 1) {
            return 'Publicado ontem';
        } else {
            return `Publicado ${diffDays} dias atrás`;
        }
    }

    function criarPaginacao(totalPages, currentPage) {
        paginacao.innerHTML = "";
        const numPagesToShow = 10; 
        const halfPagesToShow = Math.floor(numPagesToShow / 2); 
    
        let startPage = Math.max(1, currentPage - halfPagesToShow);
        let endPage = Math.min(totalPages, startPage + numPagesToShow - 1);
    
        startPage = Math.max(1, endPage - numPagesToShow + 1);
    
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement("li");
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            pageButton.classList.toggle("active", i === currentPage);
            pageButton.addEventListener("click", () => obterDadosAPI(i));
            pageItem.appendChild(pageButton);
            paginacao.appendChild(pageItem);
        }
    }
    
    obterDadosAPI()
})