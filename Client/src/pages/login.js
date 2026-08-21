import { _supabase } from "../config/supabase.js";

document.addEventListener("DOMContentLoaded", async () => {
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorMessage = document.getElementById("error-message");
  const btnTogglePassword = document.getElementById("toggle-password");

  // 1. Alternar visibilidade da senha (Mostrar / Ocultar)
  if (btnTogglePassword && passwordInput) {
    btnTogglePassword.addEventListener("click", (e) => {
      e.preventDefault();
      const tipoAtual = passwordInput.getAttribute("type");
      if (tipoAtual === "password") {
        passwordInput.setAttribute("type", "text");
        btnTogglePassword.textContent = "🙈";
      } else {
        passwordInput.setAttribute("type", "password");
        btnTogglePassword.textContent = "👁";
      }
    });
  }

  // 2. Se já existir uma sessão ativa no Supabase, envia direto para o HUB
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
      window.location.replace("index.html");
      return;
    }
  } catch (err) {
    console.error("Erro ao checar sessão ativa:", err);
  }

  // 3. Processamento do evento de Login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      // Impede o envio padrao do formulário HTML para não colocar os dados na URL
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (errorMessage) {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
      }

      const btnSubmit = document.getElementById("btn-login");
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Entrando...";
      }

      try {
        // Autentica via Supabase Auth
        const { data: authData, error: authError } = await _supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          throw new Error("E-mail ou senha incorretos.");
        }

        // Consulta o status do usuário na tabela 'cadastro' usando 'id_conta'
        const { data: usuarioCadastro, error: cadastroError } = await _supabase
          .from("cadastro")
          .select("status, nivel_acesso")
          .eq("id_conta", authData.user.id)
          .single();

        // Se houver restrição de status (ex: conta inativa)
        if (cadastroError || (usuarioCadastro && usuarioCadastro.status === false)) {
          await _supabase.auth.signOut();
          throw new Error("Sua conta está inativa ou não cadastrada no sistema.");
        }

        // Login aprovado -> Redireciona substituindo no histórico para bloquear o botão "Voltar"
        window.location.replace("index.html");

      } catch (error) {
        console.error("Erro na autenticação:", error);
        
        if (errorMessage) {
          errorMessage.textContent = error.message || "Erro ao tentar realizar login.";
          errorMessage.style.display = "block";
        } else {
          alert(error.message);
        }
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = "Entrar";
        }
      }
    });
  }
});