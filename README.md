# 📖 ListaLocal - Backend

ListaLocal é uma plataforma que permite aos usuários encontrar empresas de forma fácil e por filtro de cidades. As empresas podem se cadastrar na plataforma, onde informações como nome da empresa, endereço, WhatsApp e Instagram serão exibidas. Além disso, a plataforma apresenta um banner de empresas em destaque.

## Funcionalidades

- **Busca por Filtro de Cidades**: Os usuários podem pesquisar empresas com base na cidade em que estão localizados.
  
- **Cadastro de Empresas**: As empresas podem se cadastrar na plataforma e fornecer informações como nome da empresa, endereço, WhatsApp e Instagram.

- **Banner de Empresas em Destaque**: Algumas empresas serão destacadas em um banner na plataforma, proporcionando maior visibilidade.


### Backend

O diretório `lista-local-backend` contém todos os arquivos relacionados ao backend da aplicação. Aqui estão os principais componentes e pastas:

- **config**: Contém arquivos de configuração para o servidor e outras configurações relacionadas.

- **controllers**: Contém os controladores responsáveis por lidar com as requisições HTTP e processar os dados.

- **models**: Contém os modelos de dados que representam as entidades do sistema.

- **routes**: Contém os arquivos de roteamento que definem os endpoints da API.

### End-points

- Para cadastro utiliza-se o seguinte endpoint
https://lista-local-backend.onrender.com/api/usuarios

- Para login utiliza-se o seguinte endpoint
https://lista-local-backend.onrender.com/api/usuarios/login

- Para buscar todos os usuarios utiliza-se o seguinte endpoint
https://lista-local-backend.onrender.com/api/usuarios 

## Tecnologias Utilizadas

  
- Backend: [Node.js](https://nodejs.org/) com [Express](https://expressjs.com/)

- Banco de Dados: [MongoDB](https://www.mongodb.com/)


