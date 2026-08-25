import { _supabase } from "../config/supabase.js";

document.addEventListener("DOMContentLoaded", async () => {
  const ppGrid = document.getElementById("ppGrid");
  const ppEmpty = document.getElementById("ppEmpty");
  const ppSearch = document.getElementById("ppSearch");
  const ppBtnAdd = document.getElementById("ppBtnAdd");

  // Botão Voltar do Header
  const btnVoltar = document.getElementById("btn-voltar");

  // Form e Inputs
  const ppFormOverlay = document.getElementById("ppFormOverlay");
  const ppFormClose = document.getElementById("ppFormClose");
  const ppFormCancel = document.getElementById("ppFormCancel");
  const ppForm = document.getElementById("ppForm");
  const ppBtnSubmit = document.getElementById("ppBtnSubmit");
  const ppCategorySelect = document.getElementById("ppCategory");

  // Upload e preview
  const ppPhotoInput = document.getElementById("ppPhotoInput");
  const ppPhotoPreview = document.getElementById("ppPhotoPreview");
  const ppPhotoPlaceholder = document.getElementById("ppPhotoPlaceholder");

  // Detalhes
  const ppDetailOverlay = document.getElementById("ppDetailOverlay");
  const ppDetailClose = document.getElementById("ppDetailClose");
  const ppDetailDelete = document.getElementById("ppDetailDelete");

  let listaPlantas = [];
  let listaCategorias = [];
  let plantaSelecionadaId = null;
  let fotoBase64 = null;
  let nivelAcessoUsuario = "USER"; // Padrão seguro

  // CONFIGURAÇÃO DO BOTÃO VOLTAR
  if (btnVoltar) {
    btnVoltar.addEventListener("click", (e) => {
      e.preventDefault();
      if (document.referrer && document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        window.location.href = "hub.html";
      }
    });
  }

  // 1. VERIFICAR NÍVEL DE ACESSO DO USUÁRIO
  async function verificarNivelAcesso() {
    try {
      const {
        data: { user },
      } = await _supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await _supabase
        .from("cadastro")
        .select("nivel_acesso")
        .eq("id_conta", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data && data.nivel_acesso) {
        nivelAcessoUsuario = String(data.nivel_acesso).trim().toUpperCase();
      }

      // Permite acesso de edição para TI e AGRO
      const isAdmin =
        nivelAcessoUsuario === "TI" || nivelAcessoUsuario === "AGRO";

      if (ppBtnAdd) {
        if (isAdmin) {
          ppBtnAdd.style.display = ""; // Restaura a exibição padrão do CSS sem quebrar a tela
          ppBtnAdd.removeAttribute("hidden");
        } else {
          ppBtnAdd.style.display = "none";
        }
      }
    } catch (err) {
      console.error("Erro ao verificar nível de acesso:", err);
    }
  }

  // 2. CARREGAR CATEGORIAS NO SELECT
  async function carregarCategorias() {
    try {
      const { data, error } = await _supabase
        .from("categoria_especimes")
        .select("*")
        .order("nome_categoria", { ascending: true });

      if (error) throw error;

      listaCategorias = data || [];

      if (ppCategorySelect) {
        ppCategorySelect.innerHTML = "";
        listaCategorias.forEach((cat) => {
          const option = document.createElement("option");
          option.value = cat.id_categoria;
          option.textContent = cat.nome_categoria;
          ppCategorySelect.appendChild(option);
        });
      }
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
    }
  }

  // 3. PREVIEW DA FOTO
  if (ppPhotoInput) {
    ppPhotoInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        fotoBase64 = event.target.result;
        ppPhotoPreview.src = fotoBase64;
        ppPhotoPreview.removeAttribute("hidden");
        if (ppPhotoPlaceholder) ppPhotoPlaceholder.style.display = "none";
      };
      reader.readAsDataURL(file);
    };
  }

  function resetarFormulario() {
    ppForm.reset();
    fotoBase64 = null;
    if (ppPhotoPreview) {
      ppPhotoPreview.src = "";
      ppPhotoPreview.setAttribute("hidden", "true");
    }
    if (ppPhotoPlaceholder) {
      ppPhotoPlaceholder.style.display = "block";
    }
  }

  // 4. CONTROLE DOS MODAIS
  if (ppBtnAdd) {
    ppBtnAdd.onclick = () => {
      if (nivelAcessoUsuario === "USER") {
        alert("Ação não permitida para seu nível de acesso.");
        return;
      }
      resetarFormulario();
      ppFormOverlay.removeAttribute("hidden");
    };
  }

  const fecharModalCadastro = () => {
    resetarFormulario();
    ppFormOverlay.setAttribute("hidden", "true");
  };

  if (ppFormClose) ppFormClose.onclick = fecharModalCadastro;
  if (ppFormCancel) ppFormCancel.onclick = fecharModalCadastro;

  const fecharModalDetalhes = () =>
    ppDetailOverlay.setAttribute("hidden", "true");
  if (ppDetailClose) ppDetailClose.onclick = fecharModalDetalhes;

  // 5. CARREGAR PLANTAS
  async function carregarPlantas() {
    try {
      const { data, error } = await _supabase
        .from("especimes")
        .select(
          `
          id_planta,
          nome_popular,
          nome_cientifico,
          informacoes_adicionais,
          foto_url,
          id_categoria,
          categoria_especimes ( nome_categoria )
        `,
        )
        .order("id_planta", { ascending: false });

      if (error) throw error;

      listaPlantas = data || [];
      renderizarPlantas(listaPlantas);
    } catch (err) {
      console.error("Erro ao carregar plantas:", err);
      ppGrid.innerHTML = "";
      ppEmpty.hidden = false;
      ppEmpty.textContent =
        "Nenhuma planta encontrada. Que tal adicionar a primeira?";
    }
  }

  // 6. RENDERIZAR CARDS
  function renderizarPlantas(plantas) {
    ppGrid.innerHTML = "";

    if (!plantas || plantas.length === 0) {
      ppEmpty.hidden = false;
      return;
    }

    ppEmpty.hidden = true;

    plantas.forEach((planta) => {
      const card = document.createElement("article");
      card.className = "pp-card";

      const fotoHtml = planta.foto_url
        ? `<img src="${planta.foto_url}" alt="${planta.nome_popular}">`
        : "🌱";

      const nomeCategoria =
        planta.categoria_especimes?.nome_categoria || "Geral";

      card.innerHTML = `
        <div class="pp-card-photo">
          ${fotoHtml}
        </div>
        <div class="pp-card-body">
          <span class="pp-badge">${nomeCategoria}</span>
          <h4>${planta.nome_popular || "Sem nome"}</h4>
          <p>${planta.nome_cientifico || ""}</p>
        </div>
      `;

      card.onclick = () => abrirDetalhes(planta);
      ppGrid.appendChild(card);
    });
  }

  // 7. BUSCA
  if (ppSearch) {
    ppSearch.oninput = (e) => {
      const termo = e.target.value.toLowerCase().trim();
      const filtradas = listaPlantas.filter(
        (p) =>
          (p.nome_popular && p.nome_popular.toLowerCase().includes(termo)) ||
          (p.nome_cientifico &&
            p.nome_cientifico.toLowerCase().includes(termo)),
      );
      renderizarPlantas(filtradas);
    };
  }

  // 8. EXIBIR DETALHES E TRATAR VISIBILIDADE DE BOTÕES RESTREITOS
  function abrirDetalhes(planta) {
    plantaSelecionadaId = planta.id_planta;
    document.getElementById("ppDetailName").textContent =
      planta.nome_popular || "";
    document.getElementById("ppDetailScientific").textContent =
      planta.nome_cientifico || "";
    document.getElementById("ppDetailCategory").textContent =
      planta.categoria_especimes?.nome_categoria || "Geral";
    document.getElementById("ppDetailInfo").textContent =
      planta.informacoes_adicionais || "Sem informações adicionais.";

    const imgDetail = document.getElementById("ppDetailImg");
    const placeholderDetail = document.getElementById("ppDetailPlaceholder");

    if (planta.foto_url) {
      imgDetail.src = planta.foto_url;
      imgDetail.removeAttribute("hidden");
      if (placeholderDetail) placeholderDetail.hidden = true;
    } else {
      imgDetail.src = "";
      imgDetail.hidden = true;
      if (placeholderDetail) placeholderDetail.hidden = false;
    }

    // Oculta/Exibe o botão de exclusão com base na permissão
    if (ppDetailDelete) {
      if (nivelAcessoUsuario === "USER") {
        ppDetailDelete.style.display = "none";
      } else {
        ppDetailDelete.style.display = "block";
      }
    }

    ppDetailOverlay.removeAttribute("hidden");
  }

  // 9. SALVAR PLANTA
  if (ppForm) {
    ppForm.onsubmit = async (e) => {
      e.preventDefault();

      if (nivelAcessoUsuario === "USER") {
        alert("Ação não permitida para seu nível de acesso.");
        return;
      }

      const nome_popular = document.getElementById("ppName").value.trim();
      const nome_cientifico = document
        .getElementById("ppScientific")
        .value.trim();
      const id_categoria = ppCategorySelect
        ? parseInt(ppCategorySelect.value)
        : null;
      const informacoes_adicionais = document
        .getElementById("ppInfo")
        .value.trim();

      if (!nome_popular) {
        alert("Por favor, preencha o nome popular da planta.");
        return;
      }

      if (ppBtnSubmit) {
        ppBtnSubmit.disabled = true;
        ppBtnSubmit.textContent = "Salvando...";
      }

      try {
        const payload = {
          nome_popular,
          nome_cientifico: nome_cientifico || null,
          id_categoria,
          informacoes_adicionais: informacoes_adicionais || null,
          foto_url: fotoBase64 || null,
        };

        const { error } = await _supabase.from("especimes").insert([payload]);

        if (error) throw error;

        fecharModalCadastro();
        await carregarPlantas();
      } catch (err) {
        console.error("Erro ao salvar planta:", err);
        alert("Erro ao salvar planta no banco: " + err.message);
      } finally {
        if (ppBtnSubmit) {
          ppBtnSubmit.disabled = false;
          ppBtnSubmit.textContent = "Salvar planta";
        }
      }
    };
  }

  // 10. EXCLUIR PLANTA
  if (ppDetailDelete) {
    ppDetailDelete.onclick = async () => {
      if (nivelAcessoUsuario === "USER") {
        alert("Ação não permitida para seu nível de acesso.");
        return;
      }

      if (!plantaSelecionadaId) return;

      if (confirm("Tem certeza que deseja excluir esta planta?")) {
        try {
          const { error } = await _supabase
            .from("especimes")
            .delete()
            .eq("id_planta", plantaSelecionadaId);

          if (error) throw error;

          fecharModalDetalhes();
          await carregarPlantas();
        } catch (err) {
          console.error("Erro ao excluir:", err);
          alert("Erro ao excluir planta: " + err.message);
        }
      }
    };
  }

  // Inicialização encadeada
  await verificarNivelAcesso();
  await carregarCategorias();
  await carregarPlantas();
});