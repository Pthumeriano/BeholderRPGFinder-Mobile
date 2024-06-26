import { api } from ".";
import { buscarTema } from "../api/tema";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserData } from "../utils/auth";

export const criarNovoUsuario = async (data) => {
  try {
    const userData = { ...data };
    if (!data.datanascimento) {
      delete userData.datanascimento;
    }

    const response = await api.post("/usuarios", userData);
    return response;
  } catch (error) {
    console.error("Erro na solicitação:", error);
    throw error;
  }
};



export const autenticar = async (data) => {
  const response = await api.post(
    "usuarios/login",
    {
      email: data.email,
      senha: data.senha,
    },
    {
      withCredentials: true,
    }
  );

  console.log("Usuário autenticado com sucesso:", response.data.token);
  return response.data.token;
};

export const listarTemasFavoritos = async () => {
  return await api.get("usuarios/temas/listar");
};

export const getUsuarioTemaPorId = async (id) => {
  try {
    const temasResponse = await api.get(`usuarios/temas/listar/${id}`);
    const temas = temasResponse.data;

    if (!Array.isArray(temas)) {
      throw new Error("Data is not an array");
    }

    const temasComNomes = await Promise.all(
      temas.map(async (tema) => {
        const temaDetalhado = await buscarTema(tema.idtema);
        return temaDetalhado.data[0].nome;
      })
    );

    return temasComNomes;
  } catch (error) {
    console.error("Erro ao buscar temas: ", error);
    return []; // Return an empty array in case of an error
  }
};

export const listarUsuarios = async () => {
  return await api.get("/usuarios");
};


export const getUsuarioPorId = async (id) => {
  return await api.get(`/usuario/${id}`);
};

export const entrarNaMesa = async (mesaId) => {
  try {
    // Obtenha o token do AsyncStorage
    const token = await AsyncStorage.getItem('BeholderToken');
    
    // Verifique se há um token antes de fazer a solicitação
    if (!token) {
      alert('É necessário estar logado para entrar em uma mesa');
      return;
    }
    
    // Configure o cabeçalho com o token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };
    
    const response = await api.post(
      `/usuarios/entrar-na-mesa/${mesaId}`,
      null,
      config
    );
    
    return response;
  } catch (error) {
    console.error('Erro ao entrar na mesa:', error);
    throw error;
  }
};

export const sairDaMesa = async (mesaId) => {
  try {
    // Obtenha o token do AsyncStorage
    const token = await AsyncStorage.getItem('BeholderToken');
    
    // Verifique se há um token antes de fazer a solicitação
    if (!token) {
      alert('É necessário estar logado para para sair da mesa');
      return;
    }
    
    // Configure o cabeçalho com o token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };
    
    const response = await api.post(
      `/usuarios/sair-da-mesa/${mesaId}`,
      config
    );
    
    return response;
  } catch (error) {
    console.error('Erro ao sair na mesa:', error);
    throw error;
  } 
};

export const mostrarUsuario = async (id) => {
  return await api.get(`/usuario/${id}`);
};

export const editarPerfil = async (camposEditados) => {
  try {
    const userData = fetchUserData();
    const userId = userData.id
    const token = await AsyncStorage.getItem('BeholderToken');

    console.log("ID editar perfil: ", userData);
    console.log("Token editar perfil: ", token)
    console.log("Campos editados: ", camposEditados)
    const response = await api.patch(`/usuarios/atualizar/`, {userId, ...camposEditados}, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const excluirPerfil = async (senha) => {
  try {
    // Obtenha o token do AsyncStorage
    const token = await AsyncStorage.getItem('BeholderToken');

    // Verifique se há um token antes de fazer a solicitação
    if (!token) {
      alert('Você não tem permissão para excluir este perfil, esta ação foi reportada');
      return;
    }

    // Configure o cabeçalho com o token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
      data: { senha },
    };

    const response = await api.delete(`/usuarios/excluir`, config);

    console.log("RESPONSE: ", response)

    return response.data;
  } catch (error) {
    console.error('Erro ao excluir perfil:', error);
    throw error;
  }
};