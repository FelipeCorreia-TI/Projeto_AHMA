import { _supabase } from "../config/supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const ppGrid = document.getElementById("ppGrid");
  const ppEmpty = document.getElementById("ppEmpty");
  const ppSearch = document.getElementById("ppSearch");
  const ppBtnAdd = document.getElementById("ppBtnAdd");

  const ppFormOverlay = document.getElementById("ppFormOverlay");
  const ppFormClose = document.getElementById("ppFormClose");
  const ppFormCancel = document.getElementById("ppFormCancel");
  const ppForm = document.getElementById("ppForm");

  const ppDetailOverlay = document.getElementById("ppDetailOverlay");
  const ppDetailClose = document.getElementById("ppDetailClose");
  const ppDetailDelete = document.getElementById("ppDetailDelete");

  let listaPlantas = [];
  let plantaSelecionadaId = null;

  // 1. MODAL CADASTRO
  if (ppBtnAdd) {
    ppBtnAdd.onclick = () => {
      ppForm.reset();
      ppFormOverlay.removeAttribute("hidden");
    };
  }

  const fecharModalCadastro = () =>
    ppFormOverlay.setAttribute("hidden", "true");
  if (ppFormClose) ppFormClose.onclick = fecharModalCadastro;
  if (ppFormCancel) ppFormCancel.onclick = fecharModalCadastro;

  // MODAL DETALHES
  const fecharModalDetalhes = () =>
    ppDetailOverlay.setAttribute("hidden", "true");
  if (ppDetailClose) ppDetailClose.onclick = fecharModalDetalhes;

  // 2. BUSCA NO BANCO
  async function carregarPlantas() {
    try {
      const { data, error } = await _supabase
        .from("plantas")
        .select("*")
        .order("id", { ascending: false });

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

  // 3. RENDERIZAÇÃO USANDO CARDS NATIVOS DA PLANTOPÉDIA
  function renderizarPlantas(plantas) {
    ppGrid.innerHTML = "";

    if (!plantas || plantas.length === 0) {
      ppEmpty.hidden = false;
      ppEmpty.textContent =
        "Nenhuma planta encontrada. Que tal adicionar a primeira?";
      return;
    }

    ppEmpty.hidden = true;

    plantas.forEach((planta) => {
      const card = document.createElement("article");
      card.className = "pp-card";

      card.innerHTML = `
        <div class="pp-card-photo">
          ${planta.foto_url ? `<img src="${planta.foto_url}" alt="${planta.nome}">` : "🌱"}
        </div>
        <div class="pp-card-body">
          <span class="pp-badge">${planta.categoria || "Geral"}</span>
          <h4>${planta.nome || "Sem nome"}</h4>
          <p>${planta.nome_cientifico || ""}</p>
        </div>
      `;

      card.onclick = () => abrirDetalhes(planta);
      ppGrid.appendChild(card);
    });
  }

  // 4. PESQUISA
  if (ppSearch) {
    ppSearch.oninput = (e) => {
      const termo = e.target.value.toLowerCase().trim();
      const filtradas = listaPlantas.filter(
        (p) =>
          (p.nome && p.nome.toLowerCase().includes(termo)) ||
          (p.nome_cientifico &&
            p.nome_cientifico.toLowerCase().includes(termo)),
      );
      renderizarPlantas(filtradas);
    };
  }

  // 5. EXIBIR DETALHES
  function abrirDetalhes(planta) {
    plantaSelecionadaId = planta.id;
    document.getElementById("ppDetailName").textContent = planta.nome || "";
    document.getElementById("ppDetailScientific").textContent =
      planta.nome_cientifico || "";
    document.getElementById("ppDetailCategory").textContent =
      planta.categoria || "";
    document.getElementById("ppDetailInfo").textContent =
      planta.informacoes || "Sem informações adicionais.";

    ppDetailOverlay.removeAttribute("hidden");
  }

  // 6. ADICIONAR PLANTA
  if (ppForm) {
    ppForm.onsubmit = async (e) => {
      e.preventDefault();

      const nome = document.getElementById("ppName").value.trim();
      const nome_cientifico = document
        .getElementById("ppScientific")
        .value.trim();
      const categoria = document.getElementById("ppCategory").value;
      const informacoes = document.getElementById("ppInfo").value.trim();

      try {
        const { error } = await _supabase.from("plantas").insert([
          {
            nome,
            nome_cientifico,
            categoria,
            informacoes,
          },
        ]);

        if (error) throw error;

        fecharModalCadastro();
        await carregarPlantas();
      } catch (err) {
        console.error("Erro ao salvar planta:", err);
        alert("Erro ao salvar planta: " + err.message);
      }
    };
  }

  // 7. EXCLUIR PLANTA
  if (ppDetailDelete) {
    ppDetailDelete.onclick = async () => {
      if (!plantaSelecionadaId) return;

      if (confirm("Tem certeza que deseja excluir esta planta?")) {
        try {
          const { error } = await _supabase
            .from("plantas")
            .delete()
            .eq("id", plantaSelecionadaId);

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

  carregarPlantas();
});
