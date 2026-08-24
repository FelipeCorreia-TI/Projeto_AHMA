import { _supabase } from "./supabase.js";

export async function protegerRota() {
  try {
    const { data: { session }, error: sessionError } = await _supabase.auth.getSession();

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
  const paginaAtual = window.location.pathname.split("/").pop();
  if (paginaAtual !== "index.html" && paginaAtual !== "") {
    window.location.replace("index.html");
  }
}