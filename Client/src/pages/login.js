import { _supabase } from "../config/supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  sessionStorage.clear();

  const tabLogin = document.getElementById("tab-login");
  const tabCadastro = document.getElementById("tab-cadastro");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  // 1. ALTERNÂNCIA DE ABAS
  if (tabLogin && tabCadastro && loginForm && registerForm) {
    tabLogin.onclick = (e) => {
      e.preventDefault();
      tabLogin.classList.add("active");
      tabCadastro.classList.remove("active");
      loginForm.style.display = "block";
      registerForm.style.display = "none";
    };

    tabCadastro.onclick = (e) => {
      e.preventDefault();
      tabCadastro.classList.add("active");
      tabLogin.classList.remove("active");
      loginForm.style.display = "none";
      registerForm.style.display = "block";
    };
  }

  // 2. MOSTRAR/OCULTAR SENHA - LOGIN
  const btnToggle = document.getElementById("toggle-password");
  const passInput = document.getElementById("password");
  if (btnToggle && passInput) {
    btnToggle.onclick = (e) => {
      e.preventDefault();
      const isPass = passInput.type === "password";
      passInput.type = isPass ? "text" : "password";
      btnToggle.textContent = isPass ? "🙈" : "👁";
    };
  }

  // 3. MOSTRAR/OCULTAR SENHA - CADASTRO
  const btnToggleReg = document.getElementById("toggle-reg-password");
  const regPassInput = document.getElementById("reg-password");
  if (btnToggleReg && regPassInput) {
    btnToggleReg.onclick = (e) => {
      e.preventDefault();
      const isPass = regPassInput.type === "password";
      regPassInput.type = isPass ? "text" : "password";
      btnToggleReg.textContent = isPass ? "🙈" : "👁";
    };
  }

  // 4. SUBMISSÃO DE LOGIN
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      const errorMessage = document.getElementById("error-message");
      const btnSubmit = document.getElementById("btn-login");

      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      if (errorMessage) {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
      }

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Entrando...";
      }

      try {
        const { data: authData, error: authError } =
          await _supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (authError) throw new Error("E-mail ou senha incorretos.");

        const { data: usuarioCadastro, error: cadastroError } = await _supabase
          .from("cadastro")
          .select("status")
          .eq("id_conta", authData.user.id)
          .maybeSingle();

        if (
          cadastroError ||
          !usuarioCadastro ||
          usuarioCadastro.status === false
        ) {
          await _supabase.auth.signOut();
          throw new Error(
            "Sua conta está inativa ou não cadastrada no sistema.",
          );
        }

        window.location.replace("hub.html");
      } catch (error) {
        console.error("Erro no login:", error);
        if (errorMessage) {
          errorMessage.textContent = error.message;
          errorMessage.style.display = "block";
        }
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = "Entrar";
        }
      }
    };
  }

  // 5. SUBMISSÃO DE CADASTRO 
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();

      const regEmailInput = document.getElementById("reg-email");
      const regPasswordInput = document.getElementById("reg-password");
      const regErrorMsg = document.getElementById("reg-error-message");
      const btnRegister = document.getElementById("btn-register");

      const regEmail = regEmailInput ? regEmailInput.value.trim() : "";
      const regPassword = regPasswordInput ? regPasswordInput.value : "";

      // Reset de mensagens de erro
      if (regErrorMsg) {
        regErrorMsg.textContent = "";
        regErrorMsg.style.display = "none";
        regErrorMsg.style.color = "red";
      }

      // --- VALIDAÇÕES DE LIMITE E REGRAS DE SENHA ---
      if (!regEmail || !regPassword) {
        exibirErroCadastro("Preencha todos os campos obrigatórios.");
        return;
      }

      // Limite mínimo
      if (regPassword.length < 6) {
        exibirErroCadastro("A senha deve ter no mínimo 6 caracteres.");
        return;
      }

      // Limite máximo
      if (regPassword.length > 20) {
        exibirErroCadastro("A senha deve ter no máximo 20 caracteres.");
        return;
      }

      // (Opcional) Regra extra: Exigir ao menos um número
      const temNumero = /\d/.test(regPassword);
      if (!temNumero) {
        exibirErroCadastro("A senha deve conter pelo menos um número.");
        return;
      }

      if (btnRegister) {
        btnRegister.disabled = true;
        btnRegister.textContent = "Cadastrando...";
      }

      try {
        const { data, error: authError } = await _supabase.auth.signUp({
          email: regEmail,
          password: regPassword,
        });

        if (authError) throw authError;

        // Trata usuário já existente quando o Supabase não lança erro explícito
        if (
          data?.user &&
          data.user.identities &&
          data.user.identities.length === 0
        ) {
          throw new Error("User already registered");
        }

        if (regErrorMsg) {
          regErrorMsg.style.color = "green";
          regErrorMsg.textContent = "Conta criada com sucesso! Faça login.";
          regErrorMsg.style.display = "block";
        }

        setTimeout(() => {
          if (tabLogin) tabLogin.click();
        }, 2000);
      } catch (err) {
        console.error("Erro no cadastro:", err);

        let msg = err.message || "";
        if (
          msg.includes("User already registered") ||
          msg.includes("already exists") ||
          (err.status === 400 && msg.includes("already"))
        ) {
          exibirErroCadastro(
            "Este e-mail já está cadastrado. Faça login ou use outro e-mail.",
          );
        } else if (msg.includes("Password should be at least")) {
          exibirErroCadastro("A senha deve conter pelo menos 6 caracteres.");
        } else {
          exibirErroCadastro(
            "Ocorreu um erro ao criar a conta. Tente novamente.",
          );
        }
      } finally {
        if (btnRegister) {
          btnRegister.disabled = false;
          btnRegister.textContent = "Criar Conta";
        }
      }
    };
  }

  // Função auxiliar para exibir os erros de cadastro
  function exibirErroCadastro(mensagem) {
    const regErrorMsg = document.getElementById("reg-error-message");
    if (regErrorMsg) {
      regErrorMsg.style.color = "red";
      regErrorMsg.textContent = mensagem;
      regErrorMsg.style.display = "block";
    }
  }
});
