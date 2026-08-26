import { _supabase } from './supabase.js';

/**
 * Verifica a sessão ativa e consulta a tabela de contas para identificar o nível de acesso
 */
export async function obterSessaoEPerfil() {
  const { data: { session } } = await _supabase.auth.getSession();

  if (!session) {
    return { autenticado: false, eAdmin: false, usuario: null, nivelAcesso: null };
  }

  try {
    // Busca o nivel_acesso na tabela do banco usando o ID do usuário autenticado
    const { data: perfil, error } = await _supabase
      .from('contas') // substitua 'contas' pelo nome exato da sua tabela, se for diferente
      .select('nivel_acesso, status')
      .eq('id_conta', session.user.id)
      .single();

    if (error || !perfil || !perfil.status) {
      return { autenticado: true, eAdmin: false, usuario: session.user, nivelAcesso: null };
    }

    // Valida se o perfil é TI ou AGRO
    const eAdmin = perfil.nivel_acesso === 'TI' || perfil.nivel_acesso === 'AGRO';

    return {
      autenticado: true,
      eAdmin,
      usuario: session.user,
      nivelAcesso: perfil.nivel_acesso
    };
  } catch (err) {
    console.error('Erro ao consultar nível de acesso:', err);
    return { autenticado: true, eAdmin: false, usuario: session.user, nivelAcesso: null };
  }
}

/**
 * Trava de rota: Redireciona para login.html se não houver sessão
 */
export async function protegerRota() {
  const { autenticado, eAdmin, usuario, nivelAcesso } = await obterSessaoEPerfil();
  const paginaAtual = window.location.pathname.split('/').pop();

  if (!autenticado && paginaAtual !== 'login.html') {
    window.location.href = 'login.html';
    return null;
  }

  if (autenticado && (paginaAtual === 'login.html' || paginaAtual === '')) {
    window.location.href = 'index.html';
    return null;
  }

  return { usuario, eAdmin, nivelAcesso };
}