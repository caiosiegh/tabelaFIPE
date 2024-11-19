let marcas = [];
let modelos = [];
let anos = [];

// Carregar marcas de motos
async function carregarMotos() {
  try {
    const resposta = await fetch(
      "https://parallelum.com.br/fipe/api/v1/motos/marcas"
    );
    const dados = await resposta.json();
    const dataList = document.getElementById("motos");

    dataList.innerHTML = ""; // Limpar as opções anteriores

    // Armazenar as marcas e adicionar as opções no datalist
    dados.forEach((moto) => {
      marcas.push({ nome: moto.nome, codigo: moto.codigo });
      const option = document.createElement("option");
      option.value = moto.nome;
      dataList.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar as marcas:", error);
  }
}

// Carregar modelos de uma marca escolhida
async function carregarModelos() {
  const marcaNome = document.getElementById("motoEscolhida").value;

  if (!marcaNome) {
    return;
  }

  const marcaSelecionada = marcas.find((moto) => moto.nome === marcaNome);

  if (!marcaSelecionada) {
    console.error("Marca não encontrada");
    return;
  }

  const marcaCodigo = marcaSelecionada.codigo;

  try {
    const resposta = await fetch(
      `https://parallelum.com.br/fipe/api/v1/motos/marcas/${marcaCodigo}/modelos`
    );
    const dados = await resposta.json();
    const dataList = document.getElementById("modelo");

    dataList.innerHTML = ""; // Limpar modelos anteriores

    if (dados && dados.modelos) {
      dados.modelos.forEach((modelo) => {
        modelos.push({ nome: modelo.nome, codigo: modelo.codigo });
        const option = document.createElement("option");
        option.value = modelo.nome;
        dataList.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar os modelos:", error);
  }
}

async function carregarAnos() {
  const marcaNome = document.getElementById("motoEscolhida").value;
  const modeloNome = document.getElementById("modeloMoto").value;

  const marcaSelecionada = marcas.find((moto) => moto.nome === marcaNome);
  const modeloSelecionado = modelos.find(
    (modelo) => modelo.nome === modeloNome
  );

  if (!marcaSelecionada || !modeloSelecionado) {
    console.error("Marca ou Modelo não encontrados");
    return;
  }

  const marcaCodigo = marcaSelecionada.codigo;
  const modeloCodigo = modeloSelecionado.codigo;

  try {
    // Realizar a requisição para os anos
    const resposta = await fetch(
      `https://parallelum.com.br/fipe/api/v1/motos/marcas/${marcaCodigo}/modelos/${modeloCodigo}/anos`
    );
    const dados = await resposta.json();

    // Verifique o que é retornado pela API
    console.log("Resposta da API para anos:", dados);

    const dataList = document.getElementById("anoMoto");
    dataList.innerHTML = ""; // Limpar os anos anteriores

    const anos = [];

    if (Array.isArray(dados) && dados.length > 0) {
      dados.forEach((ano) => {
        anos.push({ codigo: ano.codigo, nome: ano.nome });

        // Criar um novo option para cada ano
        const option = document.createElement("option");
        option.value = ano.nome; // O valor visível será o nome do ano
        option.dataset.codigo = ano.codigo; // Armazenar o código no atributo data

        dataList.appendChild(option); // Adicionar a opção ao datalist
      });
    } else {
      console.log("Nenhum ano encontrado.");
    }

    // Armazenando os anos no objeto global (se precisar usar em outra parte)
    window.anos = anos;
  } catch (error) {
    console.error("Erro ao carregar os anos:", error);
  }
}

async function consultarMoto() {
  // Captura a marca, o modelo e o ano selecionados
  const marcaNome = document.getElementById("motoEscolhida").value;
  const modeloNome = document.getElementById("modeloMoto").value;
  const anoNome = document.getElementById("anoMotoInput").value; // A variável do ano visível (nome)

  // Encontrar o código da marca
  const marcaSelecionada = marcas.find((moto) => moto.nome === marcaNome);
  if (!marcaSelecionada) {
    console.error("Marca não encontrada");
    return;
  }

  // Encontrar o código do modelo
  const modeloSelecionado = modelos.find(
    (modelo) => modelo.nome === modeloNome
  );
  if (!modeloSelecionado) {
    console.error("Modelo não encontrado");
    return;
  }

  // Encontrar o código do ano
  const anoSelecionado = window.anos.find((ano) => ano.nome === anoNome); // 'window.anos' é onde você armazenou os anos
  if (!anoSelecionado) {
    console.error("Ano não encontrado");
    return;
  }

  // Agora temos o código de marca, modelo e ano
  const marcaCodigo = marcaSelecionada.codigo;
  const modeloCodigo = modeloSelecionado.codigo;
  const anoCodigo = anoSelecionado.codigo; // Usar o código do ano

  try {
    // Construir a URL para a API com a marca, modelo e ano
    const url = `https://parallelum.com.br/fipe/api/v1/motos/marcas/${marcaCodigo}/modelos/${modeloCodigo}/anos/${anoCodigo}`;

    // Fazer a requisição para a API
    const resposta = await fetch(url);
    const dados = await resposta.json();

    // Verificar a resposta da API
    console.log("Dados recebidos da API:", dados);
    document.getElementById("tabelaFIPE").innerHTML = `<pre>Marca: ${
      dados.Marca
    }\nModelo: ${dados.Modelo}\nAno: ${dados.AnoModelo}\nPreço: ${
      dados.Valor
    }\nMês de Referência: ${
      dados.MesReferencia[0].toUpperCase() + dados.MesReferencia.substring(1)
    }<pre>`;

    // Agora você pode usar esses dados como necessário
  } catch (error) {
    console.error("Erro ao consultar a API:", error);
  }
}

// Atualizar modelos ao escolher a marca
document.getElementById("motoEscolhida").addEventListener("input", () => {
  modelos = []; // Limpar modelos antes de recarregar
  document.getElementById("modelo").innerHTML = ""; // Limpar datalist de modelos
  document.getElementById("anoMoto").innerHTML = ""; // Limpar datalist de anos
  carregarModelos();
});

// Atualizar anos ao escolher o modelo
document.getElementById("modeloMoto").addEventListener("input", () => {
  anos = []; // Limpar anos antes de recarregar
  document.getElementById("anoMoto").innerHTML = ""; // Limpar datalist de anos
  carregarAnos();
});

// Carregar as marcas ao iniciar
carregarMotos();
document
  .getElementById("consultarBtn")
  .addEventListener("click", consultarMoto);
