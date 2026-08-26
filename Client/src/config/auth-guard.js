import { _supabase } from "./supabase.js";

export async function protegerRota() {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await _supabase.auth.getSession();

    if (sessionError || !session) {
      limparSessaoERedirecionar();
      return null;
    }

    const { data: perfil, error: perfilError } = await _supabase
      .from("cadastro")
      .select("nivel_acesso, status")
      .eq("id_conta", session.user.id)
      .maybeSingle();

    if (perfilError || !perfil || perfil.status === false) {
      console.warn("Perfil inválido, inativo ou não cadastrado.");
      await _supabase.auth.signOut();
      limparSessaoERedirecionar();
      return null;
    }

    const nivel = (perfil.nivel_acesso || "USER").toUpperCase();
    const eAdmin = nivel === "TI" || nivel === "AGRO";

    return {
      usuario: session.user,
      eAdmin: eAdmin,
      nivelAcesso: nivel,
    };
  } catch (err) {
    console.error("Erro no AuthGuard:", err);
    await _supabase.auth.signOut();
    limparSessaoERedirecionar();
    return null;
  }
}

function limparSessaoERedirecionar() {
  sessionStorage.clear();

  // Obtém o nome da página atual garantindo remoção de query params e hashs
  const paginaAtual = window.location.pathname.split("/").pop().toLowerCase();

  // Páginas públicas que não precisam de autenticação
  const paginasPublicas = ["index.html", "login.html", ""];

  // Se a página atual NÃO for uma página pública, redireciona para a tela de login (index.html)
  if (!paginasPublicas.includes(paginaAtual)) {
    window.location.replace("index.html");
  }
}
