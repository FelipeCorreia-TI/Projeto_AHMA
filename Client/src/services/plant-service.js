//Aqui será criado a lógica por trás do SELECT para as informações do DB

const PlantService = {
  async listarPlantas() {
    const { data, error } = await _supabase
      .from("especimes")
      .select(
        `
            id_planta,
            nome_popular,
            nome_cientifico,
            informacoes_adicionais,
            foto_url,
            categoria_especimes(
                id_categoria,
                nome_categoria
            )
            `,
      )
      .order("id_planta", { ascending: false });

    if (error) {
      console.error("Erro no supabase ao listar plantas:", error.message);
      throw error;
    }
    return data;
  },
  async listarCategorias() {
    const { data, error } = await _supabase
      .from("categoria_especimes")
      .select("id_categoria, nome_categoria");

    if (error) throw error;
    return data;
  },
  async adicionaPlanta(dadosPlanta) {
    const { data, error } = await _supabase
      .from("especimes")
      .insert([
        {
          nome_popular: dadosPlanta.nome_popular,
          nome_cientifico: dadosPlanta.nome_cientifico,
          informacoes_adicionais: dadosPlanta.informacoes_adicionais,
          id_categoria: dadosPlanta.id_categoria,
          foto_url: dadosPlanta.foto_url || null,
        },
      ])
      .select();
    if (error) {
      console.error("Erro ao salvar planta no Supabase:", error.message);
      throw error;
    }
    return data;
  },
  async deletarPlanta(id) {
    const { error } = await _supabase
      .from("especimes")
      .delete()
      .eq("id_planta", id);
    if (error) {
      console.error("Erro ao deletar a planta:", error.message);
      throw true;
    }
    return true;
  },
  async enviarFoto(arquivo) {
    if (!arquivo) return null;

    const nomeArquivo = `${Date.now()}_${arquivo.name}`;

    const { data, error } = await _supabase.storage
      .from("plantas-fotos")
      .upload(nomeArquivo, arquivo);

    if (error) {
      console.error("Erro ao enviar foto para o Storage:", error.message);
      throw error;
    }

    const { data: publicUrlData } = _supabase.storage
      .from("plantas-fotos")
      .getPublicUrl(nomeArquivo);

    return publicUrlData.publicUrl;
  },
  // No src/services/plant-service.js

  async deletarFotoStorage(fotoUrl) {
    if (!fotoUrl) return;

    try {
      // 1. Remove qualquer parâmetro de busca no final da URL (ex: ?t=2026-08-17...)
      const urlLimpa = fotoUrl.split("?")[0];

      // 2. Extrai apenas o nome exato do arquivo após a última barra '/'
      const nomeArquivo = urlLimpa.substring(urlLimpa.lastIndexOf("/") + 1);

      if (!nomeArquivo) return;

      // 3. Executa a remoção no bucket correto
      const { data, error } = await _supabase.storage
        .from("plantas-fotos")
        .remove([nomeArquivo]);

      if (error) {
        console.error("Erro ao deletar imagem do Storage:", error.message);
      } else {
        console.log("Imagem removida com sucesso do Storage:", data);
      }
    } catch (err) {
      console.error("Falha ao processar deleção da foto:", err);
    }
  },
};
