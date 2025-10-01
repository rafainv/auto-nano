const deploy = async () => {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepository = process.env.GITHUB_REPOSITORY;

    if (!githubToken || !githubRepository) {
      throw new Error("Token do GitHub ou repositório não estão definidos.");
    }

    const response = await fetch(
      `https://api.github.com/repos/${githubRepository}/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${githubToken}`, // Token de autenticação
          "X-GitHub-Api-Version": "2022-11-28", // Versão da API
        },
        body: JSON.stringify({
          event_type: "Deploy", // Tipo de evento
          client_payload: {
            unit: false,
            integration: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao acionar o Deploy: ${response.status} ${response.statusText}`
      );
    }

    console.log("Deploy acionado com sucesso!");
  } catch (error) {
    console.error(
      "Erro ao acionar o deploy:",
      error.response ? error.response.data : error.message
    );
  }
};

module.exports = deploy;

